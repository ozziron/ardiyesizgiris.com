// Request (talep) lifecycle: pending -> promoted | rejected.
// Requests are raw user-submitted ideas stored in `requests/<status>/`.
// Promote converts a pending request into a backlog ticket (done by Opus).

const fs = require("fs");
const path = require("path");
const { slugify } = require("./text");
const {
  readUtf8,
  writeUtf8,
  parseFrontmatter,
  serializeFrontmatter,
} = require("./frontmatter");
const { fail, today } = require("./cli-helpers");

const REQUEST_STATUSES = ["pending", "promoted", "rejected"];

function requestsRoot(repoRoot) {
  return path.join(repoRoot, "requests");
}

function ensureRequestsRoot(repoRoot) {
  const root = requestsRoot(repoRoot);
  if (!fs.existsSync(root)) fs.mkdirSync(root, { recursive: true });
  for (const s of REQUEST_STATUSES) {
    const dir = path.join(root, s);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
  return root;
}

function listRequestFiles(repoRoot, filterStatus = null) {
  ensureRequestsRoot(repoRoot);
  const root = requestsRoot(repoRoot);
  const out = [];
  const statuses = filterStatus ? [filterStatus] : REQUEST_STATUSES;
  for (const status of statuses) {
    const dir = path.join(root, status);
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (/^REQ-\d{3}-.+\.md$/.test(name)) {
        out.push({ name, status, path: path.join(dir, name) });
      }
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

function nextRequestId(repoRoot) {
  let max = 0;
  for (const file of listRequestFiles(repoRoot)) {
    const m = file.name.match(/^REQ-(\d{3})-/);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `REQ-${String(max + 1).padStart(3, "0")}`;
}

function findRequest(repoRoot, requestId) {
  const normalized = requestId.toUpperCase();
  const matches = listRequestFiles(repoRoot).filter((f) =>
    f.name.startsWith(`${normalized}-`)
  );
  if (matches.length === 0) fail(`request not found: ${requestId}`);
  if (matches.length > 1) fail(`multiple requests matched ${requestId}`);
  return matches[0];
}

function createRequest(repoRoot, { title, body, submittedBy = "user" }) {
  if (!title || !title.trim()) fail("request: title is required");
  ensureRequestsRoot(repoRoot);
  const id = nextRequestId(repoRoot);
  const slug = slugify(title);
  const filename = `${id}-${slug}.md`;
  const filePath = path.join(requestsRoot(repoRoot), "pending", filename);
  if (fs.existsSync(filePath)) fail(`request already exists: ${filePath}`);

  const data = {
    id,
    date: today(),
    status: "pending",
    title: title.trim(),
    submitted_by: submittedBy,
  };
  const content = serializeFrontmatter(
    data,
    `# Talep\n\n${(body || "").trim() || "-"}\n`
  );
  writeUtf8(filePath, content);
  return { id, path: filePath };
}

function moveRequest(file, targetStatus, updates = {}) {
  if (!REQUEST_STATUSES.includes(targetStatus)) {
    fail(`invalid request status: ${targetStatus}`);
  }
  if (file.status === targetStatus) {
    fail(`${file.name} is already in ${targetStatus}`);
  }
  const content = readUtf8(file.path);
  const parsed = parseFrontmatter(content);
  const nextData = { ...parsed.data, status: targetStatus, ...updates };
  const newContent = serializeFrontmatter(nextData, parsed.body);

  const destDir = path.join(requestsRoot(path.resolve(file.path, "..", "..", "..")), targetStatus);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const destination = path.join(destDir, file.name);
  if (fs.existsSync(destination)) fail(`destination already exists: ${destination}`);

  writeUtf8(file.path, newContent);
  fs.renameSync(file.path, destination);
  return { ...file, status: targetStatus, path: destination };
}

// Promote returns the (parsed) request data plus the path it was moved to.
// Actual ticket creation is handled by the caller (ticket.js commandNew) so
// the body composition logic stays in one place.
function markPromoted(repoRoot, requestId, promotedToTicket) {
  const file = findRequest(repoRoot, requestId);
  if (file.status !== "pending") {
    fail(`request must be in pending to promote. Current: ${file.status}`);
  }
  return moveRequest(file, "promoted", {
    promoted_to: promotedToTicket,
    promoted_at: today(),
  });
}

function rejectRequest(repoRoot, requestId, { reason }) {
  if (!reason || !reason.trim()) fail("request reject: --reason is required");
  const file = findRequest(repoRoot, requestId);
  if (file.status !== "pending") {
    fail(`request must be in pending to reject. Current: ${file.status}`);
  }
  return moveRequest(file, "rejected", { rejected_reason: reason.trim() });
}

function readRequest(repoRoot, requestId) {
  const file = findRequest(repoRoot, requestId);
  const content = readUtf8(file.path);
  const parsed = parseFrontmatter(content);
  return { file, data: parsed.data, body: parsed.body, content };
}

function assetsRoot(repoRoot) {
  return path.join(requestsRoot(repoRoot), "assets");
}

function assetDir(repoRoot, requestId) {
  return path.join(assetsRoot(repoRoot), requestId.toUpperCase());
}

// Saves a single asset buffer under requests/assets/REQ-NNN/<safeName>.
// Returns { storedName, relPath } where relPath is rooted at `requests/`,
// suitable for embedding as `![name](assets/REQ-NNN/foo.png)` inside the
// request body markdown.
function saveAsset(repoRoot, requestId, filename, buffer) {
  const dir = assetDir(repoRoot, requestId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const ext = path.extname(filename || "").toLowerCase() || ".bin";
  const stem = (path.basename(filename || "asset", ext) || "asset")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "asset";

  // Avoid clobbering existing files when names collide.
  let candidate = `${stem}${ext}`;
  let counter = 1;
  while (fs.existsSync(path.join(dir, candidate))) {
    candidate = `${stem}-${counter}${ext}`;
    counter++;
  }
  fs.writeFileSync(path.join(dir, candidate), buffer);
  return {
    storedName: candidate,
    relPath: `assets/${requestId.toUpperCase()}/${candidate}`,
  };
}

module.exports = {
  REQUEST_STATUSES,
  requestsRoot,
  ensureRequestsRoot,
  listRequestFiles,
  nextRequestId,
  findRequest,
  createRequest,
  readRequest,
  markPromoted,
  rejectRequest,
  assetsRoot,
  assetDir,
  saveAsset,
};
