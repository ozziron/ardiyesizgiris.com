const AgentBase = require('./AgentBase');
const { AGENT_ROLES, SYSTEM_PROMPTS } = require('../orchestrator');

// Designer Agent - Memory-Aware Version.
// Handles UI/UX, visual QA, and design system tasks.

const buildPrompt = (taskDescription, memoryContext) => `
You are a Senior UI/UX Designer Agent for ardiyesizgiris.com.

TASK: ${taskDescription}

CONTEXT FROM YOUR MEMORY:
${JSON.stringify(memoryContext, null, 2)}

INSTRUCTIONS:
1. Review your recent execution history above
2. Consider your design learnings, brand constraints, and accessibility notes
3. Produce practical UI/UX guidance for the logistics workflow
4. Provide response in JSON format:
{
  "thinking": "your analysis",
  "action": "what you designed or recommended",
  "result": "the expected user-facing outcome",
  "recommendations": ["next steps"],
  "learnings": [
    {
      "title": "what you learned",
      "description": "details",
      "category": "ui/ux/accessibility/brand/etc"
    }
  ]
}

Keep the interface practical, accessible, and consistent with the existing product.
    `;

const taskTemplates = {
  reviewScreen: (screenName, currentIssues) => `
Review this screen for usability, hierarchy, accessibility, and visual polish:

Screen: ${screenName}
Issues:
${currentIssues}

Provide:
1. Layout critique
2. Interaction improvements
3. Accessibility risks
4. Responsive behavior notes
5. Prioritized implementation checklist
    `,

  designFlow: (flowName, userGoal, constraints) => `
Design a user flow for ardiyesizgiris.com:

Flow: ${flowName}
User goal: ${userGoal}
Constraints:
${constraints || 'Use the existing Next.js/shadcn UI system and logistics domain language.'}

Provide:
1. Screen-by-screen flow
2. Required UI states
3. Empty/error/loading states
4. Copy guidance
5. QA checklist
    `,
};

module.exports = new AgentBase({
  id: 'designer',
  role: AGENT_ROLES.DESIGNER,
  systemPrompt: SYSTEM_PROMPTS.DESIGNER,
  knowledgeField: 'technologies',
  buildPrompt,
  taskTemplates,
});
