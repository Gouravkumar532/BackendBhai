#!/usr/bin/env node

// ══════════════════════════════════════════════════════════════════════
//  BackendBhai CLI
//
//  Usage:
//    npx backendbhai start     Start the monitoring platform
//    npx backendbhai stop      Stop the platform
//    npx backendbhai init      Connect your Node.js project
//    npx backendbhai status    Check if the platform is running
//    npx backendbhai logs      Tail platform logs
//    npx backendbhai --help    Show help
// ══════════════════════════════════════════════════════════════════════

const log = require('../src/utils/logger');

const COMMANDS = {
  start:  { desc: 'Start the BackendBhai monitoring platform',     mod: '../src/commands/start' },
  stop:   { desc: 'Stop the platform',                             mod: '../src/commands/stop' },
  init:   { desc: 'Connect your Node.js project to BackendBhai',   mod: '../src/commands/init' },
  status: { desc: 'Check if the platform is running',              mod: '../src/commands/status' },
  logs:   { desc: 'Tail platform logs',                            mod: '../src/commands/logs' },
};

function showHelp() {
  log.banner();
  console.log(`  ${log.BOLD}Usage:${log.NC}  npx backendbhai <command>\n`);
  console.log(`  ${log.BOLD}Commands:${log.NC}`);
  for (const [name, { desc }] of Object.entries(COMMANDS)) {
    console.log(`    ${log.CYAN}${name.padEnd(10)}${log.NC} ${desc}`);
  }
  console.log('');
  console.log(`  ${log.BOLD}Quick start:${log.NC}`);
  console.log(`    ${log.CYAN}backendbhai start${log.NC}              ${log.DIM}# start the platform${log.NC}`);
  console.log(`    ${log.CYAN}cd your-app && backendbhai init${log.NC}  ${log.DIM}# connect your project${log.NC}`);
  console.log(`    ${log.CYAN}npm run dev:traced${log.NC}             ${log.DIM}# run with tracing${log.NC}`);
  console.log(`    ${log.DIM}open http://localhost:4001${log.NC}      ${log.DIM}# see everything${log.NC}`);
  console.log('');
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h' || command === 'help') {
    showHelp();
    process.exit(0);
  }

  if (!COMMANDS[command]) {
    log.error(`Unknown command: "${command}"`);
    console.log(`  Run ${log.CYAN}npx backendbhai --help${log.NC} for available commands.`);
    console.log('');
    process.exit(1);
  }

  try {
    const cmd = require(COMMANDS[command].mod);
    await cmd.run();
  } catch (err) {
    log.error(err.message);
    if (process.env.DEBUG) console.error(err.stack);
    process.exit(1);
  }
}

main();
