// packages/cli/src/utils/docker.js
// Docker helpers — zero dependencies.

const { execSync, spawnSync } = require('child_process');
const log = require('./logger');

/**
 * Check if a command exists on the system.
 */
function commandExists(cmd) {
  try {
    const which = process.platform === 'win32' ? 'where' : 'which';
    const result = spawnSync(which, [cmd], { stdio: 'pipe' });
    return result.status === 0;
  } catch {
    return false;
  }
}

/**
 * Check that Docker + Docker Compose are installed and Docker is running.
 * Exits with an error if anything is missing.
 */
function ensureDocker() {
  if (!commandExists('docker')) {
    log.error('Docker is not installed.');
    console.log('');
    console.log('  Install Docker Desktop:');
    console.log(`  ${log.CYAN}https://www.docker.com/products/docker-desktop/${log.NC}`);
    console.log('');
    process.exit(1);
  }

  // Check Docker daemon is running
  const info = spawnSync('docker', ['info'], { stdio: 'pipe' });
  if (info.status !== 0) {
    log.error('Docker is installed but not running.');
    console.log('');
    console.log('  Start Docker Desktop and wait for it to be ready,');
    console.log('  then try again.');
    console.log('');
    process.exit(1);
  }

  // Check Docker Compose
  const compose = spawnSync('docker', ['compose', 'version'], { stdio: 'pipe' });
  if (compose.status !== 0) {
    log.error('Docker Compose is not available.');
    console.log('');
    console.log('  Docker Compose v2 is bundled with Docker Desktop.');
    console.log('  Update Docker Desktop to get it.');
    console.log('');
    process.exit(1);
  }
}

/**
 * Run `docker compose` with the given args inside the BackendBhai directory.
 * @param {string} bbDir - The BackendBhai installation directory.
 * @param {string[]} args - Arguments to pass to `docker compose`.
 * @param {object} [opts] - Options for execSync.
 */
function compose(bbDir, args, opts = {}) {
  const cmd = `docker compose ${args.join(' ')}`;
  execSync(cmd, { cwd: bbDir, stdio: 'inherit', ...opts });
}

/**
 * Check if BackendBhai containers are running.
 * @param {string} bbDir - The BackendBhai installation directory.
 * @returns {{ running: boolean, services: string[] }}
 */
function getStatus(bbDir) {
  try {
    const output = execSync('docker compose ps --format json', {
      cwd: bbDir,
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf-8',
    });

    const lines = output.trim().split('\n').filter(Boolean);
    const services = [];
    let allRunning = true;

    for (const line of lines) {
      try {
        const svc = JSON.parse(line);
        services.push({
          name: svc.Service || svc.Name,
          state: svc.State,
          status: svc.Status,
        });
        if (svc.State !== 'running') allRunning = false;
      } catch {
        // skip non-JSON lines
      }
    }

    return { running: services.length > 0 && allRunning, services };
  } catch {
    return { running: false, services: [] };
  }
}

module.exports = { commandExists, ensureDocker, compose, getStatus };
