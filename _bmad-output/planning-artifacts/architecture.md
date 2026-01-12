---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - "c:/RealProject/ScrapperOffre/_bmad-output/planning-artifacts/prd.md"
  - "c:/RealProject/ScrapperOffre/_bmad-output/planning-artifacts/product-brief-ScrapperOffre-2026-01-07.md"
  - "c:/RealProject/ScrapperOffre/_bmad-output/planning-artifacts/research/technical-Architecture-automation-research-2026-01-07.md"
  - "c:/RealProject/ScrapperOffre/_bmad-output/analysis/brainstorming-session-2026-01-06.md"
workflowType: 'architecture'
project_name: 'ScrapperOffre'
user_name: 'Roket'
date: '2026-01-07'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
*   **Scraping Engine:** Nécessite un design pattern "Strategy" pour gérer multiples sources uniformément.
*   **Notion Integration:** Agit comme la "Single Source of Truth" pour l'interface utilisateur.
*   **Local AI:** Intégration Ollama asynchrone pour l'enrichissement de contenu.

**Non-Functional Requirements:**
*   **Privacy First:** Stockage strictement local via **SQLite** (décision explicite vs JSON) pour robustesse et requêtes structurées.
*   **Maintainability (TDD):** Architecture testable (Dependency Injection) pour mocker Notion/Scraping facilement.
*   **Resilience:** Pattern Circuit Breaker indispensable pour gérer les blocages de scraping.

**Scale & Complexity:**
*   **Primary domain:** Backend / Automation (Node.js).
*   **Complexity level:** Medium.
*   **Estimated components:** ~6-8 modules (Core, Scraper Manager, Providers x4, Notion Service, AI Service, Database Service, Config, Logger).

### Technical Constraints & Dependencies
*   **Node.js Runtime:** Contrainte de mémoire (<500Mo).
*   **Playwright:** Dépendance binaire lourde à gérer.
*   **Ollama:** Dépendance externe requise au runtime.
*   **Persistence:** SQLite requis.

### Cross-Cutting Concerns Identified
*   **Error Handling:** Gestion unifiée des erreurs pour feedback utilisateur (Bannière Notion).
*   **Configuration:** Gestion des paramètres utilisateurs (Notion + Env).
*   **Observability:** Logging structuré pour le debugging "Headless".

## Starter Template Evaluation

### Primary Technology Domain

**Node.js Background Automation (Worker/CLI)** - Focus on resilience, speed, and local execution without heavy web framework overhead.

### Starter Options Considered

*   **NestJS Standalone:** Considered for its structure and Dependency Injection, but rejected as "Overkill" (YAGNI) for a background worker. The overhead of the framework is unnecessary for a local automation tool.
*   **Express/Fastify Starters:** Rejected as they are optimized for HTTP Request/Response cycles, whereas this system is event/schedule driven.
*   **Custom Clean Architecture:** Selected as the best fit. Allows strict control over dependencies, minimal footprint (<500Mo NFR), and perfect alignment with the "Craftsmanship" (SOLID, TDD) requirements.

### Selected Starter: Custom Clean Architecture

**Rationale for Selection:**
We chose a custom setup to ensure **Engineering Excellence** and **Minimal Footprint**.
*   **Performance:** Avoiding unused framework code ensures we stay well within the 500Mo memory limit.
*   **Control:** Clean Architecture (Domain/Application/Infrastructure) can be implemented purely without framework constraints, making TDD easier.
*   **Modernity:** Using best-in-class modern tools (Vitest, Biome) rather than legacy defaults often found in starters (Jest, ESLint).

**Initialization Command:**

```bash
npm init -y && npm install typescript tsx @types/node -D && npx tsc --init
# Plus explicit installation of the chosen "Craftsmanship" stack
```

**Architectural Decisions Provided by Starter (Custom Definition):**

**Language & Runtime:**
*   **Node.js 22 LTS:** For latest features and stability.
*   **TypeScript 5.x (Strict Mode):** Mandatory for type safety.

**Styling Solution:**
*   **N/A:** Headless automation (CLI/Worker).

**Build Tooling:**
*   **tsx:** For fast development execution (no compile step needed in dev).
*   **tsc:** For production build.

**Testing Framework:**
*   **Vitest:** Selected over Jest for speed and native ESM/TypeScript support.
*   **Playwright:** For E2E Scraping tests.

**Code Organization:**
*   **Clean Architecture:**
    *   `src/domain`: Entities & Interfaces (Pure TS, no deps).
    *   `src/application`: Use Cases (Orchestration).
    *   `src/infrastructure`: Implementations (Scrapers, Notion, SQLite).
    *   `src/interface`: CLI/Worker Entrypoints.

**Development Experience:**
*   **Biome:** For fast Linting & Formatting.
*   **Zod:** For strictly typed configuration.
*   **Winston:** For structured logging.

## Core Architectural Decisions

### Data Architecture

*   **Database Engine:** **SQLite** (via `better-sqlite3` driver).
    *   *Rationale:* Zero-configuration, local-file based, perfect for single-user desktop app.
*   **Query Builder:** **Kysely**.
    *   *Rationale:* Type-safe SQL builder without the runtime overhead and binary weight of an ORM like Prisma. Aligns with "Minimal Footprint" NFR (<500Mo).
    *   *Schema Management:* Kysely Migrations (SQL based).

### Authentication & Security

*   **Credential Storage:** **Encrypted Configuration File** (`config.enc` + `dotenv`).
    *   *Rationale:* Portable across OS (Windows/Mac/Linux) without native compilation issues (node-gyp) associated with Keytar. The master key will be generated during setup and stored in a user-restricted file.
*   **Local-First Privacy:** No data is ever sent to a third-party server (except Notion API and target Job Boards).

### Infrastructure & Execution

*   **Process Management:** **PM2**.
    *   *Rationale:* Robustness. Handles auto-restart on crash, log rotation, and startup persistence.
*   **CLI Interaction:** **Commander** + **Prompts**.
    *   *Rationale:* Better UX than standard `readline` or `Inquirer`.
*   **Notion synchronization:** **Polling Strategy**.
    *   *Rationale:* Since we have no public IP for Webhooks, the bot will poll Notion every X minutes (configurable) for changes.

### Decision Impact Analysis

**Implementation Sequence:**
1.  **Core Domain:** Define Entities (JobOffer, ScraperInterface).
2.  **Infrastructure (Data):** Setup SQLite + Kysely Migrations.
3.  **Infrastructure (Config):** Setup Encrypted Config Manager.
4.  **Application:** Implement Scraper Logic (Playwright) & Notion Client.
5.  **Interface:** Build CLI Wizards (Setup) and PM2 scripts.

## Implementation Patterns & Consistency Rules

### Naming Patterns

*   **Classes/Components:** `PascalCase` (e.g., `LinkedInScraper`, `NotionClient`).
*   **Functions/Variables:** `camelCase` (e.g., `fetchJobOffers`, `isProcessing`).
*   **Files:** `kebab-case` (e.g., `linkedin-scraper.ts`, `notion-client.ts`).
*   **Database (SQLite):** `snake_case` (e.g., `job_offers`, `created_at`).
*   **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`).

### Structure Patterns (Clean Architecture)

*   **Domain (`src/domain`):** Pure TypeScript entities and interfaces. **NO external dependencies** allowed here.
*   **Use Cases (`src/application`):** Orchestration logic. Can import Domain and Ports.
*   **Infrastructure (`src/infrastructure`):** Concrete implementations (Adapters). Can import external libs (sqlite, playwright, notion-sdk).
*   **Interface (`src/interface`):** Entry points (CLI commands, Cron jobs).

### Process Patterns

*   **Error Handling:** "Fail Gracious".
    *   Use **Result Object Pattern** (`Result<T, E>`) for domain logic errors (avoid throwing exceptions for expected failures).
    *   **Global Catch:** Main process must catch unhandled exceptions, log them, and exit cleanly.
*   **Logging:**
    *   **JSON Format:** For easy parsing.
    *   **Context:** Logs must include `runId` and `moduleName`.
*   **Testing:**
    *   **Unit Tests:** Co-located `*.spec.ts` files inside `src/`.
    *   **E2E Tests:** Located in `tests/e2e/`.

### Enforcement Guidelines

**All AI Agents MUST:**
1.  Respect the Dependency Rule (Domain imports nothing).
2.  Never hardcode secrets (use Config Service).
3.  Write a test for every new Use Case.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
scrapper-offre/
├── package.json
├── tsconfig.json          # Strict Mode
├── biome.json             # Linter/Formatter
├── pm2.config.js          # Process Manager
├── .env.example           # Template de config
├── src/
│   ├── main.ts            # Entrypoint global
│   ├── domain/            # 🟢 CŒUR (Zéro dépendance)
│   │   ├── entities/      # job-offer.ts, user-config.ts
│   │   └── ports/         # scraper-port.ts, notion-port.ts
│   ├── application/       # 🟡 ORCHESTRATION (Use Cases)
│   │   ├── scrapers/      # scrape-all.use-case.ts
│   │   └── notion/        # sync-offers.use-case.ts
│   ├── infrastructure/    # 🔴 ADAPTERS (Implémentations)
│   │   ├── db/            # sqlite-client.ts, migrations/
│   │   ├── notion/        # notion-api-adapter.ts
│   │   ├── scrapers/      # playwright-scraper.ts, linkedin-adapter.ts
│   │   └── config/        # crypto-config.service.ts
│   └── interface/         # 🔵 ENTRÉES
│       ├── cli/           # setup-wizard.ts
│       └── worker/        # job-scheduler.ts
└── tests/
    └── e2e/               # Tests de scraping réels
```

### Architectural Boundaries

*   **API Boundaries:**
    *   **Notion API:** Strict interaction via `NotionAdapter`. No direct API calls from Use Cases.
    *   **Scraping:** All HTML parsing happens inside `infrastructure/scrapers`. Domain receives clean `JobOffer` objects.
*   **Data Boundaries:**
    *   **SQLite:** Accessed ONLY via `infrastructure/db` repositories. No SQL queries in Application layer.

### Integration Points

*   **Notion:** Polling every X min via `job-scheduler.ts` -> `sync-offers.use-case.ts`.
*   **Job Boards:** Direct HTTP/Headless calls via `playwright-scraper.ts`.

### Requirements to Structure Mapping

*   **FR-01 (Scraping):** `src/infrastructure/scrapers/`
*   **FR-05 (Notion DB):** `src/infrastructure/notion/`
*   **FR-10 (Logs):** Configured in `src/main.ts`, used everywhere.
*   **NFR-04 (Local First):** Data persistence in `src/infrastructure/db/sqlite-client.ts`.

## Architecture Validation Results

### Coherence Validation ✅

*   **Decision Compatibility:** The selection of `Kysely` aligns perfectly with the `SQLite` choice and `TypeScript` Strict Mode requirement. `Result<T, E>` pattern supports the "Fail Gracious" philosophy.
*   **Structure Alignment:** The Clean Architecture folder structure (`domain`, `infrastructure`) explicitly separates the dependencies as agreed.

### Requirements Coverage Validation ✅

*   **Functional Requirements:**
    *   Scraping Logic is isolated in `infrastructure/scrapers` (FR-01).
    *   Notion Sync is handled by `application/notion` (FR-05).
    *   Logs are centralized via Winston (FR-10).
*   **Non-Functional Requirements:**
    *   **Local First (NFR-04):** No cloud DB, local SQLite.
    *   **Footprint (NFR-07):** Minimal dependencies (No NestJS/Prisma), lightweight `better-sqlite3`.

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High. The stack is modern, type-safe, and fit-for-purpose (Background Automation).

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Document Location:** `c:/RealProject/ScrapperOffre/_bmad-output/planning-artifacts/architecture.md`

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing ScrapperOffre. Follow all decisions, patterns, and structures exactly as documented.

**First Implementation Priority:**
Initialize the project structure and install core dependencies.

**Development Sequence:**
1.  **Project Initialization:** `npm init` + TypeScript/Biome/Vitest setup.
2.  **Core Domain:** Define `JobOffer` entity.
3.  **Infrastructure:** Setup SQLite + Kysely.
4.  **Adapters:** Implement Scraper & Notion clients.
5.  **Use Cases:** Tie everything together.

### Next Steps

Be ready to generate the `implementation_plan.md` based on this architecture.
