// Single source of truth for ticket assignee/role enums and per-role prompts.
// Shared by main/agents/ticket.js and control-panel/server.js.

// Who actually executes the ticket — Claude Code variants only.
// Multi-CLI (gemini/codex/deepseek) removed 2026-07.
const ASSIGNEES = [
  "opus",
  "claude",
  "human",
  "unassigned",
];

// What "hat" they are wearing for this ticket.
// marketing/qa removed 2026-07 (single-person team).
const ROLES = [
  "developer",
  "designer",
  "reviewer",
  "database",
  "unassigned",
];

// Backwards-compatible name kept so existing modules that import
// `AGENT_ROLES` keep working.
const AGENT_ROLES = ROLES.reduce((acc, role) => {
  acc[role.toUpperCase()] = role;
  return acc;
}, {});

const AGENT_STATUS = {
  IDLE: "idle",
  ACTIVE: "active",
  ERROR: "error",
  LOADING: "loading",
};

const SYSTEM_PROMPTS_BY_ROLE = {
  developer: `You are a Senior Full-Stack Developer for ardiyesizgiris.com.
Follow Next.js/Prisma patterns already in the repo. Keep scope
limited to the active ticket, run the smallest meaningful verification
(typecheck or flow check) and stop at in-review.`,

  designer: `You are a UI/UX Designer for ardiyesizgiris.com.
Match the existing design system (shadcn/ui + Tailwind), check desktop
and mobile overflow, and keep changes confined to the ticket scope.`,

  reviewer: `You are the reviewing agent for ardiyesizgiris.com.
You review in-review tickets, verify the worker's evidence against
the ticket body, and may move tickets from in-review to done after
verification. Push to GitHub only with user approval.`,

  database: `You are the Database/Data agent for ardiyesizgiris.com.
You normalize carrier tariff sources (PDF/screenshot/email/web) into
main/data/tariffs/*.json packs, always run db:import-tariffs dry-run
first, and apply only after explicit user approval (verified: true).
Never migrate, never delete rows, take a prod export backup before
applying to prod, and stop at in-review.`,
};

// Backwards-compat: legacy callers used UPPER_CASE keys
// (SYSTEM_PROMPTS.DEVELOPER). Re-export both shapes.
const SYSTEM_PROMPTS = Object.entries(SYSTEM_PROMPTS_BY_ROLE).reduce(
  (acc, [role, prompt]) => {
    acc[role] = prompt;
    acc[role.toUpperCase()] = prompt;
    return acc;
  },
  {}
);

module.exports = {
  ASSIGNEES,
  ROLES,
  AGENT_ROLES,
  AGENT_STATUS,
  SYSTEM_PROMPTS,
  SYSTEM_PROMPTS_BY_ROLE,
};
