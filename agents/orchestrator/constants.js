// Single source of truth for ticket assignee/role enums and per-role prompts.
// Shared by main/agents/ticket.js and control-panel/server.js.

// Who actually executes the ticket (model / CLI / human)
const ASSIGNEES = [
  "opus",
  "claude",
  "gemini",
  "codex",
  "deepseek",
  "human",
  "unassigned",
];

// What "hat" they are wearing for this ticket
const ROLES = [
  "developer",
  "designer",
  "marketing",
  "reviewer",
  "qa",
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
Follow Next.js/Prisma/agent CLI patterns already in the repo. Keep scope
limited to the active ticket, run the smallest meaningful verification
(typecheck or flow check) and stop at in-review.`,

  designer: `You are a UI/UX Designer for ardiyesizgiris.com.
Match the existing design system, check desktop and mobile overflow,
and keep changes confined to the ticket scope.`,

  marketing: `You are a Growth Marketing agent for ardiyesizgiris.com.
Write copy for logistics professionals, keep it data-driven and short,
and respect the ticket scope.`,

  reviewer: `You are the reviewing CEO (Opus). You may move tickets
from in-review to done after verifying the worker's evidence. You are
the only role allowed to push to GitHub (batched).`,

  qa: `You are a QA agent. Reproduce the verification steps in the
ticket exactly, report pass/fail with evidence, never move the ticket
to done yourself.`,
};

const TOKEN_LIMITS_BY_ROLE = {
  developer: { maxTokens: 4000, dailyBudget: 50000 },
  designer: { maxTokens: 3000, dailyBudget: 30000 },
  marketing: { maxTokens: 2500, dailyBudget: 25000 },
  reviewer: { maxTokens: 4000, dailyBudget: 30000 },
  qa: { maxTokens: 3000, dailyBudget: 25000 },
};

// Backwards-compat: legacy callers used UPPER_CASE keys
// (SYSTEM_PROMPTS.DEVELOPER, TOKEN_LIMITS.DEVELOPER). Re-export both shapes.
const SYSTEM_PROMPTS = Object.entries(SYSTEM_PROMPTS_BY_ROLE).reduce(
  (acc, [role, prompt]) => {
    acc[role] = prompt;
    acc[role.toUpperCase()] = prompt;
    return acc;
  },
  {}
);
const TOKEN_LIMITS = Object.entries(TOKEN_LIMITS_BY_ROLE).reduce(
  (acc, [role, limit]) => {
    acc[role] = limit;
    acc[role.toUpperCase()] = limit;
    return acc;
  },
  {}
);

const MODEL_CONFIG = {
  model: "claude-opus-4-7",
  temperature: 0.3,
  topP: 0.9,
};

module.exports = {
  ASSIGNEES,
  ROLES,
  AGENT_ROLES,
  AGENT_STATUS,
  SYSTEM_PROMPTS,
  SYSTEM_PROMPTS_BY_ROLE,
  TOKEN_LIMITS,
  TOKEN_LIMITS_BY_ROLE,
  MODEL_CONFIG,
};
