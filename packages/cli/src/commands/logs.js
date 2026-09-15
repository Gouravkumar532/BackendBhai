// packages/cli/src/commands/logs.js
// `backendbhai logs` — Tails BackendBhai platform logs.

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const log = require('../utils/logger');
const { getBBDir } = require('./start');

async function run() {
  const bbDir = getBBDir();

  if (!fs.existsSync(path.join(bbDir, 'docker-compose.yml'))) {
    log.error('BackendBhai is not installed.');
    console.log(`  Run ${log.CYAN}backendbhai start${log.NC} first.`);
    console.log('');
    process.exit(1);
  }

  log.info('Tailing BackendBhai logs (Ctrl+C to stop)...\n');

  const child = spawn('docker', ['compose', 'logs', '-f', '--tail', '50'], {
    cwd: bbDir,
    stdio: 'inherit',
  });

  child.on('error', (err) => {
    log.error(`Failed to tail logs: ${err.message}`);
    process.exit(1);
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
}

module.exports = { run };
