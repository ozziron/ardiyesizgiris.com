const AgentBase = require('./AgentBase');
const { AGENT_ROLES, SYSTEM_PROMPTS } = require('../orchestrator');

// Developer Agent - Memory-Aware Version.
// Handles web development tasks (Next.js + TypeScript + Prisma).
// Mobile platform strategy: see main/MOBILE_STRATEGY.md (PWA-first, no native).

const buildPrompt = (taskDescription, memoryContext) => `
You are a Senior Full-Stack Developer Agent for ardiyesizgiris.com.

TASK: ${taskDescription}

CONTEXT FROM YOUR MEMORY:
${JSON.stringify(memoryContext, null, 2)}

INSTRUCTIONS:
1. Review your recent execution history above
2. Consider your learnings and best practices
3. Execute this task using your accumulated knowledge
4. Provide response in JSON format:
{
  "thinking": "your analysis",
  "action": "what you did",
  "result": "the outcome",
  "recommendations": ["next steps"],
  "learnings": [
    {
      "title": "what you learned",
      "description": "details",
      "category": "code/architecture/performance/etc"
    }
  ]
}

Be thorough, reference past successes, and continuously improve.
    `;

const taskTemplates = {
  codeReview: (code, context) => `
Review the following code for quality, performance, and best practices:

\`\`\`
${code}
\`\`\`

Context: ${context || 'Next.js / TypeScript project'}

Analyze:
1. Code quality and readability
2. Security issues
3. Performance problems
4. Best practices violations
5. Improvement suggestions
    `,

  implementFeature: (featureName, requirements, techStack) => `
Implement a new feature for ardiyesizgiris.com:

Feature: ${featureName}
Requirements:
${requirements}

Tech Stack: ${techStack || 'Next.js 15 + TypeScript + PostgreSQL + Prisma'}

Provide:
1. Architecture/design plan
2. Database changes (if needed)
3. API endpoints
4. React components
5. Testing strategy
    `,

  fixBug: (bugDescription, errorLogs, affectedCode) => `
Fix the following bug:

Bug: ${bugDescription}

Error logs:
\`\`\`
${errorLogs}
\`\`\`

Affected code:
\`\`\`
${affectedCode}
\`\`\`

Provide: Root cause, fix, why it works, how to test
    `,
};

module.exports = new AgentBase({
  id: 'developer',
  role: AGENT_ROLES.DEVELOPER,
  systemPrompt: SYSTEM_PROMPTS.DEVELOPER,
  knowledgeField: 'technologies',
  buildPrompt,
  taskTemplates,
});
