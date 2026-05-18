const test = require("node:test");
const assert = require("node:assert/strict");
const { inferType, inferRole, titleFromRoadmapItem } = require("./roadmap");

test("inferType: fix keywords", () => {
  assert.equal(inferType("toast string cleanup"), "fix");
  assert.equal(inferType("Bug: hesap hatası"), "fix");
});

test("inferType: refactor keywords", () => {
  assert.equal(inferType("refactor: agent base"), "refactor");
  assert.equal(inferType("migration to new schema"), "refactor");
});

test("inferType: docs keywords", () => {
  assert.equal(inferType("update roadmap and docs"), "docs");
  assert.equal(inferType("activity log archive"), "docs");
});

test("inferType: chore keywords", () => {
  assert.equal(inferType("CLI script setup"), "chore");
  assert.equal(inferType("agent push otomasyon"), "chore");
});

test("inferType: default to feature", () => {
  assert.equal(inferType("Stripe ödeme entegrasyonu"), "feature");
  assert.equal(inferType("yeni ekran ekle"), "feature");
});

test("inferRole: explicit **Rol:** marker", () => {
  assert.equal(inferRole("**Rol:** designer.", null), "designer");
  assert.equal(inferRole("**Rol:** marketing.", null), "marketing");
  assert.equal(inferRole("**Rol:** qa.", null), "qa");
});

test("inferRole: i18n -> developer", () => {
  assert.equal(inferRole("**Rol:** i18n cleanup.", null), "developer");
});

test("inferRole: falls back when no marker", () => {
  assert.equal(inferRole("plain text task", "designer"), "designer");
  assert.equal(inferRole("no marker here", null), "developer");
});

test("titleFromRoadmapItem: strips Rol/Boyut suffix", () => {
  const title = titleFromRoadmapItem("Mod seçim ekranı. **Rol:** designer. **Boyut:** S.");
  assert.ok(!title.toLowerCase().includes("rol:"));
  assert.ok(!title.toLowerCase().includes("boyut:"));
});

test("titleFromRoadmapItem: keeps 'Task #N:' prefix", () => {
  const title = titleFromRoadmapItem("Task #2b: form-tsx string cleanup");
  assert.ok(title.startsWith("Task #2b"));
});
