# ══════════════════════════════════════════════════════════════════════
#  BackendBhai — One-Command Developer Setup (Windows PowerShell)
#
#  Usage:
#    git clone https://github.com/Gouravkumar532/BackendBhai.git
#    cd BackendBhai
#    .\setup.ps1
# ══════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

function Write-Info    { param($msg) Write-Host "i  $msg" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Warn    { param($msg) Write-Host "⚠  $msg" -ForegroundColor Yellow }
function Write-Fail    { param($msg) Write-Host "❌ $msg" -ForegroundColor Red; exit 1 }
function Write-Step    { param($num, $msg) Write-Host "`n[$num/$script:TotalSteps] $msg" -ForegroundColor White }

$script:TotalSteps = 6

Write-Host ""
Write-Host "══════════════════════════════════════════════════" -ForegroundColor White
Write-Host "   BackendBhai — One-Command Developer Setup      " -ForegroundColor White
Write-Host "══════════════════════════════════════════════════" -ForegroundColor White
Write-Host ""

# ─── Step 1: Check prerequisites ─────────────────────────────────────

Write-Step 1 "Checking prerequisites..."

$missing = @()

# Check Docker
$dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerCmd) {
    $dockerVersion = (docker --version) -replace '.*?(\d+\.\d+).*', '$1'
    Write-Success "Docker $dockerVersion found"
} else {
    $missing += "docker"
    Write-Warn "Docker not found"
}

# Check Docker is running
if ($dockerCmd) {
    try {
        docker info 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker daemon is running"
        } else {
            Write-Fail "Docker is installed but not running. Please start Docker Desktop and try again."
        }
    } catch {
        Write-Fail "Docker is installed but not running. Please start Docker Desktop and try again."
    }
}

# Check Docker Compose
try {
    $composeVersion = docker compose version --short 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Docker Compose $composeVersion found"
    } else {
        $missing += "docker-compose"
        Write-Warn "Docker Compose not found"
    }
} catch {
    $missing += "docker-compose"
    Write-Warn "Docker Compose not found"
}

# Check Node.js
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCmd) {
    $nodeVersionFull = (node --version) -replace 'v', ''
    $nodeMajor = [int]($nodeVersionFull -split '\.')[0]
    if ($nodeMajor -ge 20) {
        Write-Success "Node.js v$nodeVersionFull found"
    } else {
        Write-Fail "Node.js v20+ required, found v$nodeVersionFull. Install from https://nodejs.org"
    }
} else {
    $missing += "node"
    Write-Warn "Node.js not found"
}

# Check pnpm
$pnpmCmd = Get-Command pnpm -ErrorAction SilentlyContinue
if ($pnpmCmd) {
    $pnpmVersionFull = pnpm --version
    $pnpmMajor = [int]($pnpmVersionFull -split '\.')[0]
    if ($pnpmMajor -ge 9) {
        Write-Success "pnpm v$pnpmVersionFull found"
    } else {
        Write-Warn "pnpm v9+ required, found v$pnpmVersionFull. Upgrading..."
        npm install -g pnpm@latest
    }
} else {
    if ($nodeCmd) {
        Write-Warn "pnpm not found - installing..."
        npm install -g pnpm@latest
        Write-Success "pnpm installed"
    } else {
        $missing += "pnpm"
    }
}

# Bail if critical tools are missing
if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Fail "Missing required tools: $($missing -join ', ')

  Install them first:
    Docker Desktop -> https://www.docker.com/products/docker-desktop/
    Node.js 20+    -> https://nodejs.org/
    pnpm 9+        -> npm install -g pnpm"
}

# ─── Step 2: Install dependencies ────────────────────────────────────

Write-Step 2 "Installing dependencies (pnpm install)..."
try {
    pnpm install --frozen-lockfile 2>$null
} catch {
    pnpm install
}
if ($LASTEXITCODE -ne 0) { pnpm install }
Write-Success "Dependencies installed"

# ─── Step 3: Build the monorepo ──────────────────────────────────────

Write-Step 3 "Building all packages (pnpm build)..."
pnpm -r build
if ($LASTEXITCODE -ne 0) { Write-Fail "Build failed. Check the output above for errors." }
Write-Success "Build complete"

# ─── Step 4: Start Docker stack ──────────────────────────────────────

Write-Step 4 "Starting Docker containers..."
docker compose up -d --build
if ($LASTEXITCODE -ne 0) { Write-Fail "Docker Compose failed. Is Docker Desktop running?" }
Write-Success "Containers started"

# ─── Step 5: Wait for services to be healthy ─────────────────────────

Write-Step 5 "Waiting for services to be healthy..."

$maxWait = 60
$elapsed = 0
$ready = $false

while ($elapsed -lt $maxWait) {
    try {
        docker compose exec -T postgres pg_isready -U app -d devtools 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "PostgreSQL is ready"
            $ready = $true
            break
        }
    } catch { }
    Start-Sleep -Seconds 2
    $elapsed += 2
    Write-Host "`r  Waiting... ${elapsed}s / ${maxWait}s" -NoNewline
}

if (-not $ready) {
    Write-Host ""
    Write-Warn "Timed out waiting for PostgreSQL, continuing anyway..."
}

# Give the other services a moment to initialize
Start-Sleep -Seconds 5

# ─── Step 6: Seed the database ───────────────────────────────────────

Write-Step 6 "Seeding the database..."
try {
    node scripts/seed.js 2>$null
    Write-Success "Database seeded"
} catch {
    Write-Warn "Seeding encountered issues (this is OK for first run, data may already exist)"
}

# ─── Done! ────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "══════════════════════════════════════════════════" -ForegroundColor White
Write-Host "   ✅ BackendBhai is ready!                       " -ForegroundColor Green
Write-Host "══════════════════════════════════════════════════" -ForegroundColor White
Write-Host ""
Write-Host "  DevTools UI:         " -NoNewline; Write-Host "http://localhost:4001" -ForegroundColor Cyan
Write-Host "  OTLP gRPC:          " -NoNewline; Write-Host "http://localhost:4317" -ForegroundColor Cyan
Write-Host "  OTLP HTTP:          " -NoNewline; Write-Host "http://localhost:4318" -ForegroundColor Cyan
Write-Host "  PostgreSQL:         " -NoNewline; Write-Host "localhost:5433" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Useful commands:"
Write-Host "    docker compose logs -f     " -NoNewline; Write-Host "# tail logs" -ForegroundColor Cyan
Write-Host "    docker compose down        " -NoNewline; Write-Host "# stop everything" -ForegroundColor Cyan
Write-Host "    docker compose up -d       " -NoNewline; Write-Host "# restart" -ForegroundColor Cyan
Write-Host ""
