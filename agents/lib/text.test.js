const test = require("node:test");
const assert = require("node:assert/strict");
const { slugify, stripMarkdown, normalizeText, hashText, normalizedName } = require("./text");

test("slugify: Turkish characters to ASCII", () => {
  assert.equal(slugify("Ardiyesiz Giriş Hesaplama"), "ardiyesiz-giris-hesaplama");
  assert.equal(slugify("İhracat ŞTİ"), "ihracat-sti");
});

test("slugify: empty/punct-only returns 'ticket'", () => {
  assert.equal(slugify("!!!"), "ticket");
  assert.equal(slugify(""), "ticket");
});

test("slugify: caps at 60 chars", () => {
  const long = "a".repeat(120);
  assert.equal(slugify(long).length, 60);
});

test("stripMarkdown: removes code, bold, italic, links", () => {
  assert.equal(stripMarkdown("**bold** and `code` and [link](url)"), "bold and code and link");
});

test("normalizeText: ASCII-fold + lowercase + collapse", () => {
  assert.equal(normalizeText("**İSTANBUL** Limanı"), "istanbul limani");
});

test("hashText: deterministic 12-char sha1 prefix", () => {
  const h1 = hashText("foo");
  const h2 = hashText("foo");
  assert.equal(h1, h2);
  assert.equal(h1.length, 12);
  assert.notEqual(h1, hashText("bar"));
});

test("hashText: trims whitespace", () => {
  assert.equal(hashText("foo"), hashText("  foo  "));
});

test("normalizedName: defaults to unassigned", () => {
  assert.equal(normalizedName(undefined), "unassigned");
  assert.equal(normalizedName(null), "unassigned");
  assert.equal(normalizedName(""), "unassigned");
  assert.equal(normalizedName("  "), "unassigned");
  assert.equal(normalizedName("Opus-4.7"), "opus-4.7");
});
