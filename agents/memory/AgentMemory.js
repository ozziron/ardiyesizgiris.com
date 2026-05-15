const fs = require('fs');
const path = require('path');

/**
 * Agent Memory System
 * Persistent memory for agents across sessions
 * Stores: execution history, learnings, context, state
 */
class AgentMemory {
  constructor(agentId) {
    this.agentId = agentId;
    this.memoryDir = path.join(__dirname, '../agent-memories');
    this.memoryFile = path.join(this.memoryDir, `${agentId}-memory.json`);
    
    // Create memory directory if it doesn't exist
    if (!fs.existsSync(this.memoryDir)) {
      fs.mkdirSync(this.memoryDir, { recursive: true });
    }

    // Load or initialize memory
    this.data = this.load();
  }

  /**
   * Load memory from disk
   */
  load() {
    if (fs.existsSync(this.memoryFile)) {
      try {
        const raw = fs.readFileSync(this.memoryFile, 'utf8');
        return JSON.parse(raw);
      } catch (error) {
        console.warn(`⚠️  Error loading memory for ${this.agentId}:`, error.message);
        return this.initializeMemory();
      }
    }
    return this.initializeMemory();
  }

  /**
   * Initialize empty memory structure
   */
  initializeMemory() {
    return {
      agentId: this.agentId,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      
      // Task execution history
      executionHistory: [],
      
      // Learnings and improvements
      learnings: [],
      
      // Current context/state
      currentContext: {},
      
      // Stats
      stats: {
        totalTasksCompleted: 0,
        successCount: 0,
        failureCount: 0,
        averageSuccessRate: 100
      },
      
      // Preferences and configuration
      preferences: {
        tone: 'professional',
        outputFormat: 'json',
        detailLevel: 'detailed'
      },
      
      // Knowledge base (agent-specific)
      knowledgeBase: {
        technologies: [],
        patterns: [],
        bestPractices: []
      }
    };
  }

  /**
   * Save memory to disk
   */
  save() {
    try {
      this.data.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.memoryFile, JSON.stringify(this.data, null, 2));
      console.log(`💾 Memory saved for ${this.agentId}`);
    } catch (error) {
      console.error(`❌ Error saving memory for ${this.agentId}:`, error.message);
    }
  }

  /**
   * Record a task execution
   */
  recordExecution(task, result, duration) {
    const execution = {
      id: `exec_${Date.now()}`,
      timestamp: new Date().toISOString(),
      task,
      result,
      duration,
      status: result.success ? 'success' : 'error'
    };

    this.data.executionHistory.push(execution);
    
    // Keep only last 50 executions
    if (this.data.executionHistory.length > 50) {
      this.data.executionHistory.shift();
    }

    // Update stats
    if (result.success) {
      this.data.stats.successCount++;
    } else {
      this.data.stats.failureCount++;
    }
    this.data.stats.totalTasksCompleted++;
    this.data.stats.averageSuccessRate = 
      (this.data.stats.successCount / this.data.stats.totalTasksCompleted) * 100;

    this.save();
    return execution;
  }

  /**
   * Add a learning/insight
   */
  addLearning(title, description, category = 'general') {
    const learning = {
      id: `learn_${Date.now()}`,
      title,
      description,
      category,
      timestamp: new Date().toISOString()
    };

    this.data.learnings.push(learning);
    
    // Keep only last 30 learnings
    if (this.data.learnings.length > 30) {
      this.data.learnings.shift();
    }

    this.save();
    return learning;
  }

  /**
   * Get recent context for prompt
   */
  getContextForPrompt(limit = 5) {
    const recentExecutions = this.data.executionHistory.slice(-limit);
    const recentLearnings = this.data.learnings.slice(-3);

    return {
      recentHistory: recentExecutions.map(e => ({
        task: e.task,
        outcome: e.status,
        duration: e.duration
      })),
      learnings: recentLearnings.map(l => ({
        title: l.title,
        description: l.description
      })),
      stats: this.data.stats,
      preferences: this.data.preferences
    };
  }

  /**
   * Update current context
   */
  updateContext(contextData) {
    this.data.currentContext = {
      ...this.data.currentContext,
      ...contextData,
      lastUpdated: new Date().toISOString()
    };
    this.save();
  }

  /**
   * Get current context
   */
  getContext() {
    return this.data.currentContext;
  }

  /**
   * Add to knowledge base
   */
  addKnowledge(type, item) {
    // type: 'technologies', 'patterns', 'bestPractices'
    if (this.data.knowledgeBase[type]) {
      if (!this.data.knowledgeBase[type].includes(item)) {
        this.data.knowledgeBase[type].push(item);
        this.save();
      }
    }
  }

  /**
   * Get full memory snapshot
   */
  getSnapshot() {
    return this.data;
  }

  /**
   * Clear history (but keep stats and learnings)
   */
  clearHistory() {
    this.data.executionHistory = [];
    this.save();
  }

  /**
   * Get summary for display
   */
  getSummary() {
    return {
      agent: this.agentId,
      totalTasks: this.data.stats.totalTasksCompleted,
      successRate: `${this.data.stats.averageSuccessRate.toFixed(2)}%`,
      recentLearnings: this.data.learnings.slice(-3),
      lastTaskTime: this.data.executionHistory[this.data.executionHistory.length - 1]?.timestamp || 'Never'
    };
  }
}

module.exports = AgentMemory;