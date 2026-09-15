#!/usr/bin/env bash
set -euo pipefail

# ══════════════════════════════════════════════════════════════════════
#  BackendBhai — One-Command Developer Setup (macOS / Linux)
#
#  Usage:
#    git clone https://github.com/Gouravkumar532/BackendBhai.git
#    cd BackendBhai
#    chmod +x setup.sh && ./setup.sh
# ══════════════════════════════════════════════════════════════════════

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

info()    { echo -e "${CYAN}ℹ${NC}  $*"; }
success() { echo -e "${GREEN}✅${NC} $*"; }
warn()    { echo -e "${YELLOW}⚠️${NC}  $*"; }
fail()    { echo -e "${RED}❌${NC} $*"; exit 1; }
step()    { echo -e "\n${BOLD}[$1/$TOTAL_STEPS] $2${NC}"; }

TOTAL_STEPS=6

echo ""
echo -e "${BOLD}══════════════════════════════════════════════════${NC}"
echo -e "${BOLD}   BackendBhai — One-Command Developer Setup      ${NC}"
echo -e "${BOLD}══════════════════════════════════════════════════${NC}"
echo ""

# ─── Step 1: Check prerequisites ─────────────────────────────────────

step 1 "Checking prerequisites..."

MISSING=()

# Check Docker
if command -v docker &> /dev/null; then
  DOCKER_VERSION=$(docker --version 2>/dev/null | grep -oE '[0-9]+\.[0-9]+' | head -1)
  success "Docker ${DOCKER_VERSION} found"
else
  MISSING+=("docker")
  warn "Docker not found"
fi

# Check Docker is running
if command -v docker &> /dev/null; then
  if docker info &> /dev/null; then
    success "Docker daemon is running"
  else
    fail "Docker is installed but not running. Please start Docker Desktop and try again."
  fi
fi

# Check Docker Compose
if docker compose version &> /dev/null; then
  COMPOSE_VERSION=$(docker compose version --short 2>/dev/null)
  success "Docker Compose ${COMPOSE_VERSION} found"
else
  MISSING+=("docker-compose")
  warn "Docker Compose not found"
fi

# Check Node.js
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version | grep -oE '[0-9]+' | head -1)
  if [ "$NODE_VERSION" -ge 20 ]; then
    success "Node.js v$(node --version | tr -d 'v') found"
  else
    fail "Node.js v20+ required, found v$(node --version | tr -d 'v'). Install from https://nodejs.org"
  fi
else
  MISSING+=("node")
  warn "Node.js not found"
fi

# Check pnpm
if command -v pnpm &> /dev/null; then
  PNPM_VERSION=$(pnpm --version | grep -oE '[0-9]+' | head -1)
  if [ "$PNPM_VERSION" -ge 9 ]; then
    success "pnpm v$(pnpm --version) found"
  else
    warn "pnpm v9+ required, found v$(pnpm --version). Upgrading..."
    npm install -g pnpm@latest
  fi
else
  if command -v node &> /dev/null; then
    warn "pnpm not found — installing..."
    npm install -g pnpm@latest
    success "pnpm installed"
  else
    MISSING+=("pnpm")
  fi
fi

# Bail if critical tools are missing
if [ ${#MISSING[@]} -gt 0 ]; then
  echo ""
  fail "Missing required tools: ${MISSING[*]}

  Install them first:
    Docker Desktop → https://www.docker.com/products/docker-desktop/
    Node.js 20+    → https://nodejs.org/
    pnpm 9+        → npm install -g pnpm"
fi

# ─── Step 2: Install dependencies ────────────────────────────────────

step 2 "Installing dependencies (pnpm install)..."
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
success "Dependencies installed"

# ─── Step 3: Build the monorepo ──────────────────────────────────────

step 3 "Building all packages (pnpm build)..."
pnpm -r build
success "Build complete"

# ─── Step 4: Start Docker stack ──────────────────────────────────────

step 4 "Starting Docker containers..."
docker compose up -d --build
success "Containers started"

# ─── Step 5: Wait for services to be healthy ─────────────────────────

step 5 "Waiting for services to be healthy..."

MAX_WAIT=60
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
  if docker compose exec -T postgres pg_isready -U app -d devtools &> /dev/null; then
    success "PostgreSQL is ready"
    break
  fi
  sleep 2
  ELAPSED=$((ELAPSED + 2))
  echo -ne "\r  Waiting... ${ELAPSED}s / ${MAX_WAIT}s"
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
  warn "Timed out waiting for PostgreSQL, continuing anyway..."
fi

# Give the other services a moment to initialize
sleep 5

# ─── Step 6: Seed the database ───────────────────────────────────────

step 6 "Seeding the database..."
if node scripts/seed.js 2>/dev/null; then
  success "Database seeded"
else
  warn "Seeding encountered issues (this is OK for first run, data may already exist)"
fi

# ─── Done! ────────────────────────────────────────────────────────────

echo ""
echo -e "${BOLD}══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}   ✅ BackendBhai is ready!${NC}"
echo -e "${BOLD}══════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BOLD}DevTools UI:${NC}         ${CYAN}http://localhost:4001${NC}"
echo -e "  ${BOLD}OTLP gRPC:${NC}          ${CYAN}http://localhost:4317${NC}"
echo -e "  ${BOLD}OTLP HTTP:${NC}          ${CYAN}http://localhost:4318${NC}"
echo -e "  ${BOLD}PostgreSQL:${NC}         ${CYAN}localhost:5433${NC}"
echo ""
echo -e "  ${BOLD}Useful commands:${NC}"
echo -e "    docker compose logs -f     ${CYAN}# tail logs${NC}"
echo -e "    docker compose down        ${CYAN}# stop everything${NC}"
echo -e "    docker compose up -d       ${CYAN}# restart${NC}"
echo ""
