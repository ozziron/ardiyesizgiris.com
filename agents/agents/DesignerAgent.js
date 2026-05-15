const { AgentMemory } = require('../memory');
const { AGENT_ROLES, SYSTEM_PROMPTS } = require('../orchestrator');

/**
 * Designer Agent - Memory-Aware Version
 * Handles UI/UX, visual QA, and design system tasks.
 */
class DesignerAgent {
  constructor() {
    this.id = 'designer';
    this.role = AGENT_ROLES.DESIGNER;
    this.memory = new AgentMemory(this.id);
    this.systemPrompt = SYSTEM_PROMPTS.DESIGNER;
  }

  assignTask(taskDescription, context = {}) {
    const memoryContext = this.memory.getContextForPrompt();

    const fullContext = {
      ...context,
      agentMemory: memoryContext,
      timestamp: new Date().toISOString()
    };

    const taskInstruction = `
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

    return {
      agentId: this.id,
      task: taskInstruction,
      memoryContext,
      fullContext
    };
  }

  recordTaskCompletion(taskDescription, result, duration = 0) {
    const success = result?.thinking ? true : false;
    this.memory.recordExecution(taskDescription, { success }, duration);

    if (result?.learnings && Array.isArray(result.learnings)) {
      result.learnings.forEach(learning => {
        this.memory.addLearning(
          learning.title,
          learning.description,
          learning.category
        );
      });
    }

    if (result?.technologies) {
      result.technologies.forEach(tech => {
        this.memory.addKnowledge('technologies', tech);
      });
    }

    return this.memory.getSummary();
  }

  getStatus() {
    return this.memory.getSummary();
  }

  getMemory() {
    return this.memory.getSnapshot();
  }

  clearHistory() {
    this.memory.clearHistory();
    return { message: 'History cleared', summary: this.memory.getSummary() };
  }

  updatePreferences(prefs) {
    this.memory.data.preferences = {
      ...this.memory.data.preferences,
      ...prefs
    };
    this.memory.save();
    return this.memory.data.preferences;
  }

  static taskTemplates = {
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
    `
  };
}

module.exports = new DesignerAgent();
