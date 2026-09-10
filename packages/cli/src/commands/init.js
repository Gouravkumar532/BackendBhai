// packages/cli/src/commands/init.js
// `backendbhai init` — Auto-instruments a Node.js project to send traces to BackendBhai.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const log = require('../utils/logger');

const OTEL_PACKAGES = [
  '@opentelemetry/sdk-node',
  '@opentelemetry/auto-instrumentations-node',
  '@opentelemetry/exporter-trace-otlp-http',
  '@opentelemetry/resources',
  '@opentelemetry/semantic-conventions',
];

/**
 * Detect which package manager the project uses.
 */
function detectPackageManager(projectDir) {
  if (fs.existsSync(path.join(projectDir, 'pnpm-lock.yaml')))    return 'pnpm';
  if (fs.existsSync(path.join(projectDir, 'yarn.lock')))         return 'yarn';
  if (fs.existsSync(path.join(projectDir, 'bun.lockb')))         return 'bun';
  if (fs.existsSync(path.join(projectDir, 'package-lock.json'))) return 'npm';
  return 'npm'; // default
}

/**
 * Detect the main entry file from package.json.
 */
function detectEntryFile(pkg) {
  // Check common script fields for the entry point
  if (pkg.scripts) {
    // Look for dev/start scripts to find the entry file
    const devScript = pkg.scripts.dev || pkg.scripts.start || '';
    // Match the first argument that doesn't start with a dash
    const parts = devScript.split(' ');
    const cmdIndex = parts.findIndex(p => ['node', 'nodemon', 'ts-node', 'tsx'].includes(p));
    if (cmdIndex !== -1) {
      const entry = parts.slice(cmdIndex + 1).find(p => !p.startsWith('-'));
      if (entry) return entry;
    }
  }
  if (pkg.main) return pkg.main;
  // Common defaults
  if (fs.existsSync('src/index.js'))  return 'src/index.js';
  if (fs.existsSync('src/index.ts'))  return 'src/index.ts';
  if (fs.existsSync('src/app.js'))    return 'src/app.js';
  if (fs.existsSync('src/app.ts'))    return 'src/app.ts';
  if (fs.existsSync('index.js'))      return 'index.js';
  if (fs.existsSync('server.js'))     return 'server.js';
  if (fs.existsSync('app.js'))        return 'app.js';
  return 'src/index.js'; // fallback
}

async function run() {
  const TOTAL = 4;
  const projectDir = process.cwd();

  log.banner();

  // ─── Step 1: Validate this is a Node.js project ──────────
  log.step(1, TOTAL, 'Detecting project...');

  const pkgPath = path.join(projectDir, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    log.error('No package.json found in the current directory.');
    console.log('');
    console.log('  Make sure you run this command from your Node.js project root:');
    console.log(`  ${log.CYAN}cd your-project && backendbhai init${log.NC}`);
    console.log('');
    process.exit(1);
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const projectName = pkg.name || path.basename(projectDir);
  const pm = detectPackageManager(projectDir);
  const entryFile = detectEntryFile(pkg);

  log.success(`Found project: ${log.BOLD}${projectName}${log.NC}`);
  log.info(`Package manager: ${pm}`);
  log.info(`Entry file: ${entryFile}`);

  // ─── Step 2: Install OpenTelemetry packages ───────────────
  log.step(2, TOTAL, 'Installing OpenTelemetry packages...');

  const installCmd = {
    npm:  `npm install ${OTEL_PACKAGES.join(' ')}`,
    yarn: `yarn add ${OTEL_PACKAGES.join(' ')}`,
    pnpm: `pnpm add ${OTEL_PACKAGES.join(' ')}`,
    bun:  `bun add ${OTEL_PACKAGES.join(' ')}`,
  }[pm];

  log.dim(`  ${installCmd}`);
  try {
    execSync(installCmd, { cwd: projectDir, stdio: 'inherit' });
    log.success('OpenTelemetry packages installed');
  } catch {
    log.error('Failed to install packages. Try running manually:');
    console.log(`  ${log.CYAN}${installCmd}${log.NC}`);
    process.exit(1);
  }

  // ─── Step 3: Create the preload file ──────────────────────
  log.step(3, TOTAL, 'Creating backendbhai.preload.mjs...');

  const preloadDest = path.join(projectDir, 'backendbhai.preload.mjs');

  if (fs.existsSync(preloadDest)) {
    log.warn('backendbhai.preload.mjs already exists — skipping (delete it to regenerate)');
  } else {
    // Read the template and replace placeholders
    const templatePath = path.join(__dirname, '..', '..', 'templates', 'backendbhai.preload.mjs');
    let template = fs.readFileSync(templatePath, 'utf-8');
    template = template.replace('{{SERVICE_NAME}}', projectName);
    fs.writeFileSync(preloadDest, template, 'utf-8');
    log.success('Created backendbhai.preload.mjs');
  }

  // ─── Step 4: Update package.json scripts ──────────────────
  log.step(4, TOTAL, 'Adding dev:traced script to package.json...');

  const tracedScript = `node --import ./backendbhai.preload.mjs ${entryFile}`;

  if (pkg.scripts && pkg.scripts['dev:traced']) {
    log.warn('"dev:traced" script already exists — skipping');
  } else {
    pkg.scripts = pkg.scripts || {};
    pkg.scripts['dev:traced'] = tracedScript;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
    log.success(`Added "dev:traced" script`);
  }

  // ─── Done! ────────────────────────────────────────────────
  console.log('');
  console.log(`${log.BOLD}══════════════════════════════════════════════════${log.NC}`);
  console.log(`${log.GREEN}${log.BOLD}   ✅ BackendBhai connected to ${projectName}!${log.NC}`);
  console.log(`${log.BOLD}══════════════════════════════════════════════════${log.NC}`);
  console.log('');
  console.log(`  ${log.BOLD}1.${log.NC} Make sure BackendBhai is running:`);
  console.log(`     ${log.CYAN}backendbhai start${log.NC}`);
  console.log('');
  console.log(`  ${log.BOLD}2.${log.NC} Run your app with tracing:`);
  console.log(`     ${log.CYAN}${pm} run dev:traced${log.NC}`);
  console.log('');
  console.log(`  ${log.BOLD}3.${log.NC} Open the dashboard:`);
  console.log(`     ${log.CYAN}http://localhost:4001${log.NC}`);
  console.log('');
  console.log(`  ${log.DIM}Every HTTP request, DB query, and service call`);
  console.log(`  will appear in BackendBhai automatically.${log.NC}`);
  console.log('');
}

module.exports = { run };
