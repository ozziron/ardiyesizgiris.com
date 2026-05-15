#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..", "..");
const defaultGitRepo = path.join(repoRoot, "main");
const defaultActivityLog = path.join(repoRoot, "main", "agents", "ACTIVITY_LOG.md");

function usage(exitCode = 0) {
  console.log(`
Activity Log From Commits

Usage:
  node agents/activity-log-from-commits.js [--limit 5] [--since YYYY-MM-DD] [--repo main] [--write]

Options:
  --limit <n>       Number of recent commits to include. Default: 5
  --since <date>    Include commits since this date. Example: 2026-05-15
  --repo <path>     Git repository path relative to project root. Default: main
  --log <path>      Activity log path relative to project root. Default: agents/ACTIVITY_LOG.md
  --role <name>     Activity entry agent role. Default: workflow tooling
  --status <text>   Activity entry status. Default: in-review
  --title <text>    Activity entry title. Default: Git commit activity summary
  --write           Insert generated entry at the top of ACTIVITY_LOG.md
`);
  process.exit(exitCode);
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const flags = {};

  for (let i = 0; i < argv.length; i++) {
    const value = argv[i];
    if (value === "--help" || value === "-h") {
      usage(0);
    }
    if (!value.startsWith("--")) {
      fail(`unexpected positional argument: ${value}`);
    }

    const key = value.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      flags[key] = true;
    } else {
      flags[key] = next;
      i++;
    }
  }

  return flags;
}

function runGit(gitRepo, args) {
  const result = spawnSync("git", args, {
    cwd: gitRepo,
    encoding: "utf8",
  });

  if (result.error) {
    fail(`git failed: ${result.error.message}`);
  }
  if (result.status !== 0) {
    fail((result.stderr || result.stdout || "git command failed").trim());
  }

  return result.stdout.trim();
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nextSessionNumber(activityLogPath) {
  if (!fs.existsSync(activityLogPath)) {
    return 1;
  }

  const content = fs.readFileSync(activityLogPath, "utf8");
  const matches = [...content.matchAll(/Session #(\d+)/g)].map((match) => Number(match[1]));
  return matches.length > 0 ? Math.max(...matches) + 1 : 1;
}

function currentBranch(gitRepo) {
  return runGit(gitRepo, ["rev-parse", "--abbrev-ref", "HEAD"]) || "unknown";
}

function recentCommits(gitRepo, flags) {
  const limit = Number(flags.limit || 5);
  if (!Number.isInteger(limit) || limit < 1) {
    fail("--limit must be a positive integer");
  }

  const args = ["log", `--max-count=${limit}`, "--date=short", "--pretty=format:%h%x09%ad%x09%an%x09%s"];
  if (flags.since) {
    args.splice(1, 0, `--since=${flags.since}`);
  }

  const output = runGit(gitRepo, args);
  if (!output) {
    fail("no commits matched the requested filters");
  }

  return output.split(/\r?\n/).map((line) => {
    const [hash, date, author, ...subjectParts] = line.split("\t");
    return {
      hash,
      date,
      author,
      subject: subjectParts.join("\t"),
    };
  });
}

function changedFiles(gitRepo, commitHash) {
  const output = runGit(gitRepo, ["show", "--name-status", "--format=", commitHash]);
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [status, ...fileParts] = line.split(/\s+/);
      return `${status} main/${fileParts.join(" ")}`;
    });
}

function unique(values) {
  return [...new Set(values)];
}

function buildEntry({ activityLogPath, gitRepo, flags, commits }) {
  const session = nextSessionNumber(activityLogPath);
  const title = flags.title || "Git commit activity summary";
  const role = flags.role || "workflow tooling";
  const status = flags.status || "in-review";
  const branch = currentBranch(gitRepo);

  const files = unique(commits.flatMap((commit) => changedFiles(gitRepo, commit.hash)));
  const commitBullets = commits.map((commit) => {
    return `- ${commit.hash} (${commit.date}) ${commit.subject} — ${commit.author}`;
  });
  const fileBullets = files.length > 0
    ? files.map((file) => `- ${file}`)
    : ["- Commit dosyaları bulunamadı."];

  return `## ${today()} — Session #${session} — ${title}
**Agent rolü:** ${role}
**Süre:** auto-generated
**Branch:** ${branch}
**Status:** ${status}

### Yapılanlar
${commitBullets.join("\n")}

### Etkilenen Dosyalar
${fileBullets.join("\n")}

### Verification
- Generated from git commits with \`node agents/activity-log-from-commits.js\`.

### Sıradaki Adım
- Reviewer activity log entry'yi kontrol edip gerekiyorsa elle özetleyebilir.

### Notlar / Gotcha
- Bu entry commit geçmişinden otomatik üretildi; ürün bağlamı gerekiyorsa manuel açıklama eklenmeli.
`;
}

function insertAtTop(activityLogPath, entry) {
  if (!fs.existsSync(activityLogPath)) {
    fail(`activity log not found: ${activityLogPath}`);
  }

  const content = fs.readFileSync(activityLogPath, "utf8");
  const marker = "\n---\n";
  const markerIndex = content.indexOf(marker);
  if (markerIndex === -1) {
    fail("activity log header separator not found");
  }

  const insertAt = markerIndex + marker.length;
  const next = `${content.slice(0, insertAt)}\n${entry.trim()}\n\n---\n${content.slice(insertAt).replace(/^\s+/, "")}`;
  fs.writeFileSync(activityLogPath, next, "utf8");
}

function main() {
  const flags = parseArgs(process.argv.slice(2));
  const gitRepo = path.resolve(repoRoot, flags.repo || defaultGitRepo);
  const activityLogPath = path.resolve(repoRoot, flags.log || defaultActivityLog);

  if (!fs.existsSync(gitRepo)) {
    fail(`git repo path not found: ${gitRepo}`);
  }

  const commits = recentCommits(gitRepo, flags);
  const entry = buildEntry({ activityLogPath, gitRepo, flags, commits });

  if (flags.write) {
    insertAtTop(activityLogPath, entry);
    console.log(`Inserted activity log entry for ${commits.length} commit(s): ${path.relative(repoRoot, activityLogPath)}`);
    return;
  }

  console.log(entry);
}

main();
