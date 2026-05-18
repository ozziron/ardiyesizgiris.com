const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  sessionsRoot,
  listSessionFiles,
  nextSessionNumber,
  createSession,
  findCurrentSession,
  endSession,
  rebuildIndexes,
  buildSessionBody,
} = require("./session");
const { readUtf8, parseFrontmatter } = require("./frontmatter");

function tmpRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "session-test-"));
  fs.mkdirSync(path.join(dir, "main", "agents"), { recursive: true });
  return dir;
}

test("sessionsRoot: returns main/agents/sessions path", () => {
  const repo = "/tmp/foo";
  assert.equal(sessionsRoot(repo), path.join(repo, "main", "agents", "sessions"));
});

test("nextSessionNumber: 1 when empty", () => {
  const repo = tmpRepo();
  assert.equal(nextSessionNumber(repo), 1);
});

test("createSession: writes file with frontmatter + body", () => {
  const repo = tmpRepo();
  const result = createSession(repo, {
    title: "Test session başlığı",
    tickets: ["TICKET-001", "TICKET-002"],
    agent: "claude-haiku-4-5",
    role: "developer",
  });
  assert.equal(result.number, 1);
  assert.ok(fs.existsSync(result.path));
  const parsed = parseFrontmatter(readUtf8(result.path));
  assert.equal(parsed.data.session, "1");
  assert.deepEqual(parsed.data.tickets, ["TICKET-001", "TICKET-002"]);
  assert.equal(parsed.data.status, "in-review");
});

test("nextSessionNumber: increments after creation", () => {
  const repo = tmpRepo();
  createSession(repo, { title: "First", agent: "gemini", role: "developer" });
  assert.equal(nextSessionNumber(repo), 2);
  createSession(repo, { title: "Second", agent: "codex", role: "developer" });
  assert.equal(nextSessionNumber(repo), 3);
});

test("findCurrentSession: returns the in-review one", () => {
  const repo = tmpRepo();
  const a = createSession(repo, { title: "A", agent: "gemini", role: "developer" });
  endSession(repo, { status: "done" });
  const b = createSession(repo, { title: "B", agent: "codex", role: "developer" });
  const current = findCurrentSession(repo);
  assert.ok(current);
  assert.equal(current.path, b.path);
});

test("endSession: moves status to done, sets commit when given", () => {
  const repo = tmpRepo();
  const s = createSession(repo, { title: "End me", agent: "claude-haiku-4-5", role: "developer" });
  endSession(repo, { commit: "abc1234" });
  const parsed = parseFrontmatter(readUtf8(s.path));
  assert.equal(parsed.data.status, "done");
  assert.equal(parsed.data.commit, "abc1234");
});

test("rebuildIndexes: writes top-level + monthly INDEX.md", () => {
  const repo = tmpRepo();
  createSession(repo, { title: "Index test", agent: "gemini", role: "developer", tickets: ["TICKET-005"] });
  rebuildIndexes(repo);
  const top = path.join(sessionsRoot(repo), "INDEX.md");
  assert.ok(fs.existsSync(top));
  const content = readUtf8(top);
  assert.ok(content.includes("Sessions Index"));
  assert.ok(content.includes("Index test"));
  assert.ok(content.includes("TICKET-005"));
});

test("buildSessionBody: bare body has the right 4 sections", () => {
  const body = buildSessionBody({ title: "X", tickets: ["T-1"] });
  assert.ok(body.includes("## Özet"));
  assert.ok(body.includes("## Yapılanlar"));
  assert.ok(body.includes("## Etkilenen Dosyalar"));
  assert.ok(body.includes("## Verification"));
  assert.ok(body.includes("T-1"));
});
