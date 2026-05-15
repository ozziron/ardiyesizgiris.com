const { AgentMemory } = require('../memory');
const { AGENT_ROLES, SYSTEM_PROMPTS } = require('../orchestrator');

/**
 * Marketing Agent - Memory-Aware Version
 * Handles positioning, copy, campaigns, and growth tasks.
 */
class MarketingAgent {
  constructor() {
    this.id = 'marketing';
    this.role = AGENT_ROLES.MARKETING;
    this.memory = new AgentMemory(this.id);
    this.systemPrompt = SYSTEM_PROMPTS.MARKETING;
  }

  assignTask(taskDescription, context = {}) {
    const memoryContext = this.memory.getContextForPrompt();

    const fullContext = {
      ...context,
      agentMemory: memoryContext,
      timestamp: new Date().toISOString()
    };

    const taskInstruction = `
You are a Growth Marketing Agent for ardiyesizgiris.com.

TASK: ${taskDescription}

CONTEXT FROM YOUR MEMORY:
${JSON.stringify(memoryContext, null, 2)}

INSTRUCTIONS:
1. Review your recent execution history above
2. Consider your audience learnings and positioning notes
3. Produce concise, logistics-aware marketing output
4. Provide response in JSON format:
{
  "thinking": "your analysis",
  "action": "what you wrote or planned",
  "result": "the expected business outcome",
  "recommendations": ["next steps"],
  "learnings": [
    {
      "title": "what you learned",
      "description": "details",
      "category": "copy/positioning/campaigns/growth/etc"
    }
  ]
}

Keep messaging practical, specific, and credible for logistics professionals.
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

    if (result?.channels) {
      result.channels.forEach(channel => {
        this.memory.addKnowledge('channels', channel);
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
    landingCopy: (audience, offer, proofPoints) => `
Write landing page copy for ardiyesizgiris.com:

Audience: ${audience}
Offer: ${offer}
Proof points:
${proofPoints}

Provide:
1. Headline options
2. Supporting copy
3. CTA text
4. Objection handling
5. Short FAQ copy
    `,

    campaignPlan: (channel, goal, constraints) => `
Plan a growth campaign:

Channel: ${channel}
Goal: ${goal}
Constraints:
${constraints || 'Keep claims credible and relevant to Turkish logistics operators.'}

Provide:
1. Campaign angle
2. Audience segment
3. Message sequence
4. Success metrics
5. Follow-up experiments
    `
  };
}

module.exports = new MarketingAgent();
