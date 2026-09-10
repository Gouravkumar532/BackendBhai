// packages/cli/src/commands/start.js
// `backendbhai start` — Boots the BackendBhai monitoring platform.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const log = require('../utils/logger');
const docker = require('../utils/docker');

const REPO_URL = 'https://github.com/Gouravkumar532/BackendBhai.git';

/**
 * Resolve the BackendBhai installation directory.
 * Uses ~/.backendbhai on all platforms.
 */
function getBBDir() {
  const home = process.env.HOME || process.env.USERPROFILE;
  return path.join(home, '.backendbhai');
}

/**
 * Wait for a URL to respond with an HTTP 200.
 */
function waitForHealth(url, timeoutMs = 90000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve();
        } else {
          retry();
        }
      });
      req.on('error', retry);
      req.setTimeout(3000, () => { req.destroy(); retry(); });
    };
    const retry = () => {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timed out waiting for ${url}`));
      } else {
        setTimeout(check, 2000);
      }
    };
    check();
  });
}

async function run() {
  const TOTAL = 3;
  const bbDir = getBBDir();

  log.banner();

  // ─── Step 1: Check Docker ─────────────────────────────────
  log.step(1, TOTAL, 'Checking Docker...');
  docker.ensureDocker();
  log.success('Docker is ready');

  // ─── Step 2: Start Docker containers ──────────────────────
  log.step(2, TOTAL, 'Starting containers...');

  if (!fs.existsSync(path.join(bbDir, 'docker-compose.yml'))) {
    log.error('BackendBhai installation not found in ~/.backendbhai');
    console.log(`  Please run the installer script again.`);
    process.exit(1);
  }

  docker.compose(bbDir, ['up', '-d', '--build']);
  log.success('Containers started');

  // ─── Step 3: Wait for healthy ─────────────────────────────
  log.step(3, TOTAL, 'Waiting for BackendBhai to be ready...');
  log.dim('  This may take a minute on first run (building images)...');

  try {
    await waitForHealth('http://localhost:4001/health', 120000);
    log.success('BackendBhai is healthy');
  } catch {
    log.warn('Health check timed out — the platform may still be starting.');
    log.warn('Check status with: backendbhai status');
  }

  // ─── Done! ────────────────────────────────────────────────
  log.ready();
  console.log(`  ${log.BOLD}Next step:${log.NC} Connect your project:`);
  console.log(`  ${log.CYAN}cd your-project && backendbhai init${log.NC}`);
  console.log('');
}

module.exports = { run, getBBDir };
