// packages/cli/src/utils/logger.js
// Colored terminal output helpers — zero dependencies.

const BOLD   = '\x1b[1m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const CYAN   = '\x1b[36m';
const DIM    = '\x1b[2m';
const NC     = '\x1b[0m';

const info    = (msg) => console.log(`${CYAN}ℹ${NC}  ${msg}`);
const success = (msg) => console.log(`${GREEN}✅${NC} ${msg}`);
const warn    = (msg) => console.log(`${YELLOW}⚠${NC}  ${msg}`);
const error   = (msg) => console.error(`${RED}✖${NC}  ${msg}`);
const step    = (n, total, msg) => console.log(`\n${BOLD}[${n}/${total}] ${msg}${NC}`);
const dim     = (msg) => console.log(`${DIM}${msg}${NC}`);

const banner = () => {
  console.log('');
  console.log(`${BOLD}══════════════════════════════════════════════════${NC}`);
  console.log(`${BOLD}   BackendBhai${NC} ${DIM}— Chrome DevTools for backends${NC}`);
  console.log(`${BOLD}══════════════════════════════════════════════════${NC}`);
  console.log('');
};

const ready = () => {
  console.log('');
  console.log(`${BOLD}══════════════════════════════════════════════════${NC}`);
  console.log(`${GREEN}${BOLD}   ✅ BackendBhai is running!${NC}`);
  console.log(`${BOLD}══════════════════════════════════════════════════${NC}`);
  console.log('');
  console.log(`  ${BOLD}Dashboard:${NC}  ${CYAN}http://localhost:4001${NC}`);
  console.log(`  ${BOLD}OTLP HTTP:${NC}  ${CYAN}http://localhost:4318${NC}  ${DIM}(point your app here)${NC}`);
  console.log(`  ${BOLD}OTLP gRPC:${NC}  ${CYAN}http://localhost:4317${NC}`);
  console.log('');
};

module.exports = { info, success, warn, error, step, dim, banner, ready, BOLD, GREEN, YELLOW, RED, CYAN, DIM, NC };
