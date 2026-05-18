const fs = require("fs");

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^﻿/, "");
}

function writeUtf8(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

// Parses inline JSON-style array values: `[a, b, c]` -> ["a","b","c"].
// Whitespace-tolerant; returns null when the value is not a bracketed list,
// so callers fall back to the raw string.
function parseArrayValue(raw) {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return null;
  const inner = trimmed.slice(1, -1).trim();
  if (inner === "") return [];
  return inner.split(",").map((item) => item.trim()).filter(Boolean);
}

function formatValue(value) {
  if (Array.isArray(value)) return `[${value.join(", ")}]`;
  return String(value);
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return { data: {}, body: content, raw: "" };
  }

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) {
      const arr = parseArrayValue(kv[2]);
      data[kv[1]] = arr !== null ? arr : kv[2];
    }
  }

  return {
    data,
    body: content.slice(match[0].length),
    raw: match[0],
  };
}

function serializeFrontmatter(data, body) {
  const orderedKeys = [
    "id", "session", "title", "date", "agent", "assignee", "role",
    "duration", "status", "priority", "type", "sessions", "tickets",
    "branch", "commit", "reviewer", "source", "source_hash", "roadmap_source",
  ];
  const seen = new Set();
  const lines = [];

  const emit = (key, value) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      lines.push(`${key}: ${formatValue(value)}`);
      return;
    }
    if (value === "") return;
    lines.push(`${key}: ${value}`);
  };

  for (const key of orderedKeys) {
    if (data[key] !== undefined) {
      emit(key, data[key]);
      seen.add(key);
    }
  }

  for (const [key, value] of Object.entries(data)) {
    if (!seen.has(key)) emit(key, value);
  }

  return `---\n${lines.join("\n")}\n---\n\n${body.replace(/^\s+/, "")}`;
}

function updateFrontmatter(filePath, updates) {
  const content = readUtf8(filePath);
  const parsed = parseFrontmatter(content);
  const next = serializeFrontmatter({ ...parsed.data, ...updates }, parsed.body);
  writeUtf8(filePath, next);
}

function sectionContent(markdown, heading) {
  const lines = markdown.split(/\r?\n/);
  const headingLine = `## ${heading}`;
  const start = lines.findIndex((line) => line.trim() === headingLine);

  if (start === -1) return "";

  const body = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) break;
    body.push(lines[i]);
  }

  return body.join("\n").trim();
}

function hasMeaningfulSection(content) {
  const stripped = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line !== "-")
    .filter((line) => !/^-\s*$/.test(line));

  return stripped.length > 0;
}

module.exports = {
  readUtf8,
  writeUtf8,
  parseFrontmatter,
  serializeFrontmatter,
  updateFrontmatter,
  sectionContent,
  hasMeaningfulSection,
};
