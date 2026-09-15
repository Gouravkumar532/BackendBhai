// packages/cli/src/commands/status.js
// `backendbhai status` — Shows whether BackendBhai is running.

const fs = require('fs');
const path = require('path');
const log = require('../utils/logger');
const docker = require('../utils/docker');
const { getBBDir } = require('./start');

async function run() {
  const bbDir = getBBDir();

  log.banner();

  if (!fs.existsSync(path.join(bbDir, 'docker-compose.yml'))) {
    log.error('BackendBhai is not installed.');
    console.log(`  Run ${log.CYAN}backendbhai start${log.NC} first.`);
    console.log('');
    process.exit(1);
  }

  const { running, services } = docker.getStatus(bbDir);

  if (services.length === 0) {
    log.warn('BackendBhai is installed but no containers are running.');
    console.log(`  Start it with: ${log.CYAN}backendbhai start${log.NC}`);
    console.log('');
    return;
  }

  console.log(`  ${log.BOLD}Service${log.NC}              ${log.BOLD}State${log.NC}       ${log.BOLD}Status${log.NC}`);
  console.log(`  ${'─'.repeat(50)}`);
  for (const svc of services) {
    const stateColor = svc.state === 'running' ? log.GREEN : log.RED;
    const name = (svc.name || '').padEnd(20);
    const state = (svc.state || '').padEnd(12);
    console.log(`  ${name}${stateColor}${state}${log.NC}${svc.status || ''}`);
  }
  console.log('');

  if (running) {
    console.log(`  ${log.GREEN}${log.BOLD}All services running.${log.NC}`);
    console.log(`  Dashboard: ${log.CYAN}http://localhost:4001${log.NC}`);
  } else {
    console.log(`  ${log.YELLOW}Some services are not running.${log.NC}`);
    console.log(`  Try: ${log.CYAN}backendbhai start${log.NC}`);
  }
  console.log('');
}

module.exports = { run };
