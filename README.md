# BackendBhai

> **Chrome DevTools for backend systems.**

BackendBhai is a local-first observability platform. It captures every request that
flows through your backend and presents it as one interactive execution story — every
service hop, database query, external API call and its real timing, in a single browser
tab.

It is a **standalone platform**, not part of any one application. It monitors products.

---

## Prerequisites

Before installing, make sure you have the following installed on your machine:

| Tool | Minimum Version | Check |
|------|----------------|-------|
| **Git** | Any | `git --version` |
| **Node.js** | v20+ | `node --version` |
| **pnpm** | v8+ | `pnpm --version` |
| **Docker** | v20+ | `docker --version` |

> **Don't have pnpm?** The installer will install it for you automatically.

---

## ⚡ Install (One Command)

Run this single command in your terminal to install the **BackendBhai CLI** globally:

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/Gouravkumar532/BackendBhai/dev/install.ps1 | iex
```

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/Gouravkumar532/BackendBhai/dev/install.sh | bash
```

This will:
1. Clone the repository to `~/.backendbhai`
2. Install all dependencies
3. Build the dashboard UI
4. Make the `backendbhai` command available globally

---

## 🚀 Getting Started

### Step 1: Start the platform

```bash
backendbhai start
```

This boots up the BackendBhai dashboard and OpenTelemetry collector using Docker.
The dashboard will be available at **http://localhost:4001**.

### Step 2: Connect your project

Navigate to any Node.js project and run:

```bash
cd your-project
backendbhai init
```

This will:
- Auto-detect your package manager (npm, pnpm, yarn, bun)
- Install OpenTelemetry instrumentation packages
- Create a `backendbhai.preload.mjs` file
- Add a `dev:traced` script to your `package.json`

### Step 3: Run your app with tracing

```bash
npm run dev:traced
```

### Step 4: See the magic ✨

Open **http://localhost:4001** in your browser. Every HTTP request, database query,
and external API call will appear in real-time with:

- **System Topology Graph** — auto-discovered architecture map
- **Trace Waterfall** — exact timing of every hop
- **Error Tracking** — failed requests highlighted in red
- **Latency Breakdown** — self time vs total time per service

---

## 📋 Supported Project Types

`backendbhai init` automatically handles:

| Project Type | Example | How it works |
|-------------|---------|--------------|
| **Express / Fastify** | `node server.js` | Preloads tracing before your entry file |
| **Next.js** | `next dev` | Points to `node_modules/next/dist/bin/next` |
| **Nuxt** | `nuxt dev` | Points to `node_modules/nuxt/bin/nuxt.mjs` |
| **Vite** | `vite dev` | Points to `node_modules/vite/bin/vite.js` |
| **Chained scripts** | `node sync.js && next dev` | Detects the actual server command |
| **pnpm workspaces** | Monorepos | Installs packages at workspace root with `-w` |

---

## 🛠️ Everyday Commands

| Command | Description |
|---------|-------------|
| `backendbhai start` | Start the platform (Docker) |
| `backendbhai stop` | Stop the platform |
| `backendbhai init` | Instrument the current Node.js project |
| `npm run dev:traced` | Run your app with tracing enabled |

---

## 🛑 Stopping & Uninstalling

**Stop the platform:**
```bash
backendbhai stop
```

**Uninstall completely:**
```powershell
backendbhai stop
npm uninstall -g backendbhai
Remove-Item -Recurse -Force ~/.backendbhai
```

---


### Connect your project

```bash
cd your-express-app
backendbhai init
npm run dev:traced
```

Open **http://localhost:4001** — every API call, DB query, and service hop appears live.

---

## Table of contents

1. [How it works](#how-it-works)
2. [Prerequisites](#prerequisites)
3. [Quick start](#quick-start)
4. [Step-by-step setup](#step-by-step-setup)
5. [Verifying your install](#verifying-your-install)
6. [Every port and URL](#every-port-and-url)
7. [Taking the demo for a spin](#taking-the-demo-for-a-spin)
8. [Connecting your own product](#connecting-your-own-product)
9. [API reference](#api-reference)
10. [Everyday commands](#everyday-commands)
11. [Troubleshooting](#troubleshooting)
12. [Developing on BackendBhai](#developing-on-backendbhai)
13. [Project structure](#project-structure)
14. [Design rules](#design-rules)

---

## How it works

Your services emit OpenTelemetry traces. A collector receives them and forwards them to
the BackendBhai server, which stores them in Postgres and serves both the REST API and
the UI on a single port.

```
   YOUR PRODUCT (any language, anywhere)
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ service  │  │ service  │  │ service  │
   └────┬─────┘  └────┬─────┘  └────┬─────┘
        └─────────────┼─────────────┘
                      │  OTLP (gRPC :4317 / HTTP :4318)
                      ▼
        ┌───────────────────────────┐
        │   OpenTelemetry Collector │
        └─────────────┬─────────────┘
                      │  OTLP HTTP (JSON or protobuf)
                      ▼
        ┌───────────────────────────┐        ┌──────────────┐
        │   BackendBhai server      │───────▶│  PostgreSQL  │
        │   REST + WebSocket + UI   │        │  :5433       │
        │   http://localhost:4001   │        └──────────────┘
        └───────────────────────────┘
                      │
                      ▼
              Your browser
```

Everything runs on your machine. No cloud, no SaaS, no account.

---

## Prerequisites

Install these three things first. The versions matter.

| Tool | Version | How to check | Where to get it |
|------|---------|--------------|-----------------|
| **Docker Desktop** | any current | `docker --version` | <https://www.docker.com/products/docker-desktop/> |
| **Node.js** | 20 or newer | `node --version` | <https://nodejs.org/> |
| **pnpm** | 9 or newer | `pnpm --version` | `npm install -g pnpm` |

**Docker Desktop must actually be running** before you start — not just installed. On
Windows and macOS, launch it and wait for the whale icon to stop animating.

Verify all three at once:

```bash
docker --version && node --version && pnpm --version
```

---

## Quick start

> **One command and you're running.** The setup script checks prerequisites,
> installs dependencies, builds everything, boots Docker, seeds the database,
> and prints the dashboard URLs.

**macOS / Linux:**

```bash
git clone https://github.com/Gouravkumar532/BackendBhai.git
cd BackendBhai
chmod +x setup.sh && ./setup.sh
```

**Windows (PowerShell):**

```powershell
git clone https://github.com/Gouravkumar532/BackendBhai.git
cd BackendBhai
.\setup.ps1
```

**Already have Node.js + pnpm?** You can also run:

```bash
git clone https://github.com/Gouravkumar532/BackendBhai.git
cd BackendBhai
pnpm install && pnpm run setup
```

Once complete, open **<http://localhost:4001>** and start exploring.

If anything goes wrong, follow the detailed steps below instead — they explain what each
command does and what to expect.

---

## Step-by-step setup

### Step 1 — Clone the repository

```bash
git clone https://github.com/Abhi-R459/BackendBhai.git
```

```bash
cd BackendBhai
```

### Step 2 — Install dependencies

This is a pnpm **monorepo**: one `pnpm install` at the root installs every package.
Do not run `npm install`, and do not install inside subfolders.

```bash
pnpm install
```

Expect roughly 400 packages and 30–90 seconds. You should end with `Done in …`.

> If you see `ERR_PNPM_IGNORED_BUILDS`, your pnpm is refusing to run the postinstall
> scripts that `esbuild` and `protobufjs` need. The repository already approves these in
> `pnpm-workspace.yaml` under `allowBuilds`. Make sure you did not modify that file.

### Step 3 — Build the TypeScript

**This step is required and easy to miss.** Compiled output (`dist/`) is deliberately not
committed to git, so a fresh clone has none. The Docker images copy `dist/` in at build
time, so skipping this makes the next step fail with errors like
`"/dist": not found`.

```bash
pnpm -r build
```

This compiles all 14 packages — the platform server, the React UI, the shared types, the
instrumentation library and the ten demo services. Expect `Done` for each.

### Step 4 — Start everything with Docker

The platform and the demo product are separate compose files. To run **both** (what you
want the first time):

```bash
docker compose -f docker-compose.yml -f docker-compose.demo.yml up -d --build
```

To run **only the platform**, with no demo product at all:

```bash
docker compose up -d --build
```

The first build pulls base images and compiles inside containers — budget 2–5 minutes.
Later starts take seconds.

### Step 5 — Confirm the containers are healthy

```bash
docker compose -f docker-compose.yml -f docker-compose.demo.yml ps
```

You should see **14 containers**, all `Up`, with `postgres` and `redis` marked
`(healthy)`:

```
amazon-store, api-gateway, auth-service, catalog-service, demo-frontend,
devtools-core, mock-payment-api, order-service, otel-collector, payment-service,
postgres, recommendation-service, redis, review-service
```

If any container is `Exited` or `Restarting`, jump to
[Troubleshooting](#troubleshooting).

### Step 6 — Open the platform

**<http://localhost:4001>**

On a brand-new install the graph is intentionally **empty**, and the sidebar says
*"Waiting for telemetry."* That is correct behaviour — BackendBhai never invents sample
data. Generate some traffic in the next section and it will fill in.

---

## Verifying your install

Run these three checks in order.

**1. Is the platform alive?**

```bash
curl http://localhost:4001/health
```

Expect `{"status":"ok","version":"0.1.0"}`. If you get `database: disconnected`,
Postgres has not finished starting — wait 10 seconds and retry.

**2. Generate a real request through the demo product.**

```bash
curl -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" -d "{\"userId\":\"demo\",\"items\":[{\"id\":\"p1\",\"name\":\"Keyboard\",\"price\":89.99,\"qty\":1}]}"
```

Expect HTTP 201 and an `orderId`.

**3. Confirm the trace was captured** (telemetry takes ~5 seconds to batch through the
collector):

```bash
curl "http://localhost:4001/api/v1/requests?limit=3"
```

You should see your request with a 32-character hex `traceId`. Now reload
<http://localhost:4001> — the request appears in the sidebar and the topology graph draws
itself from the services that actually took part.

---

## Every port and URL

### The platform

| Port | What | URL |
|------|------|-----|
| **4001** | **BackendBhai UI + REST API + WebSocket** | <http://localhost:4001> |
| 4318 | OTLP HTTP ingest — point your product here | `http://localhost:4318` |
| 4317 | OTLP gRPC ingest | `http://localhost:4317` |
| 5433 | PostgreSQL (telemetry storage) | `postgresql://app:secret@localhost:5433/devtools` |

> Postgres is on **5433** on your machine, not 5432, so it cannot clash with a local
> Postgres you already run. Inside Docker it is still `postgres:5432`.

### The demo product (only with `docker-compose.demo.yml`)

| Port | What | URL |
|------|------|-----|
| 4003 | **ArrayMart storefront** — browse, search, buy | <http://localhost:4003> |
| 4002 | **ArrayMart Ops Console** — load generator + fault injection | <http://localhost:4002> |
| 3000 | API Gateway (entry point) | <http://localhost:3000> |
| 3001 | Auth service | <http://localhost:3001> |
| 3002 | Order service | <http://localhost:3002> |
| 3003 | Payment service | <http://localhost:3003> |
| 3004 | Catalog service (Postgres + Redis cache) | <http://localhost:3004> |
| 3005 | Review service | <http://localhost:3005> |
| 3006 | Recommendation service (fans out to catalog + review) | <http://localhost:3006> |
| 4000 | Mock payment provider | <http://localhost:4000> |
| 6379 | Redis | `redis://localhost:6379` |

---

## Taking the demo for a spin

1. **Open the storefront** at <http://localhost:4003>, pick a product and click
   **Buy Now → Place your order**.
2. **Open BackendBhai** at <http://localhost:4001>. Your order is in the sidebar with its
   real duration.
3. **Click the request.** The graph highlights only the services that took part, and each
   one shows two numbers:
   - **self** — time that service actually spent working
   - **total** — wall-clock time including waiting on downstream calls

   A gateway showing `3ms self / 16ms total` was not slow; it was waiting. This is the
   distinction that tells you where a problem actually is.
4. **Click "Run Diagnostics"** in the Replay Console. BackendBhai re-issues the exact
   recorded request and shows the original versus the replay side by side.

### Breaking things on purpose

Open the **Failure Simulator** at <http://localhost:4002> and pick a mode. It is applied
globally, so it affects storefront orders too, not just the simulator's own test buttons.

| Mode | What happens | What you see in BackendBhai |
|------|--------------|------------------------------|
| Normal | Fast happy path | Green, ~20ms |
| Heavy Order DB | Large order triggers a slow query | Long database span |
| Auth Timeout | Auth rejects after 5s | Red 401, auth-service self-time ≈ 5s |
| Payment 503 | Payment provider unavailable | Red 503 on payment-service |
| Slow Payment | 5s payment delay | Payment self-time ≈ 5s |
| Random Chaos | A mix of the above | Realistic noise |

Set a mode, place an order at <http://localhost:4003>, then look at the trace in
BackendBhai. Reset with:

```bash
curl -X POST http://localhost:3000/api/simulation/reset
```

---

## Connecting your own product

BackendBhai monitors anything that speaks OpenTelemetry — any language, any framework.
The demo store is just one example.

### Step 1 — Run the platform alone

```bash
docker compose up -d --build
```

### Step 2 — Point your application at the collector

BackendBhai does not need a special SDK. Use the standard OpenTelemetry SDK for your
language and set two environment variables:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_SERVICE_NAME=my-service
```

For a Node.js service, this repository ships a ready-made helper:

```bash
node --import ./lib/telemetry/preload.mjs dist/index.js
```

with:

```bash
SERVICE_NAME=my-service
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

Send traffic through your app, then open <http://localhost:4001>. Services, dependencies,
node types and latencies all appear on their own — nothing is configured by hand.

### Step 3 (optional) — Tell the platform where your product lives

Some features (request replay, endpoint probing) need to reach your product. Telemetry
records the *caller's* view of a URL, which the platform may not be able to resolve — a
recorded `localhost:3000` means something different inside a container. Set:

```bash
PRODUCT_NAME=My Product
PRODUCT_BASE_URL=http://my-gateway:3000
```

on the `devtools-core` service. `docker-compose.demo.yml` shows exactly this pattern.

### Step 4 (optional) — Explore the API surface

BackendBhai learns your endpoints three ways:

- **Observed** — every request you serve is recorded automatically. Free and zero risk.
- **From a spec** — import an OpenAPI document for complete coverage:

  ```bash
  curl -X POST http://localhost:4001/api/v1/discovery/openapi -H "Content-Type: application/json" -d "{\"serviceName\":\"my-service\",\"specUrl\":\"http://localhost:8080/openapi.json\"}"
  ```

- **By probing** — actively call the discovered endpoints so the resulting telemetry
  builds the graph:

  ```bash
  curl -X POST http://localhost:4001/api/v1/discovery/probe -H "Content-Type: application/json" -d "{\"baseUrl\":\"http://localhost:3000\",\"dryRun\":true}"
  ```

> **Safety.** Probing sends real traffic to a real product. Only `GET`, `HEAD` and
> `OPTIONS` run by default. Anything that could change data is refused with HTTP 403
> unless you explicitly pass `"allowMutating": true`. Always run `dryRun` first to see
> the plan. Endpoints with path parameters (`/orders/{id}`) are skipped, because guessing
> identifiers is not safe.

---

## API reference

Base URL `http://localhost:4001`.

### Requests and traces

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/health` | Liveness and database status |
| `GET` | `/api/v1/config` | Runtime config the UI reads at boot |
| `GET` | `/api/v1/requests?limit=50` | Recent captured requests |
| `GET` | `/api/v1/requests/:traceId` | Full detail for one request |
| `GET` | `/api/v1/traces/:traceId/waterfall` | Span waterfall |
| `GET` | `/api/v1/traces/:traceId/path` | Per-service hops with **self** and **total** time |
| `GET` | `/api/v1/traces/:traceId/summary` | Service count, error count, totals |
| `GET` | `/api/v1/traces/:traceId/node/:service` | Every span and log for one service |
| `GET` | `/api/v1/traces/:traceId/logs` | Logs correlated to that trace |

### Topology and discovery

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/topology` | Services and dependencies with measured avg/p95 |
| `GET` | `/api/v1/discovery/endpoints` | Every endpoint the platform knows about |
| `POST` | `/api/v1/discovery/openapi` | Import an OpenAPI document |
| `POST` | `/api/v1/discovery/probe` | Execute discovered endpoints |

### Replay

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/v1/replay` | Re-issue a recorded request (`{"traceId":"..."}`) |
| `GET` | `/api/v1/replay/:replayId` | Fetch a replay result |
| `GET` | `/api/v1/compare/:replayId` | Measured diff: status, duration, body |

### Ingest

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/v1/traces` | OTLP traces — JSON or protobuf |
| `WS` | `/ws` | Live `new_request` events |

---

## Everyday commands

All commands assume you are in the repository root.

**Follow the logs**

```bash
docker compose -f docker-compose.yml -f docker-compose.demo.yml logs -f devtools-core
```

**Stop everything (data is kept)**

```bash
docker compose -f docker-compose.yml -f docker-compose.demo.yml down
```

**Stop and wipe all captured telemetry**

```bash
docker compose -f docker-compose.yml -f docker-compose.demo.yml down -v
```

**Clear captured traces without restarting**

```bash
docker compose exec postgres psql -U app -d devtools -c "TRUNCATE traces, spans, log_events, service_dependencies, services CASCADE;"
```

**Inspect the database directly**

```bash
docker compose exec postgres psql -U app -d devtools
```

**Generate continuous demo traffic**

```bash
node scripts/traffic-generator.js
```

---

## Troubleshooting

### `failed to compute cache key: "/dist": not found`

You skipped Step 3. Build first, then rebuild the images:

```bash
pnpm -r build && docker compose -f docker-compose.yml -f docker-compose.demo.yml up -d --build
```

### `ERR_PNPM_IGNORED_BUILDS` during install

pnpm is skipping postinstall scripts that Vite's `esbuild` needs. Confirm
`pnpm-workspace.yaml` still contains:

```yaml
allowBuilds:
  esbuild: true
  protobufjs: true
```

### Windows: `The system cannot find the path specified. (os error 3)` during build

Windows caps paths at 260 characters and pnpm writes deeply nested internal files.
Clone somewhere short — `C:\dev\BackendBhai` is fine, a folder buried under
`AppData\Local\Temp\...` is not.

### Port is already allocated

Another program holds one of the ports. Find it:

```bash
docker compose -f docker-compose.yml -f docker-compose.demo.yml ps
```

Then either stop that program or change the left-hand side of the port mapping in
`docker-compose.yml` (for example `"4005:4001"`).

### The UI loads but stays empty

This is normal until telemetry arrives. Check, in order:

1. Send a request: `curl http://localhost:3000/api/products`
2. Wait ~5 seconds — the collector batches before exporting.
3. Look for export failures: `docker compose logs otel-collector | grep -i "exporting failed"`
4. Look for ingest errors: `docker compose logs devtools-core | grep -i error`

### The API returns 503

The platform cannot reach Postgres. BackendBhai deliberately reports 503 rather than
showing fabricated data. Check `docker compose ps` — `postgres` must be `(healthy)`.

### I changed source code and nothing happened

Demo service images copy the compiled `dist/` at build time, so you must recompile and
rebuild that image:

```bash
pnpm -r build
```

```bash
docker compose -f docker-compose.yml -f docker-compose.demo.yml up -d --build <service-name>
```

The platform server (`devtools-core`) compiles inside its own image, so for it a
`--build` alone is enough.

### Start completely fresh

```bash
docker compose -f docker-compose.yml -f docker-compose.demo.yml down -v --remove-orphans
```

```bash
pnpm install && pnpm -r build && docker compose -f docker-compose.yml -f docker-compose.demo.yml up -d --build
```

---

## Developing on BackendBhai

### Run the UI with hot reload

Keep the stack running, then:

```bash
cd apps/devtools-ui && pnpm dev
```

Vite serves on <http://localhost:5173> and proxies `/api` and `/ws` to port 4001.

### Run the platform server locally

```bash
docker compose up -d postgres otel-collector
```

```bash
cd apps/devtools-core && pnpm dev
```

### Run the tests

```bash
cd apps/devtools-core && pnpm test
```

### Type-check without emitting

```bash
cd apps/devtools-core && npx tsc --noEmit
```

### Editing telemetry code

`apps/telemetry-collector/src` is the single source of truth for service
instrumentation. After changing it, sync the compiled copies into each demo service:

```bash
node scripts/sync-telemetry.js
```

Check for drift in CI with `node scripts/sync-telemetry.js --check`.

---

## Project structure

```
backendbhai/
├── docker-compose.yml          # THE PLATFORM (postgres + collector + server)
├── docker-compose.demo.yml     # The demo product, as an overlay
├── apps/
│   ├── devtools-core/          # Platform server: ingest, REST, WebSocket, migrations
│   ├── devtools-ui/            # React UI, served by devtools-core on :4001
│   ├── telemetry-collector/    # OpenTelemetry instrumentation library
│   └── demo-store/             # Example product being monitored
│       ├── api-gateway/            # :3000  entry point
│       ├── auth-service/           # :3001
│       ├── order-service/          # :3002
│       ├── payment-service/        # :3003
│       ├── catalog-service/        # :3004  products, search, Redis cache
│       ├── review-service/         # :3005  product reviews
│       ├── recommendation-service/ # :3006  fans out to catalog + review
│       ├── mock-payment-api/       # :4000  external provider
│       ├── frontend/               # :4002  ArrayMart Ops Console
│       └── amazon-store/           # :4003  ArrayMart storefront
├── packages/shared/            # Shared TypeScript types
├── infrastructure/             # Collector config, database init
├── scripts/                    # Seeding, traffic generation, verification
├── contracts/                  # API, events, telemetry, data-model contracts
└── docs/                       # Additional documentation
```

---

## Design rules

These are enforced, not aspirational. They are why you can trust what the UI shows.

1. **No fabricated data, ever.** There are no seed fixtures and no sample traces. If
   there is no telemetry, the UI says so and the API returns 503. A number on screen was
   measured.
2. **The graph is discovered, not declared.** Services, dependencies and node types
   (database, cache, queue, external) are derived from span attributes at ingest —
   never from service names.
3. **Latency is per hop.** Every service reports its own **self** time separately from
   **total** time, so a service that is merely waiting is never blamed.
4. **The platform is product-agnostic.** No product URL, service name or port is compiled
   into the build. The UI resolves its own origin at runtime; anything product-specific
   comes from the environment.
5. **Destructive actions are opt-in.** Endpoint probing sends real traffic, so mutating
   HTTP verbs are refused unless explicitly enabled.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v4 |
| Backend | Node.js 20, Fastify, TypeScript |
| Storage | PostgreSQL 16 |
| Telemetry | OpenTelemetry, OTLP (HTTP + gRPC), W3C Trace Context |
| Infrastructure | Docker Compose |
| Testing | Vitest |

---

## License

Hackathon project — not licensed for production use.

---

## Analyzing Any External Project

BackendBhai is a language-agnostic observability platform. It does not require proprietary SDKs to monitor your project; instead, it relies entirely on the open standard **OpenTelemetry (OTEL)**. 

If your application can emit standard OpenTelemetry traces, BackendBhai can analyze it. This guide covers how to instrument any project and connect it to BackendBhai.

### Step 1: Run BackendBhai

Before instrumenting your application, ensure BackendBhai's platform is running. It will expose an OpenTelemetry Collector on your machine.

1. Clone and build the BackendBhai repository.
2. Start the core platform (without the demo products):
   ```bash
   docker compose up -d --build postgres redis devtools-core otel-collector
   ```
3. BackendBhai is now listening for traces on:
   - **HTTP (OTLP):** `http://localhost:4318`
   - **gRPC (OTLP):** `localhost:4317`

### Step 2: Instrument Your Project

You need to add OpenTelemetry auto-instrumentation to your project. Auto-instrumentation automatically tracks API requests, database queries, and external HTTP calls without requiring you to manually write tracing code.

Choose your language below:

#### 🟢 Node.js (Express, Fastify, NestJS)

1. **Install dependencies:**
   ```bash
   npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http
   ```
2. **Create `telemetry.js` in your project root:**
   ```javascript
   const { NodeSDK } = require('@opentelemetry/sdk-node');
   const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
   const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

   const sdk = new NodeSDK({
     traceExporter: new OTLPTraceExporter(),
     instrumentations: [getNodeAutoInstrumentations()]
   });

   sdk.start();
   ```
3. **Start your app by preloading the script:**
   ```bash
   node --require ./telemetry.js your-app.js
   ```

#### 🐍 Python (Django, FastAPI, Flask)

1. **Install dependencies:**
   ```bash
   pip install opentelemetry-distro opentelemetry-exporter-otlp
   ```
2. **Install auto-instrumentation for your specific libraries:**
   ```bash
   opentelemetry-bootstrap -a install
   ```
3. **Start your app using the OTEL wrapper:**
   ```bash
   opentelemetry-instrument python your_app.py
   ```
   *(For uvicorn/fastapi, use `opentelemetry-instrument uvicorn main:app`)*

#### ☕ Java (Spring Boot, Tomcat)

1. **Download the OpenTelemetry Java Agent:**
   ```bash
   wget https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar
   ```
2. **Start your app with the Java Agent attached:**
   ```bash
   java -javaagent:path/to/opentelemetry-javaagent.jar -jar your-app.jar
   ```

#### 🐹 Go

For Go, OpenTelemetry requires slightly more manual setup since it's a compiled language. You will need to use `go.opentelemetry.io/otel` and standard instrumentation wrappers for your HTTP router (e.g., `net/http`, `gin`, `fiber`). Refer to the [official Go OpenTelemetry docs](https://opentelemetry.io/docs/languages/go/getting-started/).

### Step 3: Configure the Connection

Once your app is instrumented, you need to tell it **what its name is** and **where to send the data**. You do this via standard OpenTelemetry environment variables.

Run your application with the following variables set:

```bash
# Give your application a recognizable name in the BackendBhai topology graph
export OTEL_SERVICE_NAME="my-awesome-project"

# Point to BackendBhai's OpenTelemetry Collector (Default HTTP port is 4318)
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"

# Start your application here...
```

> **Note on Remote Deployments:** If your project is deployed on a remote server (e.g., AWS, Vercel) and BackendBhai is running locally on your laptop, `localhost:4318` will not work. You must expose your BackendBhai collector to the internet (e.g., via `ngrok`) or set the endpoint to your machine's public IP address.

### Step 4: Analyze Your APIs!

1. Open BackendBhai in your browser at **http://localhost:4001**.
2. Trigger some traffic in your application (click around the UI, send Postman requests, run automated tests).
3. Watch the traces stream into BackendBhai in real-time. The platform will automatically reverse-engineer your APIs, draw a topology map, and show you exact latency breakdowns (Self Time vs. Total Time) for every endpoint and database query.

### Optional: Proactive API Discovery

BackendBhai doesn't just passively wait for traffic; it can proactively map your APIs if you provide an OpenAPI (Swagger) spec.

If your project has an OpenAPI spec, tell BackendBhai about it:

```bash
curl -X POST http://localhost:4001/api/v1/discovery/openapi \
  -H "Content-Type: application/json" \
  -d '{
        "serviceName": "my-awesome-project", 
        "specUrl": "http://localhost:3000/openapi.json"
      }'
```

BackendBhai will ingest all your endpoints and make them available for the **Endpoint Probing** feature inside the UI, allowing you to instantly test and analyze endpoints that haven't received natural traffic yet.
