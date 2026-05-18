const { ROLES } = require("../orchestrator/constants");
const { stripMarkdown, normalizeText, hashText } = require("./text");
const { readUtf8 } = require("./frontmatter");

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

function inferRole(text, fallback) {
  const roleMatch = text.match(/\*\*Rol:\*\*\s*([^.\n]+)/i);
  if (roleMatch) {
    const raw = stripMarkdown(roleMatch[1]).trim().toLowerCase();
    if (ROLES.includes(raw)) return raw;
    if (raw.includes("i18n") || raw.includes("developer")) return "developer";
    if (raw.includes("designer")) return "designer";
    if (raw.includes("marketing")) return "marketing";
    if (raw.includes("review")) return "reviewer";
    if (raw.includes("qa") || raw.includes("test")) return "qa";
  }
  return fallback || "developer";
}

function extractRoadmapField(raw, field) {
  const pattern = new RegExp(`\\*\\*${field}:\\*\\*\\s*([^.\n]+)`, "i");
  const match = raw.match(pattern);
  return match ? stripMarkdown(match[1]).trim() : "";
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

  return scope.length > 0
    ? scope
    : ["Roadmap maddesinde adı geçen ilgili ekran, component, API veya dokümantasyon alanı"];
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

function inferAgentInstruction(raw, fallbackRole) {
  const role = inferRole(raw, fallbackRole);

  if (role === "designer") {
    return "UI davranışını mevcut tasarım sistemiyle uyumlu tut; görsel değişikliklerde ekranı çalıştırıp desktop/mobile taşma ve okunabilirlik kontrolü yap.";
  }
  if (role === "marketing") {
    return "Logistics audience'a yönelik kısa ve data-driven copy üret; ticket kapsamını aşma.";
  }
  if (role === "reviewer") {
    return "Worker'ın doldurduğu Verification bölümünü birebir tekrar et; aksaklık varsa back-to-todo, temizse done + commit + reviewer alanlarını doldur.";
  }
  if (role === "qa") {
    return "Ticket'taki verification adımlarını birebir uygula; pass/fail kanıtla raporla; done'a alma.";
  }
  return "Mevcut Next.js/Prisma/agent CLI kalıplarını takip et; kapsamı ticket ile sınırlı tut ve ilgili type check veya akış doğrulamasını çalıştır.";
}

function roadmapTaskDetails(raw, fallbackRole) {
  return {
    role: inferRole(raw, fallbackRole),
    size: extractRoadmapField(raw, "Boyut") || "Belirtilmedi",
    cleanText: stripMarkdown(raw),
    scopeItems: inferScopeItems(raw),
    verificationItems: inferVerificationItems(raw),
    agentInstruction: inferAgentInstruction(raw, fallbackRole),
  };
}

// v2 body: 6 başlık (Ne ve Neden / Nasıl Yapılır / Sonuç / Etkilenen Dosyalar
// / Sıradaki Adım / Kapanış). Roadmap source moves to frontmatter.
function roadmapTicketBody(task, fallbackRole) {
  const details = roadmapTaskDetails(task.raw, fallbackRole);
  const scopeBullets = details.scopeItems.map((item) => `  - ${item}`).join("\n");
  const verifBullets = details.verificationItems.map((item) => `  - ${item}`).join("\n");

  return `## Ne ve Neden
- **Amaç:** ${details.cleanText}
- **Rol:** ${details.role}
- **Boyut:** ${details.size}
- **Kapsam:**
${scopeBullets}
- **Tamam sayılır:** Amaç gerçekleşti, etkilenen dosyalar listelendi, doğrulama yapıldı.

## Nasıl Yapılır
- **Yaklaşım:** ${details.agentInstruction}
- **Doğrulama önerisi:**
${verifBullets}

## Sonuç
- **Yapıldı:** _(execution sırasında doldur)_
- **Doğrulandı:** _(çıktı/komut sonuçları)_

## Etkilenen Dosyalar
-

## Sıradaki Adım
-

## Kapanış
-
`;
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

module.exports = {
  inferType,
  inferRole,
  titleFromRoadmapItem,
  roadmapTaskDetails,
  roadmapTicketBody,
  parseRoadmapTasks,
};
