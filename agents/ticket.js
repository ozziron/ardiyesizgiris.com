#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { ASSIGNEES, ROLES } = require("./orchestrator/constants");
const { fail, today, parseArgs } = require("./lib/cli-helpers");
const { slugify, normalizeText, normalizedName } = require("./lib/text");
const {
  readUtf8,
  writeUtf8,
  parseFrontmatter,
  serializeFrontmatter,
  updateFrontmatter,
  sectionContent,
  hasMeaningfulSection,
} = require("./lib/frontmatter");
const {
  inferType,
  inferRole,
  parseRoadmapTasks,
  roadmapTicketBody,
} = require("./lib/roadmap");
const {
  REQUIRED_REVIEW_SECTIONS,
  REQUIRED_REVIEW_SECTIONS_V1,
  REQUIRED_REVIEW_SECTIONS_V2,
  validateAssignee,
  validateRole,
  validateReviewReady,
  validateDoneReady,
  ticketAssigneeRole,
  ticketAssignee,
} = require("./lib/validation");
const sessionLib = require("./lib/session");
const requestLib = require("./lib/request");

// v2: `approved` removed (was unused in practice). Worker → todo → in-review →
// done is the only path; Opus-only `done` gate is enforced by convention.
const STATUSES = ["backlog", "todo", "in-review", "done"];
const PRIORITIES = ["P0", "P1", "P2", "P3"];
const TYPES = ["feature", "fix", "refactor", "docs", "chore"];

const repoRoot = path.resolve(__dirname, "..", "..");
const ticketsDir = path.join(repoRoot, "tickets");
const activityLogPath = path.join(repoRoot, "main", "agents", "ACTIVITY_LOG.md");

function resolveAssigneeRole(flags) {
  if (flags.agent) {
    console.warn("WARN: --agent is removed in v2; use --assignee and --role instead.");
  }
  return { assignee: flags.assignee || null, role: flags.role || null };
}

function usage(exitCode = 0) {
  console.log(`
Ticket & Session CLI

Tickets:
  node agents/ticket.js new "Başlık" [--priority P1] [--type fix] [--assignee opus] [--role developer]
  node agents/ticket.js start TICKET-004 [--assignee gemini] [--role developer]
  node agents/ticket.js backlog TICKET-004
  node agents/ticket.js review TICKET-004
  node agents/ticket.js done TICKET-004 --reviewer opus [--commit abc123] [--note "Kapanış notu"]
  node agents/ticket.js sync-roadmap main/roadmap.md [--assignee gemini --role developer] [--start]
  node agents/ticket.js enrich-roadmap-tickets main/roadmap.md [--assignee gemini --role developer] [--force]
  node agents/ticket.js check

Sessions:
  node agents/ticket.js session start "Session Başlığı" [--tickets TICKET-001,TICKET-002] [--assignee gemini] [--role developer] [--branch name]
  node agents/ticket.js session end [--commit abc123] [--status done|in-review]
  node agents/ticket.js session list
  node agents/ticket.js session current

Requests (kullanıcı talepleri):
  node agents/ticket.js request new "Başlık" --body "Talep metni" [--body-file path.txt]
  node agents/ticket.js request list [--status pending|promoted|rejected]
  node agents/ticket.js request promote REQ-001 [--title override] --priority P1 --type fix --assignee opus --role developer
  node agents/ticket.js request reject REQ-001 --reason "Kapsam dışı"

Assignees: ${ASSIGNEES.join(", ")}
Roles:     ${ROLES.join(", ")}

The legacy --agent flag is accepted as a deprecated alias and mapped to assignee+role.
`);
  process.exit(exitCode);
}

function ensureStructure() {
  if (!fs.existsSync(ticketsDir)) {
    fail(`tickets directory not found: ${ticketsDir}`);
  }

  for (const status of STATUSES) {
    const statusDir = path.join(ticketsDir, status);
    if (!fs.existsSync(statusDir)) {
      fs.mkdirSync(statusDir, { recursive: true });
    }
  }
}

function listTicketFiles() {
  ensureStructure();
  const files = [];

  for (const status of STATUSES) {
    const dir = path.join(ticketsDir, status);
    for (const name of fs.readdirSync(dir)) {
      if (/^TICKET-\d{3}-.+\.md$/.test(name)) {
        files.push({ status, name, path: path.join(dir, name) });
      }
    }
  }

  return files.sort((a, b) => a.name.localeCompare(b.name));
}

function findTicket(ticketId) {
  const normalized = ticketId.toUpperCase();
  const matches = listTicketFiles().filter((file) => file.name.startsWith(`${normalized}-`));

  if (matches.length === 0) fail(`ticket not found: ${ticketId}`);
  if (matches.length > 1) fail(`multiple tickets matched ${ticketId}`);

  return matches[0];
}

function nextTicketId() {
  let max = 0;
  for (const file of listTicketFiles()) {
    const match = file.name.match(/^TICKET-(\d{3})-/);
    if (match) max = Math.max(max, Number(match[1]));
  }

  return `TICKET-${String(max + 1).padStart(3, "0")}`;
}

function moveTicket(ticket, targetStatus, updates = {}) {
  if (ticket.status === targetStatus) {
    fail(`${ticket.name} is already in ${targetStatus}`);
  }

  const destination = path.join(ticketsDir, targetStatus, ticket.name);
  if (fs.existsSync(destination)) {
    fail(`destination already exists: ${destination}`);
  }

  updateFrontmatter(ticket.path, { status: targetStatus, ...updates });
  fs.renameSync(ticket.path, destination);
  return { ...ticket, status: targetStatus, path: destination };
}

function appendSection(filePath, heading, line) {
  const content = readUtf8(filePath);
  if (content.includes(`## ${heading}`)) {
    writeUtf8(filePath, `${content.trimEnd()}\n${line}\n`);
    return;
  }

  writeUtf8(filePath, `${content.trimEnd()}\n\n## ${heading}\n${line}\n`);
}

function commandNew(args, flags) {
  const title = args.join(" ").trim();
  if (!title) usage(1);

  const priority = flags.priority || "P2";
  const type = flags.type || "feature";
  const resolved = resolveAssigneeRole(flags);
  const assignee = resolved.assignee || "unassigned";
  const role = resolved.role || "unassigned";
  validateAssignee(assignee);
  validateRole(role);
  const branch = flags.branch || "";
  const source = flags.source || "";
  const sourceHash = flags["source-hash"] || flags.source_hash || "";
  const body = flags.body || `## Ne ve Neden
- **Amaç:**
- **Kapsam:**
- **Tamam sayılır:**

## Nasıl Yapılır
- **Yaklaşım:**
- **Doğrulama önerisi:**

## Sonuç
- **Yapıldı:**
- **Doğrulandı:**

## Etkilenen Dosyalar
-

## Sıradaki Adım
-

## Kapanış
-
`;

  if (!PRIORITIES.includes(priority)) {
    fail(`invalid priority: ${priority}. Use ${PRIORITIES.join("|")}`);
  }
  if (!TYPES.includes(type)) {
    fail(`invalid type: ${type}. Use ${TYPES.join("|")}`);
  }

  const id = nextTicketId();
  const filename = `${id}-${slugify(title)}.md`;
  const filePath = path.join(ticketsDir, "backlog", filename);

  if (fs.existsSync(filePath)) {
    fail(`ticket already exists: ${filePath}`);
  }

  const content = `---
id: ${id}
title: ${title}
date: ${today()}
assignee: ${assignee}
role: ${role}
status: backlog
priority: ${priority}
type: ${type}
branch: ${branch}
source: ${source}
source_hash: ${sourceHash}
---

${body}`;

  writeUtf8(filePath, content);
  console.log(`Created ${path.relative(repoRoot, filePath)}`);
  return { id, filePath, title };
}

function ticketIdentitySet() {
  const identities = new Set();

  for (const file of listTicketFiles()) {
    const content = readUtf8(file.path);
    const parsed = parseFrontmatter(content);
    if (parsed.data.source_hash) {
      identities.add(`hash:${parsed.data.source_hash}`);
    }
    if (parsed.data.title) {
      identities.add(`title:${normalizeText(parsed.data.title)}`);
    }
  }

  return identities;
}

function commandSyncRoadmap(args, flags) {
  const roadmapArg = args[0] || path.join("main", "roadmap.md");
  const roadmapPath = path.resolve(repoRoot, roadmapArg);
  const resolved = resolveAssigneeRole(flags);
  const fallbackAssignee = resolved.assignee || "unassigned";
  const fallbackRole = resolved.role || "developer";
  validateAssignee(fallbackAssignee);
  validateRole(fallbackRole);

  if (!fs.existsSync(roadmapPath)) {
    fail(`roadmap not found: ${roadmapPath}`);
  }

  const tasks = parseRoadmapTasks(roadmapPath);
  const identities = ticketIdentitySet();
  const created = [];
  const skipped = [];

  for (const task of tasks) {
    const normalizedTitle = normalizeText(task.title);
    const hashKey = `hash:${task.sourceHash}`;
    const titleKey = `title:${normalizedTitle}`;

    if (identities.has(hashKey) || identities.has(titleKey)) {
      skipped.push(task.title);
      continue;
    }

    const result = commandNew([task.title], {
      priority: task.priority,
      type: inferType(task.raw),
      assignee: fallbackAssignee,
      role: inferRole(task.raw, fallbackRole),
      source: `${path.relative(repoRoot, roadmapPath).replace(/\\/g, "/")}:${task.line}`,
      "source-hash": task.sourceHash,
      body: roadmapTicketBody(task, fallbackRole),
    });

    identities.add(hashKey);
    identities.add(titleKey);
    created.push(result);
  }

  console.log(`Roadmap sync complete. Created: ${created.length}, skipped: ${skipped.length}`);

  if (flags.start && created.length > 0) {
    const first = created.sort((a, b) => a.id.localeCompare(b.id))[0];
    commandStart([first.id], { assignee: fallbackAssignee, role: fallbackRole });
  }
}

function commandEnrichRoadmapTickets(args, flags) {
  const roadmapArg = args[0] || path.join("main", "roadmap.md");
  const roadmapPath = path.resolve(repoRoot, roadmapArg);
  const resolved = resolveAssigneeRole(flags);
  const fallbackRole = resolved.role || "developer";
  validateRole(fallbackRole);

  if (!fs.existsSync(roadmapPath)) {
    fail(`roadmap not found: ${roadmapPath}`);
  }

  const tasksByHash = new Map(parseRoadmapTasks(roadmapPath).map((task) => [task.sourceHash, task]));
  let updated = 0;
  let skipped = 0;

  for (const ticket of listTicketFiles()) {
    if (ticket.status !== "backlog") {
      skipped++;
      continue;
    }

    const content = readUtf8(ticket.path);
    const parsed = parseFrontmatter(content);
    const task = tasksByHash.get(parsed.data.source_hash);

    if (!task) {
      skipped++;
      continue;
    }

    const currentDescription = sectionContent(content, "Açıklama");
    const hasWeakDescription = !hasMeaningfulSection(currentDescription) || currentDescription === "-";
    const hasAcceptanceCriteria = hasMeaningfulSection(sectionContent(content, "Kabul Kriterleri"));

    const force = Boolean(flags.force);
    const hasScope = hasMeaningfulSection(sectionContent(content, "Kapsam"));
    const hasAgentInstruction = hasMeaningfulSection(sectionContent(content, "Agent Talimatı"));
    const hasVerificationSuggestion = hasMeaningfulSection(sectionContent(content, "Verification Önerisi"));

    if (!force && !hasWeakDescription && hasAcceptanceCriteria && hasScope && hasAgentInstruction && hasVerificationSuggestion) {
      skipped++;
      continue;
    }

    const existingRole = parsed.data.role || null;
    const next = serializeFrontmatter(parsed.data, roadmapTicketBody(task, existingRole || fallbackRole));
    writeUtf8(ticket.path, next);
    updated++;
  }

  console.log(`Roadmap ticket enrichment complete. Updated: ${updated}, skipped: ${skipped}`);
}

function commandStart(args, flags) {
  const ticketId = args[0];
  if (!ticketId) usage(1);

  const ticket = findTicket(ticketId);
  if (ticket.status !== "backlog") {
    fail(`ticket must be in backlog before start. Current status: ${ticket.status}`);
  }

  const current = ticketAssigneeRole(ticket);
  const resolved = resolveAssigneeRole(flags);
  const targetAssignee = normalizedName(resolved.assignee || current.assignee);
  const targetRole = normalizedName(resolved.role || current.role);
  validateAssignee(targetAssignee);
  validateRole(targetRole);

  const activeTickets = listTicketFiles().filter(
    (file) => file.status === "todo" && ticketAssignee(file) === targetAssignee && targetAssignee !== "unassigned"
  );
  if (activeTickets.length > 0) {
    fail(`${targetAssignee} already has an active todo ticket: ${activeTickets.map((file) => file.name).join(", ")}`);
  }

  const updates = {
    date: today(),
    assignee: targetAssignee,
    role: targetRole,
    agent: "",
  };

  const moved = moveTicket(ticket, "todo", updates);
  console.log(`Started ${path.relative(repoRoot, moved.path)}`);
}

function commandReview(args) {
  const ticketId = args[0];
  if (!ticketId) usage(1);

  const ticket = findTicket(ticketId);
  if (ticket.status !== "todo") {
    fail(`ticket must be in todo before review. Current status: ${ticket.status}`);
  }

  validateReviewReady(ticket);
  const moved = moveTicket(ticket, "in-review");
  console.log(`Moved to review ${path.relative(repoRoot, moved.path)}`);
}

function commandBacklog(args) {
  const ticketId = args[0];
  if (!ticketId) usage(1);

  const ticket = findTicket(ticketId);
  if (ticket.status !== "todo") {
    fail(`ticket must be in todo before moving back to backlog. Current status: ${ticket.status}`);
  }

  const moved = moveTicket(ticket, "backlog");
  console.log(`Moved back to backlog ${path.relative(repoRoot, moved.path)}`);
}

function commandDone(args, flags) {
  const ticketId = args[0];
  if (!ticketId) usage(1);

  const ticket = findTicket(ticketId);
  if (ticket.status !== "in-review") {
    fail(`ticket must be in in-review before done. Current status: ${ticket.status}`);
  }

  validateDoneReady(ticket, flags);

  if (flags.note) {
    appendSection(ticket.path, "Kapanış Notu", `- ${flags.note}`);
  }

  const updates = {};
  if (flags.commit) updates.commit = flags.commit;
  if (flags.reviewer) updates.reviewer = flags.reviewer;

  const moved = moveTicket(ticket, "done", updates);
  updateActivityLogDone(moved, flags);
  console.log(`Closed ${path.relative(repoRoot, moved.path)}`);
}

function updateActivityLogDone(ticket, flags) {
  if (!fs.existsSync(activityLogPath)) return;

  const content = readUtf8(activityLogPath);
  const parsed = parseFrontmatter(readUtf8(ticket.path));
  const marker = parsed.data.id || ticket.name.match(/^(TICKET-\d{3})/)?.[1] || ticket.name;
  const note = flags.note ? ` (${flags.note})` : "";
  const entry = `\n- ${today()} - ${marker} done${flags.commit ? ` commit: ${flags.commit}` : ""}${note}\n`;

  if (content.includes(`${marker} done`)) return;

  writeUtf8(activityLogPath, `${content.trimEnd()}\n${entry}`);
}

function commandCheck() {
  const issues = [];
  const files = listTicketFiles();

  const todoTicketsByAssignee = new Map();
  for (const file of files.filter((ticketFile) => ticketFile.status === "todo")) {
    const assignee = ticketAssignee(file);
    if (assignee === "unassigned") continue;
    const list = todoTicketsByAssignee.get(assignee) || [];
    list.push(file.name);
    todoTicketsByAssignee.set(assignee, list);
  }

  for (const [assignee, ticketNames] of todoTicketsByAssignee.entries()) {
    if (ticketNames.length > 1) {
      issues.push(`${assignee} has more than one active todo ticket: ${ticketNames.join(", ")}`);
    }
  }

  const seenIds = new Map();

  for (const file of files) {
    const content = readUtf8(file.path);
    const parsed = parseFrontmatter(content);
    const idFromName = file.name.match(/^(TICKET-\d{3})-/)?.[1];

    if (!parsed.raw) {
      issues.push(`${file.name}: missing frontmatter`);
      continue;
    }

    for (const key of ["id", "title", "date", "status", "priority", "type"]) {
      if (!parsed.data[key]) {
        issues.push(`${file.name}: missing frontmatter field "${key}"`);
      }
    }

    if (!parsed.data.assignee) {
      issues.push(`${file.name}: missing frontmatter field "assignee"`);
    }
    if (!parsed.data.role) {
      issues.push(`${file.name}: missing frontmatter field "role"`);
    }
    if (parsed.data.assignee && !ASSIGNEES.includes(parsed.data.assignee)) {
      issues.push(`${file.name}: invalid assignee "${parsed.data.assignee}"`);
    }
    if (parsed.data.role && !ROLES.includes(parsed.data.role)) {
      issues.push(`${file.name}: invalid role "${parsed.data.role}"`);
    }

    if (parsed.data.id !== idFromName) {
      issues.push(`${file.name}: frontmatter id (${parsed.data.id || "missing"}) does not match filename (${idFromName})`);
    }

    if (parsed.data.status !== file.status) {
      issues.push(`${file.name}: frontmatter status (${parsed.data.status || "missing"}) does not match folder (${file.status})`);
    }

    if (parsed.data.priority && !PRIORITIES.includes(parsed.data.priority)) {
      issues.push(`${file.name}: invalid priority "${parsed.data.priority}"`);
    }

    if (parsed.data.type && !TYPES.includes(parsed.data.type)) {
      issues.push(`${file.name}: invalid type "${parsed.data.type}"`);
    }

    if (parsed.data.id) {
      if (seenIds.has(parsed.data.id)) {
        issues.push(`${file.name}: duplicate id also used by ${seenIds.get(parsed.data.id)}`);
      } else {
        seenIds.set(parsed.data.id, file.name);
      }
    }

    if (file.status === "in-review") {
      for (const section of REQUIRED_REVIEW_SECTIONS) {
        if (!hasMeaningfulSection(sectionContent(content, section))) {
          issues.push(`${file.name}: in-review requires non-empty "${section}"`);
        }
      }
    }

    if (file.status === "done") {
      const hasCommit = Boolean(parsed.data.commit);
      const hasClosingV2 = hasMeaningfulSection(sectionContent(content, "Kapanış"));
      const hasClosingV1 = hasMeaningfulSection(sectionContent(content, "Kapanış Notu"));
      const hasLegacyCommitNote = /Commit:\s*`?[\w.-]+`?/i.test(content);
      if (!hasCommit && !hasClosingV2 && !hasClosingV1 && !hasLegacyCommitNote) {
        issues.push(`${file.name}: done requires commit field or "Kapanış" section content`);
      }
    }
  }

  // Requests: lightweight schema checks (id/status/folder match, frontmatter present)
  const requestFiles = requestLib.listRequestFiles(repoRoot);
  for (const file of requestFiles) {
    const content = readUtf8(file.path);
    const parsed = parseFrontmatter(content);
    if (!parsed.raw) {
      issues.push(`${file.name}: missing frontmatter`);
      continue;
    }
    const idFromName = file.name.match(/^(REQ-\d{3})-/)?.[1];
    if (parsed.data.id !== idFromName) {
      issues.push(`${file.name}: frontmatter id (${parsed.data.id || "missing"}) does not match filename (${idFromName})`);
    }
    if (parsed.data.status !== file.status) {
      issues.push(`${file.name}: frontmatter status (${parsed.data.status || "missing"}) does not match folder (${file.status})`);
    }
    if (!parsed.data.title) {
      issues.push(`${file.name}: missing frontmatter field "title"`);
    }
    if (file.status === "promoted" && !parsed.data.promoted_to) {
      issues.push(`${file.name}: promoted request missing "promoted_to"`);
    }
    if (file.status === "rejected" && !parsed.data.rejected_reason) {
      issues.push(`${file.name}: rejected request missing "rejected_reason"`);
    }
  }

  if (issues.length > 0) {
    console.error("Ticket check failed:");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  const reqSummary = requestFiles.length ? `, ${requestFiles.length} request${requestFiles.length === 1 ? "" : "s"}` : "";
  console.log(`Ticket check passed (${files.length} ticket${files.length === 1 ? "" : "s"}${reqSummary})`);
}

// ---- session subcommands ---------------------------------------------------

function parseTicketsList(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);
}

function commandSessionStart(args, flags) {
  const title = args.join(" ").trim();
  if (!title) fail('session start needs a title: ticket.js session start "Title" [--tickets TICKET-001,TICKET-002]');

  const existing = sessionLib.findCurrentSession(repoRoot);
  if (existing) {
    fail(`a session is already in-review (#${existing.data.session}). End it first: ticket.js session end [--commit HASH]`);
  }

  const tickets = parseTicketsList(flags.tickets);
  for (const t of tickets) {
    // Verify each ticket exists; surface bad input early.
    findTicket(t);
  }

  const resolved = resolveAssigneeRole(flags);
  const agent = resolved.assignee || "unassigned";
  const role = resolved.role || "developer";
  validateAssignee(agent);
  validateRole(role);

  const result = sessionLib.createSession(repoRoot, {
    title,
    tickets,
    agent,
    role,
    branch: flags.branch || "",
  });

  // Link the session into each ticket's frontmatter.sessions array.
  const sessionId = `${result.date}-${String(result.number).padStart(3, "0")}`;
  for (const t of tickets) {
    const ticket = findTicket(t);
    const content = readUtf8(ticket.path);
    const parsed = parseFrontmatter(content);
    const sessions = Array.isArray(parsed.data.sessions) ? parsed.data.sessions : [];
    if (!sessions.includes(sessionId)) sessions.push(sessionId);
    updateFrontmatter(ticket.path, { sessions });
  }

  sessionLib.rebuildIndexes(repoRoot);
  console.log(`Started session #${result.number} → ${path.relative(repoRoot, result.path)}`);
}

function commandSessionEnd(args, flags) {
  const ended = sessionLib.endSession(repoRoot, {
    commit: flags.commit,
    status: flags.status || "done",
  });
  sessionLib.rebuildIndexes(repoRoot);
  console.log(`Ended session #${ended.data.session} → ${path.relative(repoRoot, ended.path)}`);
}

function commandSessionList() {
  const files = sessionLib.listSessionFiles(repoRoot);
  if (files.length === 0) {
    console.log("No sessions yet.");
    return;
  }
  for (const file of files.slice(-30)) {
    const parsed = parseFrontmatter(readUtf8(file.path));
    const tickets = Array.isArray(parsed.data.tickets) && parsed.data.tickets.length
      ? parsed.data.tickets.join(",")
      : "—";
    console.log(
      `${parsed.data.date} #${String(parsed.data.session).padStart(3, "0")} [${parsed.data.status}] ${parsed.data.agent}/${parsed.data.role} ${tickets} ${file.name}`
    );
  }
}

function commandSessionCurrent() {
  const current = sessionLib.findCurrentSession(repoRoot);
  if (!current) {
    console.log("No active session.");
    process.exit(0);
  }
  console.log(`Active: #${current.data.session} ${current.name} (tickets: ${(current.data.tickets || []).join(",") || "—"})`);
}

function commandSession(args, flags) {
  const [subcommand, ...rest] = args;
  switch (subcommand) {
    case "start": commandSessionStart(rest, flags); break;
    case "end": commandSessionEnd(rest, flags); break;
    case "list": commandSessionList(); break;
    case "current": commandSessionCurrent(); break;
    default:
      fail(`unknown session subcommand: ${subcommand || "(none)"}. Use start|end|list|current`);
  }
}

// ---- request subcommands --------------------------------------------------

function readBodyFromFlags(flags) {
  if (flags["body-file"]) {
    const filePath = path.resolve(repoRoot, flags["body-file"]);
    if (!fs.existsSync(filePath)) fail(`body-file not found: ${filePath}`);
    return readUtf8(filePath);
  }
  return flags.body || "";
}

function commandRequestNew(args, flags) {
  const title = args.join(" ").trim();
  if (!title) fail('request new needs a title: ticket.js request new "Title" --body "..."');
  const body = readBodyFromFlags(flags);
  const result = requestLib.createRequest(repoRoot, {
    title,
    body,
    submittedBy: flags["submitted-by"] || "user",
  });
  console.log(`Created ${result.id} → ${path.relative(repoRoot, result.path)}`);
}

function commandRequestList(args, flags) {
  const status = flags.status || null;
  if (status && !requestLib.REQUEST_STATUSES.includes(status)) {
    fail(`invalid --status: ${status}. Use ${requestLib.REQUEST_STATUSES.join("|")}`);
  }
  const files = requestLib.listRequestFiles(repoRoot, status);
  if (files.length === 0) {
    console.log("No requests yet.");
    return;
  }
  for (const file of files) {
    const parsed = parseFrontmatter(readUtf8(file.path));
    const extra = parsed.data.promoted_to ? ` → ${parsed.data.promoted_to}` : "";
    const reason = parsed.data.rejected_reason ? ` (${parsed.data.rejected_reason})` : "";
    console.log(
      `${parsed.data.date} ${parsed.data.id} [${parsed.data.status}] ${parsed.data.title}${extra}${reason}`
    );
  }
}

function commandRequestPromote(args, flags) {
  const requestId = args[0];
  if (!requestId) fail("request promote needs a REQ-NNN id");

  const { data: requestData, body: requestBody } = requestLib.readRequest(repoRoot, requestId);
  if (requestData.status !== "pending") {
    fail(`request must be pending to promote. Current: ${requestData.status}`);
  }

  const title = (flags.title || requestData.title).trim();
  const priority = flags.priority || "P2";
  const type = flags.type || "feature";
  const resolved = resolveAssigneeRole(flags);
  const assignee = resolved.assignee || "unassigned";
  const role = resolved.role || "developer";

  // Build v2 body: surface the raw request text under "Ne ve Neden".
  const requestText = requestBody.replace(/^#\s+Talep\s*\n+/m, "").trim();
  const body = `## Ne ve Neden
- **Amaç:** ${title}
- **Kapsam:**
- **Tamam sayılır:**

### Talep Metni
${requestText || "-"}

## Nasıl Yapılır
- **Yaklaşım:**
- **Doğrulama önerisi:**

## Sonuç
- **Yapıldı:**
- **Doğrulandı:**

## Etkilenen Dosyalar
-

## Sıradaki Adım
-

## Kapanış
- Promoted from ${requestData.id} on ${today()}
`;

  const created = commandNew([title], {
    priority,
    type,
    assignee,
    role,
    body,
  });

  requestLib.markPromoted(repoRoot, requestId, created.id);
  console.log(`Promoted ${requestId} → ${created.id}`);
}

function commandRequestReject(args, flags) {
  const requestId = args[0];
  if (!requestId) fail("request reject needs a REQ-NNN id");
  if (!flags.reason) fail('request reject needs --reason "..."');
  const moved = requestLib.rejectRequest(repoRoot, requestId, { reason: flags.reason });
  console.log(`Rejected ${requestId} → ${path.relative(repoRoot, moved.path)}`);
}

function commandRequest(args, flags) {
  const [subcommand, ...rest] = args;
  switch (subcommand) {
    case "new": commandRequestNew(rest, flags); break;
    case "list": commandRequestList(rest, flags); break;
    case "promote": commandRequestPromote(rest, flags); break;
    case "reject": commandRequestReject(rest, flags); break;
    default:
      fail(`unknown request subcommand: ${subcommand || "(none)"}. Use new|list|promote|reject`);
  }
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  const { args, flags } = parseArgs(rest);

  ensureStructure();

  switch (command) {
    case "new": commandNew(args, flags); break;
    case "start": commandStart(args, flags); break;
    case "backlog": commandBacklog(args); break;
    case "review": commandReview(args, flags); break;
    case "done": commandDone(args, flags); break;
    case "sync-roadmap": commandSyncRoadmap(args, flags); break;
    case "enrich-roadmap-tickets": commandEnrichRoadmapTickets(args, flags); break;
    case "session": commandSession(args, flags); break;
    case "request": commandRequest(args, flags); break;
    case "check": commandCheck(); break;
    case "help":
    case "--help":
    case "-h": usage(0); break;
    default: usage(1);
  }
}

main();
