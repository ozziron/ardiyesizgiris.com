const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  requestsRoot,
  listRequestFiles,
  nextRequestId,
  createRequest,
  readRequest,
  findRequest,
  markPromoted,
  rejectRequest,
} = require("./request");
const { readUtf8, parseFrontmatter } = require("./frontmatter");

function tmpRepo() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "request-test-"));
}

test("requestsRoot: returns <repo>/requests path", () => {
  assert.equal(requestsRoot("/x"), path.join("/x", "requests"));
});

test("nextRequestId: REQ-001 when empty", () => {
  const repo = tmpRepo();
  assert.equal(nextRequestId(repo), "REQ-001");
});

test("createRequest: writes pending file with frontmatter", () => {
  const repo = tmpRepo();
  const { id, path: fp } = createRequest(repo, {
    title: "Stripe rate limit",
    body: "Production'da 429 alıyoruz.",
  });
  assert.equal(id, "REQ-001");
  assert.ok(fs.existsSync(fp));
  const parsed = parseFrontmatter(readUtf8(fp));
  assert.equal(parsed.data.id, "REQ-001");
  assert.equal(parsed.data.status, "pending");
  assert.equal(parsed.data.title, "Stripe rate limit");
  assert.ok(parsed.body.includes("Production'da 429 alıyoruz."));
});

test("createRequest: id increments", () => {
  const repo = tmpRepo();
  createRequest(repo, { title: "A", body: "x" });
  createRequest(repo, { title: "B", body: "y" });
  assert.equal(nextRequestId(repo), "REQ-003");
});

test("findRequest: by ID across status folders", () => {
  const repo = tmpRepo();
  createRequest(repo, { title: "First one", body: "x" });
  const found = findRequest(repo, "REQ-001");
  assert.equal(found.status, "pending");
  assert.match(found.name, /^REQ-001-/);
});

test("markPromoted: moves to promoted/, sets promoted_to + date", () => {
  const repo = tmpRepo();
  createRequest(repo, { title: "X talebi", body: "..." });
  const moved = markPromoted(repo, "REQ-001", "TICKET-042");
  assert.equal(moved.status, "promoted");
  const { data } = readRequest(repo, "REQ-001");
  assert.equal(data.status, "promoted");
  assert.equal(data.promoted_to, "TICKET-042");
  assert.match(data.promoted_at, /^\d{4}-\d{2}-\d{2}$/);
});

test("rejectRequest: moves to rejected/, stores reason", () => {
  const repo = tmpRepo();
  createRequest(repo, { title: "Y talebi", body: "..." });
  rejectRequest(repo, "REQ-001", { reason: "Kapsam dışı" });
  const { data } = readRequest(repo, "REQ-001");
  assert.equal(data.status, "rejected");
  assert.equal(data.rejected_reason, "Kapsam dışı");
});

test("listRequestFiles: filter by status", () => {
  const repo = tmpRepo();
  createRequest(repo, { title: "A", body: "x" });
  createRequest(repo, { title: "B", body: "y" });
  rejectRequest(repo, "REQ-001", { reason: "no" });
  assert.equal(listRequestFiles(repo, "pending").length, 1);
  assert.equal(listRequestFiles(repo, "rejected").length, 1);
  assert.equal(listRequestFiles(repo).length, 2);
});

// Note: empty-title validation is enforced via fail() which calls
// process.exit(1) — not testable from node:test without spawning a child.
// Behavior verified manually via CLI smoke.
