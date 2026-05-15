#!/usr/bin/env node

const readline = require('readline');

const AGENTS = {
  dev: {
    label: 'Developer Agent',
    modulePath: './agents/DeveloperAgent',
    example: 'dev Fix the login bug'
  },
  design: {
    label: 'Designer Agent',
    modulePath: './agents/DesignerAgent',
    example: 'design Improve the calculation result screen'
  },
  market: {
    label: 'Marketing Agent',
    modulePath: './agents/MarketingAgent',
    example: 'market Draft landing page copy for premium users'
  }
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

function loadAgent(agentKey) {
  const config = AGENTS[agentKey];
  if (!config) return null;

  try {
    return require(config.modulePath);
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' && error.message.includes(config.modulePath.replace('./', ''))) {
      return null;
    }
    throw error;
  }
}

function getAgentLabel(agentKey) {
  return AGENTS[agentKey]?.label || 'Unknown Agent';
}

async function showMenu() {
  console.log('\n============================================');
  console.log('    Ardiyesizgiris Agent Orchestrator');
  console.log('    (Memory-Persistent Agents)');
  console.log('============================================\n');

  console.log('Available Agents:');
  console.log('  1. Developer Agent (code, features, bugs, mobile)');
  console.log('  2. Designer Agent (UI/UX, visual QA, design tasks)');
  console.log('  3. Marketing Agent (copy, positioning, campaigns)\n');

  console.log('Commands:');
  console.log('  dev <task>     - Assign task to Developer Agent');
  console.log('  design <task>  - Assign task to Designer Agent');
  console.log('  market <task>  - Assign task to Marketing Agent');
  console.log('  status <agent> - Get agent status (dev/design/market)');
  console.log('  memory <agent> - View agent memory');
  console.log('  clear <agent>  - Clear agent history\n');

  console.log('Example:');
  console.log('  dev Review this code for security issues\n');
}

async function handleCommand(input) {
  const parts = input.trim().split(' ');
  const command = parts[0]?.toLowerCase();
  const agent = parts[1]?.toLowerCase();
  const args = parts.slice(2).join(' ');

  switch (command) {
    case 'dev':
    case 'design':
    case 'market':
      await runAgentTask(command, [agent, ...parts.slice(2)].filter(Boolean).join(' '));
      break;

    case 'status':
      showAgentStatus(agent);
      break;

    case 'memory':
      showAgentMemory(agent);
      break;

    case 'clear':
      clearAgentHistory(agent);
      break;

    case 'help':
      await showMenu();
      break;

    case 'exit':
    case 'quit':
      console.log('\nGoodbye!');
      rl.close();
      process.exit(0);
      break;

    default:
      console.log('Unknown command. Type "help" for available commands.');
  }
}

async function runAgentTask(agentKey, taskDescription) {
  const agentInstance = loadAgent(agentKey);
  const label = getAgentLabel(agentKey);

  if (!agentInstance) {
    console.log(`${label} is not installed yet.`);
    console.log(`Expected module: ${AGENTS[agentKey].modulePath}`);
    return;
  }

  if (!taskDescription) {
    console.log('Please provide a task description.');
    console.log(`Example: ${AGENTS[agentKey].example}`);
    return;
  }

  console.log(`\n${label} is thinking about: "${taskDescription}"\n`);
  console.log('Task instructions with memory context:');
  console.log('-'.repeat(50));

  const taskData = agentInstance.assignTask(taskDescription);

  console.log(taskData.task);
  console.log('-'.repeat(50));

  console.log('\nNow paste the Claude AI response below (include full JSON).');
  console.log('Type "END" on a new line when done:\n');

  let response = '';
  while (true) {
    const line = await prompt('> ');
    if (line.trim().toUpperCase() === 'END') break;
    response += line + '\n';
  }

  try {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) ||
      response.match(/```\n([\s\S]*?)\n```/) ||
      response.match(/\{[\s\S]*\}/);

    const result = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : response);
    const summary = agentInstance.recordTaskCompletion(taskDescription, result);

    console.log('\nTask recorded in memory.');
    console.log('Agent Status:');
    console.log(`   Total Tasks: ${summary.totalTasks}`);
    console.log(`   Success Rate: ${summary.successRate}`);
    console.log(`   Last Task: ${summary.lastTaskTime}`);

    if (result.learnings && result.learnings.length > 0) {
      console.log('\nNew Learnings Added:');
      result.learnings.forEach(learning => {
        console.log(`   - ${learning.title} (${learning.category})`);
      });
    }
  } catch (error) {
    console.log('Could not parse response. Make sure to include valid JSON.');
    console.log('Error:', error.message);
  }
}

function showAgentStatus(agent) {
  const agentKey = agent || 'dev';
  const agentInstance = loadAgent(agentKey);
  const label = getAgentLabel(agentKey);

  if (!AGENTS[agentKey]) {
    console.log('Unknown agent');
    return;
  }
  if (!agentInstance) {
    console.log(`${label} is not installed yet.`);
    return;
  }

  const status = agentInstance.getStatus();
  console.log(`\n${label} Status:`);
  console.log(`   Agent ID: ${status.agent}`);
  console.log(`   Total Tasks: ${status.totalTasks}`);
  console.log(`   Success Rate: ${status.successRate}`);
  console.log(`   Last Task: ${status.lastTaskTime}`);
  console.log(`   Recent Learnings: ${status.recentLearnings.length}`);

  if (status.recentLearnings.length > 0) {
    console.log('\n   Latest Learnings:');
    status.recentLearnings.forEach(learning => {
      console.log(`   - ${learning.title}`);
    });
  }
}

function showAgentMemory(agent) {
  const agentKey = agent || 'dev';
  const agentInstance = loadAgent(agentKey);
  const label = getAgentLabel(agentKey);

  if (!AGENTS[agentKey]) {
    console.log('Unknown agent');
    return;
  }
  if (!agentInstance) {
    console.log(`${label} is not installed yet.`);
    return;
  }

  const memory = agentInstance.getMemory();
  console.log(`\n${label} Memory (Full Snapshot):`);
  console.log('-'.repeat(50));
  console.log(JSON.stringify(memory, null, 2));
  console.log('-'.repeat(50));
}

function clearAgentHistory(agent) {
  const agentKey = agent || 'dev';
  const agentInstance = loadAgent(agentKey);
  const label = getAgentLabel(agentKey);

  if (!AGENTS[agentKey]) {
    console.log('Unknown agent');
    return;
  }
  if (!agentInstance) {
    console.log(`${label} is not installed yet.`);
    return;
  }

  const result = agentInstance.clearHistory();
  console.log('\n' + result.message);
  console.log('Summary:', result.summary);
}

async function main() {
  await showMenu();

  console.log('Start by typing a command (e.g., "dev Your task here")\n');

  const promptUser = async () => {
    const input = await prompt('> ');
    if (input.trim()) {
      await handleCommand(input);
    }
    promptUser();
  };

  promptUser();
}

process.on('SIGINT', () => {
  console.log('\n\nGoodbye!');
  process.exit(0);
});

main().catch(console.error);
