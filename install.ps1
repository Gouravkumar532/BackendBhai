function Install-BackendBhai {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "   Installing BackendBhai CLI                     " -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""

    # 1. Check Git
    if (-not (Get-Command "git" -ErrorAction SilentlyContinue)) {
        Write-Host "[X] Git is not installed. Please install Git and try again." -ForegroundColor Red
        return
    }

    # 2. Check Node
    if (-not (Get-Command "node" -ErrorAction SilentlyContinue)) {
        Write-Host "[X] Node.js is not installed. Please install Node v20+ and try again." -ForegroundColor Red
        return
    }

    # 3. Clone repository
    $repoUrl = "https://github.com/Gouravkumar532/BackendBhai.git"
    $installDir = Join-Path $env:USERPROFILE ".backendbhai"

    if (Test-Path $installDir) {
        Write-Host "[i] Updating existing installation at $installDir" -ForegroundColor Yellow
        git -C $installDir pull --ff-only
    } else {
        Write-Host "[i] Downloading BackendBhai to $installDir" -ForegroundColor Yellow
        git clone -b dev --depth 1 $repoUrl $installDir
    }

    # 4. Install host dependencies & build the UI (required for Docker build)
    Write-Host "[i] Installing host dependencies and building UI..." -ForegroundColor Yellow
    Set-Location $installDir

    if (-not (Get-Command "pnpm" -ErrorAction SilentlyContinue)) {
        Write-Host "[i] pnpm not found. Installing pnpm globally..." -ForegroundColor Yellow
        npm install -g pnpm@latest
    }

    # Use cmd.exe to avoid PowerShell wrapper script issues, and use --dir to avoid folder sync bugs
    $pnpmCmd = 'pnpm --dir "' + $installDir + '" install'
    cmd.exe /c $pnpmCmd
    if ($LASTEXITCODE -ne 0) { Write-Host "[X] pnpm install failed." -ForegroundColor Red; return }

    $pnpmBuildCmd = 'pnpm --dir "' + $installDir + '" -r build'
    cmd.exe /c $pnpmBuildCmd
    if ($LASTEXITCODE -ne 0) { Write-Host "[X] pnpm build failed." -ForegroundColor Red; return }

    # 5. Install CLI globally
    Write-Host "[i] Installing backendbhai command globally..." -ForegroundColor Yellow
    $cliDir = Join-Path $installDir "packages\cli"

    # Explicitly pass the folder path to npm to avoid relying on Set-Location
    $npmCmd = 'npm install -g "' + $cliDir + '"'
    cmd.exe /c $npmCmd
    if ($LASTEXITCODE -ne 0) { Write-Host "[X] npm install globally failed." -ForegroundColor Red; return }

    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "   [OK] BackendBhai CLI installed successfully!   " -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
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
}

# Run the installer
Install-BackendBhai