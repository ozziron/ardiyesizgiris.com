function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function parseArgs(argv) {
  const args = [];
  const flags = {};

  for (let i = 0; i < argv.length; i++) {
    const value = argv[i];
    if (value.startsWith("--")) {
      const key = value.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        flags[key] = true;
      } else {
        flags[key] = next;
        i++;
      }
    } else {
      args.push(value);
    }
  }

  return { args, flags };
}

module.exports = { fail, today, parseArgs };
