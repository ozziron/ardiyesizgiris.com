const { ASSIGNEES, ROLES } = require("../orchestrator/constants");
const { normalizedName } = require("./text");
const { readUtf8, parseFrontmatter, sectionContent, hasMeaningfulSection } = require("./frontmatter");
const { fail } = require("./cli-helpers");

// v2 ticket body: review gate looks at the unified "Sonuç" + the file list.
// Backward compat with old 11-section body is handled by accepting either set.
const REQUIRED_REVIEW_SECTIONS_V2 = ["Sonuç", "Etkilenen Dosyalar"];
const REQUIRED_REVIEW_SECTIONS_V1 = ["Yapılanlar", "Etkilenen Dosyalar", "Verification"];
const REQUIRED_REVIEW_SECTIONS = REQUIRED_REVIEW_SECTIONS_V2;

function validateAssignee(value) {
  if (!value) return;
  if (!ASSIGNEES.includes(value)) {
    fail(`invalid assignee: ${value}. Use ${ASSIGNEES.join("|")}`);
  }
}

function validateRole(value) {
  if (!value) return;
  if (!ROLES.includes(value)) {
    fail(`invalid role: ${value}. Use ${ROLES.join("|")}`);
  }
}

function ticketAssigneeRole(ticket) {
  const content = readUtf8(ticket.path);
  const parsed = parseFrontmatter(content);
  return {
    assignee: normalizedName(parsed.data.assignee),
    role: normalizedName(parsed.data.role || "developer"),
  };
}

function ticketAssignee(ticket) {
  return ticketAssigneeRole(ticket).assignee;
}

function validateReviewReady(ticket) {
  const content = readUtf8(ticket.path);

  // Accept either v2 ("Sonuç" + "Etkilenen Dosyalar") or legacy v1 schema —
  // migration may produce a mix during the transition window.
  const fits = (schema) =>
    schema.every((s) => hasMeaningfulSection(sectionContent(content, s)));

  if (fits(REQUIRED_REVIEW_SECTIONS_V2)) return;
  if (fits(REQUIRED_REVIEW_SECTIONS_V1)) return;

  const missing = REQUIRED_REVIEW_SECTIONS_V2.filter(
    (s) => !hasMeaningfulSection(sectionContent(content, s))
  );
  fail(`ticket is not review-ready. Fill these sections first: ${missing.join(", ")}`);
}

function validateDoneReady(ticket, flags) {
  const content = readUtf8(ticket.path);
  const parsed = parseFrontmatter(content);
  const note = flags.note || sectionContent(content, "Kapanış Notu");
  const commit = flags.commit || parsed.data.commit;
  const reviewer = flags.reviewer || parsed.data.reviewer;

  if (!reviewer) {
    fail("done requires --reviewer <reviewer-name>. Worker agents may only move tickets to in-review.");
  }

  if (!commit && !hasMeaningfulSection(note || "")) {
    fail("done requires --commit <hash> or --note \"Kapanış notu\"");
  }
}

module.exports = {
  REQUIRED_REVIEW_SECTIONS,
  REQUIRED_REVIEW_SECTIONS_V1,
  REQUIRED_REVIEW_SECTIONS_V2,
  validateAssignee,
  validateRole,
  validateReviewReady,
  validateDoneReady,
  ticketAssigneeRole,
  ticketAssignee,
};
