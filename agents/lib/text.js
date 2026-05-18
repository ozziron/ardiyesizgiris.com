const crypto = require("crypto");

const COMBINING_MARKS = /[̀-ͯ]/g;

function slugify(title) {
  return title
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "ticket";
}

function stripMarkdown(value) {
  return value
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(value) {
  return stripMarkdown(value)
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function hashText(value) {
  return crypto.createHash("sha1").update(value.trim()).digest("hex").slice(0, 12);
}

function normalizedName(value) {
  return String(value || "unassigned").trim().toLowerCase() || "unassigned";
}

module.exports = { slugify, stripMarkdown, normalizeText, hashText, normalizedName };
