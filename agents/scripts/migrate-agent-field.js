#!/usr/bin/env node

// Migrate legacy `agent:` frontmatter field on tickets into the new
// `assignee:` + `role:` pair. Idempotent; safe to re-run.
//
// Usage:
//   node main/agents/scripts/migrate-agent-field.js            # apply
//   node main/agents/scripts/migrate-agent-field.js --dry-run  # report only

const fs = require("fs");
const path = require("path");
const { LEGACY_AGENT_MAP } = require("../orchestrator/constants");

const repoRoot = path.resolve(__dirname, "..", "..", "..");
const ticketsDir = path.join(repoRoot, "tickets");
const STATUSES = ["backlog", "todo", "in-review", "approved", "done"];

const dryRun = process.argv.includes("--dry-run");

function readUtf8(p) { return fs.readFileSync(p, "utf8").replace(/^﻿/, ""); }
function writeUtf8(p, c) { fs.writeFileSync(p, c, "utf8"); }

function normalizeLegacy(value) {
  return String(value || "").trim().toLowerCase();
}

function mapLegacy(legacyRaw) {
  const key = normalizeLegacy(legacyRaw);
  if (LEGACY_AGENT_MAP[key]) return LEGACY_AGENT_MAP[key];

  // Fuzzy fallbacks for free-form legacy values.
  if (key.includes("i18n") || key.includes("gpt-oss")) return { assignee: "gemini", role: "developer" };
  if (key.includes("opus")) return { assignee: "opus-4.7", role: "developer" };
  if (key.includes("gemini")) return { assignee: "gemini", role: "developer" };
  if (key.includes("codex")) return { assignee: "codex", role: "developer" };
  if (key.includes("designer")) return { assignee: "claude-sonnet-4-6", role: "designer" };
  if (key.includes("marketing")) return { assignee: "claude-sonnet-4-6", role: "marketing" };
  if (key.includes("developer")) return { assignee: "unassigned", role: "developer" };

  return null;
}

function listFiles() {
  const out = [];
  for (const status of STATUSES) {
    const dir = path.join(ticketsDir, status);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (/^TICKET-\d{3}-.+\.md$/.test(name)) out.push({ status, name, path: path.join(dir, name) });
    }
  }
  return out;
}

const report = { migrated: [], alreadyMigrated: [], skipped: [], failures: [] };

for (const file of listFiles()) {
  const content = readUtf8(file.path);
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    report.skipped.push({ name: file.name, reason: "no frontmatter" });
    continue;
  }

  const fmRaw = match[1];
  const fmLines = fmRaw.split(/\r?\n/);
  const data = {};
  for (const line of fmLines) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) data[kv[1]] = kv[2];
  }

  const hasAssignee = !!data.assignee;
  const hasRole = !!data.role;
  const legacy = data.agent;

  if (hasAssignee && hasRole) {
    report.alreadyMigrated.push(file.name);
    continue;
  }

  if (!legacy) {
    report.skipped.push({ name: file.name, reason: "no legacy agent field and no assignee/role" });
    continue;
  }

  const mapped = mapLegacy(legacy);
  if (!mapped) {
    report.failures.push({ name: file.name, legacy });
    continue;
  }

  const newLines = [];
  let injectedAssignee = hasAssignee;
  let injectedRole = hasRole;
  let droppedAgent = false;

  for (const line of fmLines) {
    if (/^agent:\s*/.test(line)) {
      // Replace the agent line with the two new fields (if not already present).
      if (!injectedAssignee) {
        newLines.push(`assignee: ${mapped.assignee}`);
        injectedAssignee = true;
      }
      if (!injectedRole) {
        newLines.push(`role: ${mapped.role}`);
        injectedRole = true;
      }
      droppedAgent = true;
      continue;
    }
    newLines.push(line);
  }

  if (!droppedAgent) {
    // Should not happen given the early return above; defensive guard.
    if (!injectedAssignee) newLines.unshift(`assignee: ${mapped.assignee}`);
    if (!injectedRole) newLines.unshift(`role: ${mapped.role}`);
  }

  const nextContent = content.replace(match[0], `---\n${newLines.join("\n")}\n---\n`);

  report.migrated.push({ name: file.name, legacy, ...mapped });

  if (!dryRun) writeUtf8(file.path, nextContent);
}

console.log(`Migration ${dryRun ? "(dry-run)" : "(applied)"}: ${report.migrated.length} migrated, ${report.alreadyMigrated.length} already, ${report.skipped.length} skipped, ${report.failures.length} failed.`);
if (report.migrated.length) {
  console.log("\nMigrated:");
  for (const row of report.migrated) console.log(`  ${row.name}: ${row.legacy} → assignee=${row.assignee}, role=${row.role}`);
}
if (report.failures.length) {
  console.log("\nFailures (no mapping):");
  for (const row of report.failures) console.log(`  ${row.name}: legacy=${row.legacy}`);
  process.exit(1);
}
if (report.skipped.length) {
  console.log("\nSkipped:");
  for (const row of report.skipped) console.log(`  ${row.name}: ${row.reason}`);
}
