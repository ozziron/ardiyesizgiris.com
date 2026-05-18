const test = require("node:test");
const assert = require("node:assert/strict");
const {
  parseFrontmatter,
  serializeFrontmatter,
  sectionContent,
  hasMeaningfulSection,
} = require("./frontmatter");

test("parseFrontmatter: standard ticket frontmatter", () => {
  const md = "---\nid: TICKET-001\ntitle: Test\nstatus: backlog\n---\nBody here";
  const p = parseFrontmatter(md);
  assert.equal(p.data.id, "TICKET-001");
  assert.equal(p.data.title, "Test");
  assert.equal(p.data.status, "backlog");
  assert.equal(p.body, "Body here");
});

test("parseFrontmatter: no frontmatter -> empty data, full body", () => {
  const md = "Just body";
  const p = parseFrontmatter(md);
  assert.deepEqual(p.data, {});
  assert.equal(p.body, "Just body");
  assert.equal(p.raw, "");
});

test("parseFrontmatter: CRLF line endings", () => {
  const md = "---\r\nid: X\r\n---\r\nbody";
  assert.equal(parseFrontmatter(md).data.id, "X");
});

test("serializeFrontmatter: ordered keys come first", () => {
  const out = serializeFrontmatter(
    { extra: "z", id: "TICKET-001", title: "T", status: "todo" },
    "body"
  );
  const lines = out.split("\n");
  assert.equal(lines[1], "id: TICKET-001");
  assert.equal(lines[2], "title: T");
  assert.equal(lines[3], "status: todo");
  assert.equal(lines[4], "extra: z");
});

test("serializeFrontmatter: skips empty/undefined values", () => {
  const out = serializeFrontmatter({ id: "X", title: "", branch: undefined }, "b");
  assert.ok(out.includes("id: X"));
  assert.ok(!out.includes("title:"));
  assert.ok(!out.includes("branch:"));
});

test("parse/serialize round-trip preserves data", () => {
  const md = "---\nid: TICKET-007\ntitle: Mod seçim\nstatus: in-review\npriority: P1\n---\n\nBody";
  const p = parseFrontmatter(md);
  const out = serializeFrontmatter(p.data, p.body);
  const p2 = parseFrontmatter(out);
  assert.deepEqual(p2.data, p.data);
});

test("sectionContent: extracts text under ## heading", () => {
  const md = "## Yapılanlar\n- Test edildi\n\n## Verification\n- tsc ok";
  assert.equal(sectionContent(md, "Yapılanlar"), "- Test edildi");
  assert.equal(sectionContent(md, "Verification"), "- tsc ok");
});

test("sectionContent: missing heading returns empty", () => {
  assert.equal(sectionContent("# Some doc", "Yapılanlar"), "");
});

test("parseFrontmatter: array values [a, b, c]", () => {
  const md = "---\ntickets: [TICKET-001, TICKET-002]\nsessions: []\n---\nbody";
  const p = parseFrontmatter(md);
  assert.deepEqual(p.data.tickets, ["TICKET-001", "TICKET-002"]);
  assert.deepEqual(p.data.sessions, []);
});

test("parseFrontmatter: scalar still scalar (not bracketed)", () => {
  const p = parseFrontmatter("---\nid: TICKET-X\n---\nb");
  assert.equal(p.data.id, "TICKET-X");
});

test("serializeFrontmatter: arrays render as [a, b]", () => {
  const out = serializeFrontmatter(
    { id: "X", tickets: ["TICKET-001", "TICKET-002"], sessions: [] },
    "body"
  );
  assert.ok(out.includes("tickets: [TICKET-001, TICKET-002]"));
  assert.ok(out.includes("sessions: []"));
});

test("array round-trip preserves values", () => {
  const md = "---\nid: X\nsessions: [s1, s2, s3]\n---\nbody";
  const p = parseFrontmatter(md);
  const out = serializeFrontmatter(p.data, p.body);
  const p2 = parseFrontmatter(out);
  assert.deepEqual(p2.data.sessions, ["s1", "s2", "s3"]);
});

test("hasMeaningfulSection: dash-only is empty", () => {
  assert.equal(hasMeaningfulSection("-"), false);
  assert.equal(hasMeaningfulSection("- \n-"), false);
  assert.equal(hasMeaningfulSection(""), false);
  assert.equal(hasMeaningfulSection("- gerçek içerik"), true);
});
