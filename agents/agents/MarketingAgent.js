const AgentBase = require('./AgentBase');
const { AGENT_ROLES, SYSTEM_PROMPTS } = require('../orchestrator');

// Marketing Agent - Memory-Aware Version.
// Handles positioning, copy, campaigns, and growth tasks.

const buildPrompt = (taskDescription, memoryContext) => `
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

const taskTemplates = {
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
    `,
};

module.exports = new AgentBase({
  id: 'marketing',
  role: AGENT_ROLES.MARKETING,
  systemPrompt: SYSTEM_PROMPTS.MARKETING,
  knowledgeField: 'channels',
  buildPrompt,
  taskTemplates,
});
