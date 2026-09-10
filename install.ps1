Write-Host ""
Write-Host "══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   Installing BackendBhai CLI                     " -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Check Git
if (-not (Get-Command "git" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed. Please install Git and try again." -ForegroundColor Red
    exit 1
}

# 2. Check Node
if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node v20+ and try again." -ForegroundColor Red
    exit 1
}

# 3. Clone repository
$repoUrl = "https://github.com/Gouravkumar532/BackendBhai.git"
$installDir = Join-Path $env:USERPROFILE ".backendbhai"

if (Test-Path $installDir) {
    Write-Host "ℹ️  Updating existing installation at $installDir" -ForegroundColor Yellow
    git -C $installDir pull --ff-only
} else {
    Write-Host "ℹ️  Downloading BackendBhai (dev branch) to $installDir" -ForegroundColor Yellow
    git clone -b dev --single-branch --depth 1 $repoUrl $installDir
}

# 4. Install host dependencies & build the UI (required for Docker build)
Write-Host "ℹ️  Installing host dependencies and building UI..." -ForegroundColor Yellow
Set-Location $installDir

if (-not (Get-Command "pnpm" -ErrorAction SilentlyContinue)) {
    Write-Host "ℹ️  pnpm not found. Installing pnpm globally..." -ForegroundColor Yellow
    npm install -g pnpm@latest
}

# Use Start-Process to avoid PowerShell NativeCommandError and directory desync issues
$installArgs = "install", "--dir", "`"$installDir`""
$p1 = Start-Process -FilePath "pnpm" -ArgumentList $installArgs -Wait -NoNewWindow -PassThru
if ($p1.ExitCode -ne 0) { Write-Host "❌ pnpm install failed." -ForegroundColor Red; exit 1 }

$buildArgs = "-r", "--dir", "`"$installDir`"", "build"
$p2 = Start-Process -FilePath "pnpm" -ArgumentList $buildArgs -Wait -NoNewWindow -PassThru
if ($p2.ExitCode -ne 0) { Write-Host "❌ pnpm build failed." -ForegroundColor Red; exit 1 }

# 5. Install CLI globally
Write-Host "ℹ️  Installing backendbhai command globally..." -ForegroundColor Yellow
$cliDir = Join-Path $installDir "packages\cli"

$npmArgs = "install", "-g", "."
$p3 = Start-Process -FilePath "npm" -ArgumentList $npmArgs -WorkingDirectory $cliDir -Wait -NoNewWindow -PassThru
if ($p3.ExitCode -ne 0) { Write-Host "❌ npm install globally failed." -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "   ✅ BackendBhai CLI installed successfully!     " -ForegroundColor Green
Write-Host "══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "You can now use the 'backendbhai' command from anywhere." -ForegroundColor White
Write-Host ""
Write-Host "To start the monitoring platform:" -ForegroundColor Gray
Write-Host "  backendbhai start" -ForegroundColor Cyan
Write-Host ""
Write-Host "To connect your own project:" -ForegroundColor Gray
Write-Host "  cd your-project" -ForegroundColor Cyan
Write-Host "  backendbhai init" -ForegroundColor Cyan
Write-Host ""
