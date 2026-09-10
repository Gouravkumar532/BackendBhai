#!/usr/bin/env node

// ══════════════════════════════════════════════════════════════════════
//  BackendBhai — One-Command Setup (Node.js, cross-platform)
//
//  Usage:  pnpm run setup
//
//  This script assumes Node.js and pnpm are already installed.
//  For full prerequisite checking, use setup.sh or setup.ps1 instead.
// ══════════════════════════════════════════════════════════════════════

const { execSync, spawnSync } = require('child_process');
const http = require('http');

const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BOLD = '\x1b[1m';
const NC = '\x1b[0m';

const info    = (msg) => console.log(`${CYAN}ℹ${NC}  ${msg}`);
const success = (msg) => console.log(`${GREEN}✅${NC} ${msg}`);
const warn    = (msg) => console.log(`${YELLOW}⚠️${NC}  ${msg}`);
const fail    = (msg) => { console.error(`${RED}❌${NC} ${msg}`); process.exit(1); };
const step    = (n, total, msg) => console.log(`\n${BOLD}[${n}/${total}] ${msg}${NC}`);

function run(cmd, opts = {}) {
  try {
    execSync(cmd, { stdio: 'inherit', ...opts });
    return true;
  } catch {
    return false;
  }
}

function commandExists(cmd) {
  try {
    const result = spawnSync(process.platform === 'win32' ? 'where' : 'which', [cmd], {
      stdio: 'pipe',
    });
    return result.status === 0;
  } catch {
    return false;
  }
}

function waitForPort(port, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const req = http.get(`http://localhost:${port}/health`, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timed out waiting for port ${port}`));
        } else {
          setTimeout(check, 2000);
        }
      });
      req.setTimeout(2000, () => {
        req.destroy();
        setTimeout(check, 2000);
      });
    };
    check();
  });
}

(async () => {
  const TOTAL = 5;

  console.log('');
  console.log(`${BOLD}══════════════════════════════════════════════════${NC}`);
  console.log(`${BOLD}   BackendBhai — One-Command Developer Setup      ${NC}`);
  console.log(`${BOLD}══════════════════════════════════════════════════${NC}`);
  console.log('');

  // ─── Step 1: Quick prerequisite check ───────────────────────────
  step(1, TOTAL, 'Checking prerequisites...');

  if (!commandExists('docker')) {
    fail('Docker not found. Install from https://www.docker.com/products/docker-desktop/');
  }
  success('Docker found');

  // Check Docker is running
  const dockerInfo = spawnSync('docker', ['info'], { stdio: 'pipe' });
  if (dockerInfo.status !== 0) {
    fail('Docker is installed but not running. Please start Docker Desktop and try again.');
  }
  success('Docker daemon is running');

  // ─── Step 2: Install dependencies ───────────────────────────────
  step(2, TOTAL, 'Installing dependencies...');
  if (!run('pnpm install --frozen-lockfile')) {
    run('pnpm install') || fail('pnpm install failed');
  }
  success('Dependencies installed');

  // ─── Step 3: Build ──────────────────────────────────────────────
  step(3, TOTAL, 'Building all packages...');
  if (!run('pnpm -r build')) {
    fail('Build failed. Check the output above for errors.');
  }
  success('Build complete');

  // ─── Step 4: Start Docker stack ─────────────────────────────────
  step(4, TOTAL, 'Starting Docker containers...');
  if (!run('docker compose up -d --build')) {
    fail('Docker Compose failed. Is Docker Desktop running?');
  }
  success('Containers started');

  // ─── Step 5: Seed the database ─────────────────────────────────
  step(5, TOTAL, 'Waiting for DB & seeding...');

  // Wait for DevTools core to come up (which implies DB is ready)
  info('Waiting for services to be healthy (up to 60s)...');
  try {
    await waitForPort(4001, 60000);
    success('Services are healthy');
  } catch {
    warn('Timed out waiting for services, attempting seed anyway...');
  }

  if (run('node scripts/seed.js')) {
    success('Database seeded');
  } else {
    warn('Seeding had issues (this is OK for first run)');
  }

  // ─── Done! ──────────────────────────────────────────────────────
  console.log('');
  console.log(`${BOLD}══════════════════════════════════════════════════${NC}`);
  console.log(`${GREEN}${BOLD}   ✅ BackendBhai is ready!${NC}`);
  console.log(`${BOLD}══════════════════════════════════════════════════${NC}`);
  console.log('');
  console.log(`  ${BOLD}DevTools UI:${NC}         ${CYAN}http://localhost:4001${NC}`);
  console.log(`  ${BOLD}OTLP gRPC:${NC}          ${CYAN}http://localhost:4317${NC}`);
  console.log(`  ${BOLD}OTLP HTTP:${NC}          ${CYAN}http://localhost:4318${NC}`);
  console.log(`  ${BOLD}PostgreSQL:${NC}         ${CYAN}localhost:5433${NC}`);
  console.log('');
  console.log(`  ${BOLD}Useful commands:${NC}`);
  console.log(`    docker compose logs -f     ${CYAN}# tail logs${NC}`);
  console.log(`    docker compose down        ${CYAN}# stop everything${NC}`);
  console.log(`    docker compose up -d       ${CYAN}# restart${NC}`);
  console.log('');
})();
