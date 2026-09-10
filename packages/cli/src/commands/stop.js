// packages/cli/src/commands/stop.js
// `backendbhai stop` — Stops the BackendBhai platform.

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

  log.info('Stopping BackendBhai...');
  docker.compose(bbDir, ['down']);
  log.success('BackendBhai stopped.');
  console.log('');
  console.log(`  Restart anytime with: ${log.CYAN}backendbhai start${log.NC}`);
  console.log('');
}

module.exports = { run };
