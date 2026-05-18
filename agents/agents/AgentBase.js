const { AgentMemory } = require('../memory');

/**
 * Common lifecycle for role-specific agents (Developer, Designer, Marketing).
 *
 * Subclasses configure four things via the constructor options:
 *   - id              : memory namespace + identifier (e.g. 'developer')
 *   - role            : AGENT_ROLES.* value
 *   - systemPrompt    : SYSTEM_PROMPTS.* value
 *   - knowledgeField  : `result.<field>` whose items are stored as knowledge
 *                       (e.g. 'technologies' for dev/design, 'channels' for marketing)
 *   - buildPrompt(task, memoryContext) -> string : role-specific task instruction
 *   - taskTemplates   : optional static templates (preserved for compatibility)
 */
class AgentBase {
  constructor({ id, role, systemPrompt, knowledgeField, buildPrompt, taskTemplates }) {
    this.id = id;
    this.role = role;
    this.systemPrompt = systemPrompt;
    this.memory = new AgentMemory(id);
    this._knowledgeField = knowledgeField;
    this._buildPrompt = buildPrompt;
    this.taskTemplates = taskTemplates || {};
  }

  assignTask(taskDescription, context = {}) {
    const memoryContext = this.memory.getContextForPrompt();
    const fullContext = {
      ...context,
      agentMemory: memoryContext,
      timestamp: new Date().toISOString(),
    };
    const task = this._buildPrompt(taskDescription, memoryContext);
    return { agentId: this.id, task, memoryContext, fullContext };
  }

  recordTaskCompletion(taskDescription, result, duration = 0) {
    const success = result?.thinking ? true : false;
    this.memory.recordExecution(taskDescription, { success }, duration);

    if (Array.isArray(result?.learnings)) {
      result.learnings.forEach((learning) => {
        this.memory.addLearning(learning.title, learning.description, learning.category);
      });
    }

    const field = this._knowledgeField;
    if (field && Array.isArray(result?.[field])) {
      result[field].forEach((item) => this.memory.addKnowledge(field, item));
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
      ...prefs,
    };
    this.memory.save();
    return this.memory.data.preferences;
  }
}

module.exports = AgentBase;
