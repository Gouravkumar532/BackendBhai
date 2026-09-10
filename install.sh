#!/usr/bin/env bash
set -euo pipefail

echo -e "\033[0;36m══════════════════════════════════════════════════\033[0m"
echo -e "\033[0;36m   Installing BackendBhai CLI                     \033[0m"
echo -e "\033[0;36m══════════════════════════════════════════════════\033[0m"
echo ""

# 1. Check Git
if ! command -v git &> /dev/null; then
    echo -e "\033[0;31m❌ Git is not installed. Please install Git and try again.\033[0m"
    exit 1
fi

# 2. Check Node
if ! command -v node &> /dev/null; then
    echo -e "\033[0;31m❌ Node.js is not installed. Please install Node v20+ and try again.\033[0m"
    exit 1
fi

# 3. Clone repository
INSTALL_DIR="$HOME/.backendbhai"
REPO_URL="https://github.com/Gouravkumar532/BackendBhai.git"

if [ -d "$INSTALL_DIR" ]; then
    echo -e "\033[0;33mℹ️  Updating existing installation at $INSTALL_DIR\033[0m"
    git -C "$INSTALL_DIR" pull --ff-only
else
    echo -e "\033[0;33mℹ️  Downloading BackendBhai to $INSTALL_DIR\033[0m"
    git clone --depth 1 "$REPO_URL" "$INSTALL_DIR"
fi

# 4. Install host dependencies & build the UI
echo -e "\033[0;33mℹ️  Installing host dependencies and building UI...\033[0m"
cd "$INSTALL_DIR"

if ! command -v pnpm &> /dev/null; then
    echo -e "\033[0;33mℹ️  pnpm not found. Installing pnpm globally...\033[0m"
    npm install -g pnpm@latest
fi

pnpm install --frozen-lockfile 2>/dev/null || pnpm install
pnpm -r build

# 5. Install CLI globally
echo -e "\033[0;33mℹ️  Installing backendbhai command globally...\033[0m"
cd "$INSTALL_DIR/packages/cli"
npm install -g .

echo ""
echo -e "\033[0;32m══════════════════════════════════════════════════\033[0m"
echo -e "\033[0;32m   ✅ BackendBhai CLI installed successfully!     \033[0m"
echo -e "\033[0;32m══════════════════════════════════════════════════\033[0m"
echo ""
echo "You can now use the 'backendbhai' command from anywhere."
echo ""
echo -e "\033[90mTo start the monitoring platform:\033[0m"
echo -e "  \033[0;36mbackendbhai start\033[0m"
echo ""
echo -e "\033[90mTo connect your own project:\033[0m"
echo -e "  \033[0;36mcd your-project\033[0m"
echo -e "  \033[0;36mbackendbhai init\033[0m"
echo ""
