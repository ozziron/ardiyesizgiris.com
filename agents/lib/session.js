// Session file lifecycle: create, parse, update, index. A session captures
// what an agent did across one bounded work block; it links to N tickets via
// frontmatter `tickets: [TICKET-A, TICKET-B]`.
//
// Layout (under main/agents/sessions/):
//   sessions/INDEX.md                        — last ~30 sessions, one line each
//   sessions/YYYY/MM/INDEX.md                — month index
//   sessions/YYYY/MM/YYYY-MM-DD-NNN-slug.md  — individual session file

const fs = require("fs");
const path = require("path");
const { slugify, normalizedName } = require("./text");
const {
  readUtf8,
  writeUtf8,
  parseFrontmatter,
  serializeFrontmatter,
  updateFrontmatter,
} = require("./frontmatter");
const { fail, today } = require("./cli-helpers");

const SESSION_STATUSES = ["in-review", "done"];

function sessionsRoot(repoRoot) {
  return path.join(repoRoot, "main", "agents", "sessions");
}

function ensureSessionsRoot(repoRoot) {
  const root = sessionsRoot(repoRoot);
  if (!fs.existsSync(root)) fs.mkdirSync(root, { recursive: true });
  return root;
}

function listSessionFiles(repoRoot) {
  const root = sessionsRoot(repoRoot);
  if (!fs.existsSync(root)) return [];
  const out = [];
  for (const year of fs.readdirSync(root)) {
    const yearDir = path.join(root, year);
    if (!fs.statSync(yearDir).isDirectory() || !/^\d{4}$/.test(year)) continue;
    for (const month of fs.readdirSync(yearDir)) {
      const monthDir = path.join(yearDir, month);
      if (!fs.statSync(monthDir).isDirectory() || !/^\d{2}$/.test(month)) continue;
      for (const name of fs.readdirSync(monthDir)) {
        if (/^\d{4}-\d{2}-\d{2}-\d{3}-.+\.md$/.test(name)) {
          out.push({ name, path: path.join(monthDir, name), year, month });
        }
      }
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

function nextSessionNumber(repoRoot) {
  let max = 0;
  for (const file of listSessionFiles(repoRoot)) {
    const m = file.name.match(/^\d{4}-\d{2}-\d{2}-(\d{3})-/);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max + 1;
}

function sessionFileFor(repoRoot, { date, number, slug }) {
  const [y, m] = date.split("-");
  const dir = path.join(sessionsRoot(repoRoot), y, m);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const padded = String(number).padStart(3, "0");
  return path.join(dir, `${date}-${padded}-${slug}.md`);
}

function buildSessionBody({ title, tickets = [] }) {
  const ticketLine = tickets.length
    ? `Bu session ${tickets.join(", ")} üzerinde çalışmıştır.`
    : "Bu session henüz bir ticket'a bağlı değil.";
  return `# Session — ${title}

## Özet
- ${ticketLine}
- (2-3 cümlede session sonuç özeti)

## Yapılanlar
-

## Etkilenen Dosyalar
-

## Verification
-

## Notlar / Gotcha
-
`;
}

function createSession(repoRoot, { title, tickets = [], agent, role, branch }) {
  ensureSessionsRoot(repoRoot);
  const date = today();
  const number = nextSessionNumber(repoRoot);
  const slug = slugify(title);
  const filePath = sessionFileFor(repoRoot, { date, number, slug });

  if (fs.existsSync(filePath)) {
    fail(`session already exists: ${filePath}`);
  }

  const data = {
    session: number,
    date,
    agent: normalizedName(agent),
    role: normalizedName(role || "developer"),
    status: "in-review",
    tickets,
    branch: branch || "",
  };

  const body = buildSessionBody({ title, tickets });
  writeUtf8(filePath, serializeFrontmatter(data, body));
  return { number, date, slug, path: filePath };
}

function findCurrentSession(repoRoot) {
  // A session is "current" if its status is in-review. Returns the most recent
  // (highest number) such session, or null when none exist.
  const files = listSessionFiles(repoRoot);
  for (let i = files.length - 1; i >= 0; i--) {
    const parsed = parseFrontmatter(readUtf8(files[i].path));
    if (parsed.data.status === "in-review") {
      return { ...files[i], data: parsed.data };
    }
  }
  return null;
}

function endSession(repoRoot, { commit, status = "done" } = {}) {
  const current = findCurrentSession(repoRoot);
  if (!current) fail("no in-review session to end");
  if (!SESSION_STATUSES.includes(status)) {
    fail(`invalid session status: ${status}. Use ${SESSION_STATUSES.join("|")}`);
  }
  const updates = { status };
  if (commit) updates.commit = commit;
  updateFrontmatter(current.path, updates);
  return current;
}

// Generates a one-line summary for INDEX.md from a session file's frontmatter.
// Format: `- YYYY-MM-DD #NNN — title — agent/role — status — tickets`
function indexLine(file, parsed) {
  const d = parsed.data;
  const titleMatch = readUtf8(file.path).match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].replace(/^Session\s+—\s+/, "") : "(no title)";
  const tickets = Array.isArray(d.tickets) && d.tickets.length ? d.tickets.join(",") : "—";
  const rel = path.relative(path.dirname(file.path), file.path);
  return `- ${d.date} #${String(d.session).padStart(3, "0")} — ${title} — ${d.agent}/${d.role} — ${d.status} — ${tickets}`;
}

function rebuildIndexes(repoRoot) {
  const files = listSessionFiles(repoRoot);
  const root = ensureSessionsRoot(repoRoot);

  // Group by year/month for month indexes
  const byMonth = new Map();
  const allLines = [];
  for (const file of files) {
    const parsed = parseFrontmatter(readUtf8(file.path));
    const key = `${file.year}/${file.month}`;
    const list = byMonth.get(key) || [];
    list.push({ file, parsed });
    byMonth.set(key, list);
    allLines.push({ file, parsed });
  }

  // Per-month INDEX
  for (const [key, entries] of byMonth.entries()) {
    const [year, month] = key.split("/");
    const monthDir = path.join(root, year, month);
    const lines = entries
      .sort((a, b) => b.file.name.localeCompare(a.file.name))
      .map((e) => indexLine(e.file, e.parsed));
    const content = `# Sessions ${year}-${month}\n\n${lines.join("\n")}\n`;
    writeUtf8(path.join(monthDir, "INDEX.md"), content);
  }

  // Top-level INDEX (latest 30, reverse-chronological)
  const top = allLines
    .sort((a, b) => b.file.name.localeCompare(a.file.name))
    .slice(0, 30)
    .map((e) => indexLine(e.file, e.parsed));
  const header = `# Sessions Index\n\nSon ${Math.min(30, allLines.length)} session (en yeni en üstte). Daha eski session'lar için \`sessions/YYYY/MM/INDEX.md\` dosyalarına bak.\n\n`;
  writeUtf8(path.join(root, "INDEX.md"), header + top.join("\n") + "\n");
}

module.exports = {
  SESSION_STATUSES,
  sessionsRoot,
  listSessionFiles,
  nextSessionNumber,
  sessionFileFor,
  buildSessionBody,
  createSession,
  findCurrentSession,
  endSession,
  rebuildIndexes,
};
