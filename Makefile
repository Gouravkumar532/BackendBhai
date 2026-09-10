# BackendBhai — Makefile
# Source: dev4.md §6.8
# Author: Dev 5 (Abhinav) — drafted for Dev 4 to refine

.PHONY: setup up down seed reset-db logs demo dev stop clean test

# ─── One-Command Setup ───────────────────────────────────────────────

setup: ## One-command full setup for new developers
	@echo "🚀 Setting up BackendBhai..."
	pnpm install
	pnpm -r build
	docker compose up -d --build
	@echo "⏳ Waiting for services to be healthy..."
	@sleep 15
	$(MAKE) seed
	@echo ""
	@echo "══════════════════════════════════════════════════"
	@echo "   ✅ BackendBhai is ready!"
	@echo "══════════════════════════════════════════════════"
	@echo "   DevTools UI:       http://localhost:4001"
	@echo "   OTLP gRPC:        http://localhost:4317"
	@echo "   OTLP HTTP:        http://localhost:4318"
	@echo "══════════════════════════════════════════════════"
	@echo ""

# ─── Stack Management ────────────────────────────────────────────────

up: ## Start the full stack
	docker compose up --build

up-d: ## Start in detached mode
	docker compose up -d --build

down: ## Stop everything
	docker compose down

stop: ## Stop without removing containers
	docker compose stop

# ─── Database ────────────────────────────────────────────────────────

seed: ## Populate demo data (50+ diverse requests)
	node scripts/seed.js

reset-db: ## Drop and recreate both databases, then re-seed
	docker compose down -v
	docker compose up -d postgres redis
	sleep 5
	node scripts/init-db.js
	$(MAKE) seed

# ─── Logs & Debug ────────────────────────────────────────────────────

logs: ## Tail all service logs
	docker compose logs -f

logs-core: ## Tail DevTools server logs only
	docker compose logs -f devtools-core

logs-otel: ## Tail OTel Collector logs only
	docker compose logs -f otel-collector

# ─── Development ─────────────────────────────────────────────────────

dev: ## Start infrastructure + run services locally
	docker compose up -d postgres redis otel-collector
	@echo "Infrastructure started. Run services locally with:"
	@echo "  pnpm --filter devtools-core dev"

# ─── Demo ────────────────────────────────────────────────────────────

demo: ## One command: fresh stack + seeded data, ready to present
	docker compose up -d --build
	@echo "Waiting for services to be healthy..."
	sleep 10
	$(MAKE) seed
	@echo ""
	@echo "✅ BackendBhai is ready!"
	@echo "   DevTools UI:       http://localhost:4001"
	@echo "   Error Injector UI: http://localhost:4002"
	@echo "   Amazon Storefront: http://localhost:4003"
	@echo "   API Gateway:       http://localhost:3000"
	@echo ""

# ─── Testing ─────────────────────────────────────────────────────────

test: ## Run all tests
	pnpm -r test

test-contract: ## Run API contract validation tests
	cd tests/contract && pnpm test

# ─── Cleanup ─────────────────────────────────────────────────────────

clean: ## Stop everything and remove volumes + build cache
	docker compose down -v --remove-orphans
	docker system prune -f
