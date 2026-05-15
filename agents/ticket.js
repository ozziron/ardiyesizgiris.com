#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const STATUSES = ["backlog", "todo", "in-review", "approved", "done"];
const PRIORITIES = ["P0", "P1", "P2", "P3"];
const TYPES = ["feature", "fix", "refactor", "docs", "chore"];
const REQUIRED_REVIEW_SECTIONS = ["Yapılanlar", "Etkilenen Dosyalar", "Verification"];

const repoRoot = path.resolve(__dirname, "..", "..");
const ticketsDir = path.join(repoRoot, "tickets");
const activityLogPath = path.join(repoRoot, "main", "agents", "ACTIVITY_LOG.md");

function usage(exitCode = 0) {
  console.log(`
Ticket CLI

Usage:
  node agents/ticket.js new "Başlık" [--priority P1] [--type fix] [--agent developer]
  node agents/ticket.js start TICKET-004 [--agent developer]
  node agents/ticket.js backlog TICKET-004
  node agents/ticket.js review TICKET-004
  node agents/ticket.js done TICKET-004 --reviewer opus-4.7 [--commit abc123] [--note "Kapanış notu"]
  node agents/ticket.js sync-roadmap main/roadmap.md [--agent developer] [--start]
  node agents/ticket.js enrich-roadmap-tickets main/roadmap.md [--agent developer] [--force]
  node agents/ticket.js check
`);
  process.exit(exitCode);
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function parseArgs(argv) {
  const args = [];
  const flags = {};

  for (let i = 0; i < argv.length; i++) {
    const value = argv[i];
    if (value.startsWith("--")) {
      const key = value.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        flags[key] = true;
      } else {
        flags[key] = next;
        i++;
      }
    } else {
      args.push(value);
    }
  }

  return { args, flags };
}

function ensureStructure() {
  if (!fs.existsSync(ticketsDir)) {
    fail(`tickets directory not found: ${ticketsDir}`);
  }

  for (const status of STATUSES) {
    const statusDir = path.join(ticketsDir, status);
    if (!fs.existsSync(statusDir)) {
      fs.mkdirSync(statusDir, { recursive: true });
    }
  }
}

function readUtf8(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function writeUtf8(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function listTicketFiles() {
  ensureStructure();
  const files = [];

  for (const status of STATUSES) {
    const dir = path.join(ticketsDir, status);
    for (const name of fs.readdirSync(dir)) {
      if (/^TICKET-\d{3}-.+\.md$/.test(name)) {
        files.push({
          status,
          name,
          path: path.join(dir, name),
        });
      }
    }
  }

  return files.sort((a, b) => a.name.localeCompare(b.name));
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
      data[kv[1]] = kv[2];
    }
  }

  return {
    data,
    body: content.slice(match[0].length),
    raw: match[0],
  };
}

function serializeFrontmatter(data, body) {
  const orderedKeys = ["id", "title", "date", "agent", "status", "priority", "type", "branch", "commit", "reviewer", "source", "source_hash"];
  const seen = new Set();
  const lines = [];

  for (const key of orderedKeys) {
    if (data[key] !== undefined && data[key] !== "") {
      lines.push(`${key}: ${data[key]}`);
      seen.add(key);
    }
  }

  for (const [key, value] of Object.entries(data)) {
    if (!seen.has(key) && value !== undefined && value !== "") {
      lines.push(`${key}: ${value}`);
    }
  }

  return `---\n${lines.join("\n")}\n---\n\n${body.replace(/^\s+/, "")}`;
}

function updateFrontmatter(filePath, updates) {
  const content = readUtf8(filePath);
  const parsed = parseFrontmatter(content);
  const next = serializeFrontmatter({ ...parsed.data, ...updates }, parsed.body);
  writeUtf8(filePath, next);
}

function findTicket(ticketId) {
  const normalized = ticketId.toUpperCase();
  const matches = listTicketFiles().filter((file) => file.name.startsWith(`${normalized}-`));

  if (matches.length === 0) {
    fail(`ticket not found: ${ticketId}`);
  }
  if (matches.length > 1) {
    fail(`multiple tickets matched ${ticketId}`);
  }

  return matches[0];
}

function nextTicketId() {
  let max = 0;
  for (const file of listTicketFiles()) {
    const match = file.name.match(/^TICKET-(\d{3})-/);
    if (match) {
      max = Math.max(max, Number(match[1]));
    }
  }

  return `TICKET-${String(max + 1).padStart(3, "0")}`;
}

function slugify(title) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function hashText(value) {
  return crypto.createHash("sha1").update(value.trim()).digest("hex").slice(0, 12);
}

function inferType(text) {
  const normalized = normalizeText(text);

  if (/\bfix|bug|hata|cleanup|duzelt|iyilestir|konfigurasyon|config\b/.test(normalized)) {
    return "fix";
  }
  if (/\brefactor|rewire|migration|migrate|tasima\b/.test(normalized)) {
    return "refactor";
  }
  if (/\bdoc|docs|roadmap|activity log|skills|dokuman\b/.test(normalized)) {
    return "docs";
  }
  if (/\bpush|commit|agent|cli|otomasyon|script|setup\b/.test(normalized)) {
    return "chore";
  }

  return "feature";
}

function inferAgent(text, fallback) {
  const roleMatch = text.match(/\*\*Rol:\*\*\s*([^.\n]+)/i);
  if (roleMatch) {
    return stripMarkdown(roleMatch[1]).trim();
  }

  return fallback;
}

function titleFromRoadmapItem(text) {
  const cleaned = stripMarkdown(text)
    .replace(/\s*Rol:\s*[^.]+\.?/i, "")
    .replace(/\s*Boyut:\s*[^.]+\.?/i, "")
    .trim();
  const taskMatch = cleaned.match(/^(Task\s+#?[A-Za-z0-9.-]+):\s*(.+)$/i);

  if (taskMatch) {
    return `${taskMatch[1]} ${taskMatch[2]}`.trim();
  }

  return cleaned.replace(/[.!?]\s*$/, "");
}

function roadmapTaskDetails(raw, fallbackAgent) {
  return {
    agent: inferAgent(raw, fallbackAgent),
    size: extractRoadmapField(raw, "Boyut") || "Belirtilmedi",
    cleanText: stripMarkdown(raw),
    scopeItems: inferScopeItems(raw),
    verificationItems: inferVerificationItems(raw),
    agentInstruction: inferAgentInstruction(raw, fallbackAgent),
  };
}

function extractRoadmapField(raw, field) {
  const pattern = new RegExp(`\\*\\*${field}:\\*\\*\\s*([^.\n]+)`, "i");
  const match = raw.match(pattern);
  return match ? stripMarkdown(match[1]).trim() : "";
}

function inferScopeItems(raw) {
  const scope = [];
  const fileMatches = raw.match(/`([^`]+)`/g) || [];

  for (const match of fileMatches) {
    const value = match.replace(/`/g, "").trim();
    if (value.includes("/") || value.includes("\\") || /\.[a-z0-9]+$/i.test(value)) {
      scope.push(`\`${value}\``);
    }
  }

  const rawWithoutInlineCode = raw.replace(/`[^`]+`/g, "");
  const routeMatches = rawWithoutInlineCode.match(/(?:^|[\s("'])\/[a-zA-Z0-9/_-]+/g) || [];
  for (const route of routeMatches) {
    const cleanRoute = route.trim().replace(/^["'(]+/, "");
    if (!scope.includes(`\`${cleanRoute}\``)) {
      scope.push(`\`${cleanRoute}\``);
    }
  }

  if (/admin/i.test(raw) && !scope.some((item) => item.includes("admin"))) {
    scope.push("İlgili admin ekranı ve bağlı component/API akışı");
  }
  if (/PDF|CSV|Excel|export/i.test(raw)) {
    scope.push("Export üretim akışı ve kullanıcıya görünen sonuç");
  }
  if (/email|Resend|domain|API key/i.test(raw)) {
    scope.push("Email/Resend konfigürasyonu ve graceful failure davranışı");
  }
  if (/CLI|Agent|activity log|script/i.test(raw)) {
    scope.push("Agent CLI, memory veya activity-log iş akışı");
  }

  return scope.length > 0 ? scope : ["Roadmap maddesinde adı geçen ilgili ekran, component, API veya dokümantasyon alanı"];
}

function inferVerificationItems(raw) {
  const normalized = normalizeText(raw);
  const items = ["`node agents/ticket.js check`"];

  if (/\bi18n|turkce|string|cleanup|toast\b/.test(normalized)) {
    items.push("İlgili dosyalarda hedef metinleri doğrudan grep/inspection ile kontrol et");
    items.push("`npx tsc --noEmit`");
  } else if (/\bdesigner|ui|screen|loader|chart|empty state|mod secim\b/.test(normalized)) {
    items.push("İlgili ekranı tarayıcıda görsel olarak kontrol et");
    items.push("Responsive taşma/overlap kontrolü yap");
    items.push("`npx tsc --noEmit`");
  } else if (/\bapi|resend|email|export|ics|csv|excel|pdf\b/.test(normalized)) {
    items.push("Mutlu yol ve hata yolu için ilgili API/flow kontrolü yap");
    items.push("`npx tsc --noEmit`");
  } else if (/\bcli|agent|activity log|script|roadmap|docs\b/.test(normalized)) {
    items.push("İlgili CLI/script komutunu çalıştır");
    items.push("Oluşan/güncellenen markdown çıktısını doğrudan oku");
  } else {
    items.push("Değişiklik kapsamına uygun en küçük doğrulama komutunu çalıştır");
    items.push("Gerekirse `npx tsc --noEmit`");
  }

  return items;
}

function inferAgentInstruction(raw, fallbackAgent) {
  const agent = inferAgent(raw, fallbackAgent).toLowerCase();

  if (agent.includes("i18n")) {
    return "Türkçe karakter ve ekran metni düzeltmelerinde küçük dosya gruplarıyla çalış; değişiklik sonrası direct inspection/grep ile eksik kalan string olmadığını doğrula.";
  }
  if (agent.includes("designer")) {
    return "UI davranışını mevcut tasarım sistemiyle uyumlu tut; görsel değişikliklerde ekranı çalıştırıp desktop/mobile taşma ve okunabilirlik kontrolü yap.";
  }
  if (agent.includes("developer")) {
    return "Mevcut Next.js/Prisma/agent CLI kalıplarını takip et; kapsamı ticket ile sınırlı tut ve ilgili type check veya akış doğrulamasını çalıştır.";
  }

  return "Ticket kapsamını aşmadan çalış; belirsiz kalan noktaları Sıradaki Adım veya Notlar bölümüne yaz.";
}

function roadmapTicketBody(task, agent) {
  const details = roadmapTaskDetails(task.raw, agent);

  return `## Açıklama
- Bu ticket self-contained çalışılmalıdır; normal geliştirme session'ında roadmap dosyasını tekrar okumaya gerek yoktur.
- Amaç: ${details.cleanText}
- Beklenen rol: ${details.agent}
- Boyut: ${details.size}

## Kapsam
${details.scopeItems.map((item) => `- ${item}`).join("\n")}

## Kabul Kriterleri
- Amaç bölümünde tarif edilen davranış veya düzenleme tamamlanmış olmalı.
- Etkilenen dosyalar ticket içinde A/M/D etiketiyle listelenmeli.
- Verification bölümüne çalıştırılan komutlar ve sonuçları yazılmalı.
- Kapsam dışı veya ertelenen işler Sıradaki Adım bölümünde açıkça belirtilmeli.

## Agent Talimatı
- ${details.agentInstruction}

## Verification Önerisi
${details.verificationItems.map((item) => `- ${item}`).join("\n")}

## Yapılanlar
-

## Etkilenen Dosyalar
-

## Verification
-

## Sıradaki Adım
-

## Notlar / Gotcha
-

## Roadmap Kaynağı
- ${task.raw}
`;
}

function sectionContent(markdown, heading) {
  const lines = markdown.split(/\r?\n/);
  const headingLine = `## ${heading}`;
  const start = lines.findIndex((line) => line.trim() === headingLine);

  if (start === -1) {
    return "";
  }

  const body = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) {
      break;
    }
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

function normalizedAgentName(value) {
  return String(value || "unassigned").trim().toLowerCase() || "unassigned";
}

function ticketAgent(ticket) {
  const content = readUtf8(ticket.path);
  const parsed = parseFrontmatter(content);
  return normalizedAgentName(parsed.data.agent);
}

function validateReviewReady(ticket) {
  const content = readUtf8(ticket.path);
  const missing = [];

  for (const section of REQUIRED_REVIEW_SECTIONS) {
    if (!hasMeaningfulSection(sectionContent(content, section))) {
      missing.push(section);
    }
  }

  if (missing.length > 0) {
    fail(`ticket is not review-ready. Fill these sections first: ${missing.join(", ")}`);
  }
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

function moveTicket(ticket, targetStatus, updates = {}) {
  if (ticket.status === targetStatus) {
    fail(`${ticket.name} is already in ${targetStatus}`);
  }

  const destination = path.join(ticketsDir, targetStatus, ticket.name);
  if (fs.existsSync(destination)) {
    fail(`destination already exists: ${destination}`);
  }

  updateFrontmatter(ticket.path, { status: targetStatus, ...updates });
  fs.renameSync(ticket.path, destination);
  return { ...ticket, status: targetStatus, path: destination };
}

function commandNew(args, flags) {
  const title = args.join(" ").trim();
  if (!title) usage(1);

  const priority = flags.priority || "P2";
  const type = flags.type || "feature";
  const agent = flags.agent || "unassigned";
  const branch = flags.branch || "";
  const source = flags.source || "";
  const sourceHash = flags["source-hash"] || flags.source_hash || "";
  const body = flags.body || `## Açıklama
-

## Yapılanlar
-

## Etkilenen Dosyalar
-

## Verification
-

## Sıradaki Adım
-

## Notlar / Gotcha
-
`;

  if (!PRIORITIES.includes(priority)) {
    fail(`invalid priority: ${priority}. Use ${PRIORITIES.join("|")}`);
  }
  if (!TYPES.includes(type)) {
    fail(`invalid type: ${type}. Use ${TYPES.join("|")}`);
  }

  const id = nextTicketId();
  const filename = `${id}-${slugify(title)}.md`;
  const filePath = path.join(ticketsDir, "backlog", filename);

  if (fs.existsSync(filePath)) {
    fail(`ticket already exists: ${filePath}`);
  }

  const content = `---
id: ${id}
title: ${title}
date: ${today()}
agent: ${agent}
status: backlog
priority: ${priority}
type: ${type}
branch: ${branch}
source: ${source}
source_hash: ${sourceHash}
---

${body}`;

  writeUtf8(filePath, content);
  console.log(`Created ${path.relative(repoRoot, filePath)}`);
  return { id, filePath, title };
}

function parseRoadmapTasks(roadmapPath) {
  const content = readUtf8(roadmapPath);
  const lines = content.split(/\r?\n/);
  const tasks = [];
  let priority = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const priorityMatch = line.match(/^###\s+(P[0-3])\b/);
    if (priorityMatch) {
      priority = priorityMatch[1];
      continue;
    }

    const taskMatch = line.match(/^\s*-\s+\[\s\]\s+(.+)$/);
    if (taskMatch && priority) {
      const raw = taskMatch[1].trim();
      tasks.push({
        raw,
        line: i + 1,
        priority,
        title: titleFromRoadmapItem(raw),
        sourceHash: hashText(raw),
      });
    }
  }

  return tasks;
}

function ticketIdentitySet() {
  const identities = new Set();

  for (const file of listTicketFiles()) {
    const content = readUtf8(file.path);
    const parsed = parseFrontmatter(content);
    if (parsed.data.source_hash) {
      identities.add(`hash:${parsed.data.source_hash}`);
    }
    if (parsed.data.title) {
      identities.add(`title:${normalizeText(parsed.data.title)}`);
    }
  }

  return identities;
}

function commandSyncRoadmap(args, flags) {
  const roadmapArg = args[0] || path.join("main", "roadmap.md");
  const roadmapPath = path.resolve(repoRoot, roadmapArg);
  const agent = flags.agent || "roadmap-sync";

  if (!fs.existsSync(roadmapPath)) {
    fail(`roadmap not found: ${roadmapPath}`);
  }

  const tasks = parseRoadmapTasks(roadmapPath);
  const identities = ticketIdentitySet();
  const created = [];
  const skipped = [];

  for (const task of tasks) {
    const normalizedTitle = normalizeText(task.title);
    const hashKey = `hash:${task.sourceHash}`;
    const titleKey = `title:${normalizedTitle}`;

    if (identities.has(hashKey) || identities.has(titleKey)) {
      skipped.push(task.title);
      continue;
    }

    const result = commandNew([task.title], {
      priority: task.priority,
      type: inferType(task.raw),
      agent: inferAgent(task.raw, agent),
      source: `${path.relative(repoRoot, roadmapPath).replace(/\\/g, "/")}:${task.line}`,
      "source-hash": task.sourceHash,
      body: roadmapTicketBody(task, agent),
    });

    identities.add(hashKey);
    identities.add(titleKey);
    created.push(result);
  }

  console.log(`Roadmap sync complete. Created: ${created.length}, skipped: ${skipped.length}`);

  if (flags.start && created.length > 0) {
    const first = created.sort((a, b) => a.id.localeCompare(b.id))[0];
    commandStart([first.id], { agent });
  }
}

function commandEnrichRoadmapTickets(args, flags) {
  const roadmapArg = args[0] || path.join("main", "roadmap.md");
  const roadmapPath = path.resolve(repoRoot, roadmapArg);
  const agent = flags.agent || "roadmap-sync";

  if (!fs.existsSync(roadmapPath)) {
    fail(`roadmap not found: ${roadmapPath}`);
  }

  const tasksByHash = new Map(parseRoadmapTasks(roadmapPath).map((task) => [task.sourceHash, task]));
  let updated = 0;
  let skipped = 0;

  for (const ticket of listTicketFiles()) {
    if (ticket.status !== "backlog") {
      skipped++;
      continue;
    }

    const content = readUtf8(ticket.path);
    const parsed = parseFrontmatter(content);
    const task = tasksByHash.get(parsed.data.source_hash);

    if (!task) {
      skipped++;
      continue;
    }

    const currentDescription = sectionContent(content, "Açıklama");
    const hasWeakDescription = !hasMeaningfulSection(currentDescription) || currentDescription === "-";
    const hasAcceptanceCriteria = hasMeaningfulSection(sectionContent(content, "Kabul Kriterleri"));

    const force = Boolean(flags.force);
    const hasScope = hasMeaningfulSection(sectionContent(content, "Kapsam"));
    const hasAgentInstruction = hasMeaningfulSection(sectionContent(content, "Agent Talimatı"));
    const hasVerificationSuggestion = hasMeaningfulSection(sectionContent(content, "Verification Önerisi"));

    if (!force && !hasWeakDescription && hasAcceptanceCriteria && hasScope && hasAgentInstruction && hasVerificationSuggestion) {
      skipped++;
      continue;
    }

    const next = serializeFrontmatter(parsed.data, roadmapTicketBody(task, parsed.data.agent || agent));
    writeUtf8(ticket.path, next);
    updated++;
  }

  console.log(`Roadmap ticket enrichment complete. Updated: ${updated}, skipped: ${skipped}`);
}

function commandStart(args, flags) {
  const ticketId = args[0];
  if (!ticketId) usage(1);

  const ticket = findTicket(ticketId);
  if (ticket.status !== "backlog") {
    fail(`ticket must be in backlog before start. Current status: ${ticket.status}`);
  }

  const targetAgent = normalizedAgentName(flags.agent || ticketAgent(ticket));
  const activeTickets = listTicketFiles().filter((file) => file.status === "todo" && ticketAgent(file) === targetAgent);
  if (activeTickets.length > 0) {
    fail(`${targetAgent} already has an active todo ticket: ${activeTickets.map((file) => file.name).join(", ")}`);
  }

  const updates = {
    date: today(),
    agent: targetAgent,
  };

  const moved = moveTicket(ticket, "todo", updates);
  console.log(`Started ${path.relative(repoRoot, moved.path)}`);
}

function commandReview(args) {
  const ticketId = args[0];
  if (!ticketId) usage(1);

  const ticket = findTicket(ticketId);
  if (ticket.status !== "todo") {
    fail(`ticket must be in todo before review. Current status: ${ticket.status}`);
  }

  validateReviewReady(ticket);
  const moved = moveTicket(ticket, "in-review");
  console.log(`Moved to review ${path.relative(repoRoot, moved.path)}`);
}

function commandBacklog(args) {
  const ticketId = args[0];
  if (!ticketId) usage(1);

  const ticket = findTicket(ticketId);
  if (ticket.status !== "todo") {
    fail(`ticket must be in todo before moving back to backlog. Current status: ${ticket.status}`);
  }

  const moved = moveTicket(ticket, "backlog");
  console.log(`Moved back to backlog ${path.relative(repoRoot, moved.path)}`);
}

function commandDone(args, flags) {
  const ticketId = args[0];
  if (!ticketId) usage(1);

  const ticket = findTicket(ticketId);
  if (ticket.status !== "in-review") {
    fail(`ticket must be in in-review before done. Current status: ${ticket.status}`);
  }

  validateDoneReady(ticket, flags);

  if (flags.note) {
    appendSection(ticket.path, "Kapanış Notu", `- ${flags.note}`);
  }

  const updates = {};
  if (flags.commit) {
    updates.commit = flags.commit;
  }
  if (flags.reviewer) {
    updates.reviewer = flags.reviewer;
  }

  const moved = moveTicket(ticket, "done", updates);
  updateActivityLogDone(moved, flags);
  console.log(`Closed ${path.relative(repoRoot, moved.path)}`);
}

function appendSection(filePath, heading, line) {
  const content = readUtf8(filePath);
  if (content.includes(`## ${heading}`)) {
    writeUtf8(filePath, `${content.trimEnd()}\n${line}\n`);
    return;
  }

  writeUtf8(filePath, `${content.trimEnd()}\n\n## ${heading}\n${line}\n`);
}

function updateActivityLogDone(ticket, flags) {
  if (!fs.existsSync(activityLogPath)) {
    return;
  }

  const content = readUtf8(activityLogPath);
  const parsed = parseFrontmatter(readUtf8(ticket.path));
  const marker = parsed.data.id || ticket.name.match(/^(TICKET-\d{3})/)?.[1] || ticket.name;
  const note = flags.note ? ` (${flags.note})` : "";
  const entry = `\n- ${today()} - ${marker} done${flags.commit ? ` commit: ${flags.commit}` : ""}${note}\n`;

  if (content.includes(`${marker} done`)) {
    return;
  }

  writeUtf8(activityLogPath, `${content.trimEnd()}\n${entry}`);
}

function commandCheck() {
  const issues = [];
  const files = listTicketFiles();

  const todoTicketsByAgent = new Map();
  for (const file of files.filter((ticketFile) => ticketFile.status === "todo")) {
    const agent = ticketAgent(file);
    const agentTickets = todoTicketsByAgent.get(agent) || [];
    agentTickets.push(file.name);
    todoTicketsByAgent.set(agent, agentTickets);
  }

  for (const [agent, ticketNames] of todoTicketsByAgent.entries()) {
    if (ticketNames.length > 1) {
      issues.push(`${agent} has more than one active todo ticket: ${ticketNames.join(", ")}`);
    }
  }

  const seenIds = new Map();

  for (const file of files) {
    const content = readUtf8(file.path);
    const parsed = parseFrontmatter(content);
    const idFromName = file.name.match(/^(TICKET-\d{3})-/)?.[1];

    if (!parsed.raw) {
      issues.push(`${file.name}: missing frontmatter`);
      continue;
    }

    for (const key of ["id", "title", "date", "agent", "status", "priority", "type"]) {
      if (!parsed.data[key]) {
        issues.push(`${file.name}: missing frontmatter field "${key}"`);
      }
    }

    if (parsed.data.id !== idFromName) {
      issues.push(`${file.name}: frontmatter id (${parsed.data.id || "missing"}) does not match filename (${idFromName})`);
    }

    if (parsed.data.status !== file.status) {
      issues.push(`${file.name}: frontmatter status (${parsed.data.status || "missing"}) does not match folder (${file.status})`);
    }

    if (parsed.data.priority && !PRIORITIES.includes(parsed.data.priority)) {
      issues.push(`${file.name}: invalid priority "${parsed.data.priority}"`);
    }

    if (parsed.data.type && !TYPES.includes(parsed.data.type)) {
      issues.push(`${file.name}: invalid type "${parsed.data.type}"`);
    }

    if (parsed.data.id) {
      if (seenIds.has(parsed.data.id)) {
        issues.push(`${file.name}: duplicate id also used by ${seenIds.get(parsed.data.id)}`);
      } else {
        seenIds.set(parsed.data.id, file.name);
      }
    }

    if (file.status === "in-review") {
      for (const section of REQUIRED_REVIEW_SECTIONS) {
        if (!hasMeaningfulSection(sectionContent(content, section))) {
          issues.push(`${file.name}: in-review requires non-empty "${section}"`);
        }
      }
    }

    if (file.status === "done") {
      const hasCommit = Boolean(parsed.data.commit);
      const hasClosingNote = hasMeaningfulSection(sectionContent(content, "Kapanış Notu"));
      const hasLegacyCommitNote = /Commit:\s*`?[\w.-]+`?/i.test(content);
      if (!hasCommit && !hasClosingNote && !hasLegacyCommitNote) {
        issues.push(`${file.name}: done requires commit field, commit note, or "Kapanış Notu"`);
      }
    }
  }

  if (issues.length > 0) {
    console.error("Ticket check failed:");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log(`Ticket check passed (${files.length} ticket${files.length === 1 ? "" : "s"})`);
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  const { args, flags } = parseArgs(rest);

  ensureStructure();

  switch (command) {
    case "new":
      commandNew(args, flags);
      break;
    case "start":
      commandStart(args, flags);
      break;
    case "backlog":
      commandBacklog(args);
      break;
    case "review":
      commandReview(args, flags);
      break;
    case "done":
      commandDone(args, flags);
      break;
    case "sync-roadmap":
      commandSyncRoadmap(args, flags);
      break;
    case "enrich-roadmap-tickets":
      commandEnrichRoadmapTickets(args, flags);
      break;
    case "check":
      commandCheck();
      break;
    case "help":
    case "--help":
    case "-h":
      usage(0);
      break;
    default:
      usage(1);
  }
}

main();
