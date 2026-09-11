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

// Well-known framework CLIs that act as the server entry point.
const FRAMEWORK_CMDS = ['next', 'nuxt', 'remix', 'vite', 'nest', 'fastify', 'gatsby', 'expo', 'strapi'];

// Node-like runners that precede a file path.
const NODE_RUNNERS = ['node', 'nodemon', 'ts-node', 'tsx'];

/**
 * Detect the main entry file (or framework command) from package.json.
 *
 * Handles chained scripts like:
 *   "node sync.js && node migrate.js && next dev"
 * by splitting on "&&" and scanning each sub-command for a server entry.
 */
function detectEntryFile(pkg) {
  if (pkg.scripts) {
    const devScript = pkg.scripts.dev || pkg.scripts.start || '';

    // Split chained commands and evaluate each one independently.
    const subCommands = devScript.split('&&').map(s => s.trim()).filter(Boolean);

    // Pass 1: Look for a framework CLI (next dev, nuxt dev, etc.) — these are always the server.
    for (const sub of subCommands) {
      const parts = sub.split(/\s+/);
      // Direct invocation: "next dev"
      const frameworkHit = parts.find(p => FRAMEWORK_CMDS.includes(p));
      if (frameworkHit) {
        // Return as a framework command with its arguments (e.g. "next dev")
        const idx = parts.indexOf(frameworkHit);
        return { type: 'framework', cmd: frameworkHit, args: parts.slice(idx + 1).join(' ') };
      }
      // npx invocation: "npx next dev"
      if (parts[0] === 'npx') {
        const fwk = parts.slice(1).find(p => FRAMEWORK_CMDS.includes(p));
        if (fwk) {
          const idx = parts.indexOf(fwk);
          return { type: 'framework', cmd: fwk, args: parts.slice(idx + 1).join(' ') };
        }
      }
    }

    // Pass 2: Look for a node runner pointing at a file (take the LAST one — earlier ones are usually setup scripts).
    let lastNodeEntry = null;
    for (const sub of subCommands) {
      const parts = sub.split(/\s+/);
      const cmdIndex = parts.findIndex(p => NODE_RUNNERS.includes(p));
      if (cmdIndex !== -1) {
        const entry = parts.slice(cmdIndex + 1).find(p => !p.startsWith('-'));
        if (entry) lastNodeEntry = entry;
      }
    }
    if (lastNodeEntry) return { type: 'file', entry: lastNodeEntry };
  }

  if (pkg.main) return { type: 'file', entry: pkg.main };

  // Common defaults
  const defaults = [
    'src/index.js', 'src/index.ts', 'src/app.js', 'src/app.ts',
    'index.js', 'server.js', 'app.js',
  ];
  for (const d of defaults) {
    if (fs.existsSync(d)) return { type: 'file', entry: d };
  }
  return { type: 'file', entry: 'src/index.js' }; // fallback
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
  const detected = detectEntryFile(pkg);

  // Detect pnpm workspace
  const isPnpmWorkspace = pm === 'pnpm' && fs.existsSync(path.join(projectDir, 'pnpm-workspace.yaml'));

  log.success(`Found project: ${log.BOLD}${projectName}${log.NC}`);
  log.info(`Package manager: ${pm}${isPnpmWorkspace ? ' (workspace)' : ''}`);
  if (detected.type === 'framework') {
    log.info(`Framework: ${detected.cmd}`);
  } else {
    log.info(`Entry file: ${detected.entry}`);
  }

  // ─── Step 2: Install OpenTelemetry packages ───────────────
  log.step(2, TOTAL, 'Installing OpenTelemetry packages...');

  // For pnpm workspaces, use -w to install at the workspace root
  const pnpmAddCmd = isPnpmWorkspace ? 'pnpm add -w' : 'pnpm add';

  const installCmd = {
    npm:  `npm install ${OTEL_PACKAGES.join(' ')}`,
    yarn: `yarn add ${OTEL_PACKAGES.join(' ')}`,
    pnpm: `${pnpmAddCmd} ${OTEL_PACKAGES.join(' ')}`,
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

  // Build the correct traced command based on what we detected
  let tracedScript;
  if (detected.type === 'framework') {
    // For frameworks (next, nuxt, vite, etc.), point to the actual binary inside node_modules
    const binPath = `./node_modules/${detected.cmd}/dist/bin/${detected.cmd}`;
    const binPath2 = `./node_modules/.bin/${detected.cmd}`;

    // Use npx to resolve the binary portably
    const fwkArgs = detected.args ? ` ${detected.args}` : ' dev';
    tracedScript = `node --import ./backendbhai.preload.mjs ${binPath2}${fwkArgs}`;

    // For Windows compat: npx works more reliably than .bin shims with --import
    // We'll use the dist/bin path if it exists for known frameworks
    if (detected.cmd === 'next') {
      tracedScript = `node --import ./backendbhai.preload.mjs ./node_modules/next/dist/bin/next${fwkArgs}`;
    } else if (detected.cmd === 'nuxt') {
      tracedScript = `node --import ./backendbhai.preload.mjs ./node_modules/nuxt/bin/nuxt.mjs${fwkArgs}`;
    } else if (detected.cmd === 'vite') {
      tracedScript = `node --import ./backendbhai.preload.mjs ./node_modules/vite/bin/vite.js${fwkArgs}`;
    }
  } else {
    tracedScript = `node --import ./backendbhai.preload.mjs ${detected.entry}`;
  }

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
