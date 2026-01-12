---
stepsCompleted: []
inputDocuments: []
workflowType: 'research'
lastStep: 1
research_type: 'technical'
research_topic: 'Architecture technique pour l''outil d''automatisation de candidatures (Scraping + Notion + IA)'
research_goals: 'Valider choix Playwright/Puppeteer, API Notion, et IA'
user_name: 'Roket'
date: '2026-01-07'
web_research_enabled: true
source_verification: true
---

# Research Report: technical

**Date:** 2026-01-07
**Author:** Roket
**Research Type:** technical

---

## Research Overview

**Research Topic:** Architecture technique pour l'outil d'automatisation de candidatures (Scraping + Notion + IA)
**Research Goals:** Valider choix Playwright/Puppeteer, API Notion, et IA

**Technical Research Scope:**

- Architecture Analysis - design patterns, frameworks, system architecture
- Implementation Approaches - development methodologies, coding patterns
- Technology Stack - languages, frameworks, tools, platforms
- Integration Patterns - APIs, protocols, interoperability
- Performance Considerations - scalability, optimization, patterns

**Research Methodology:**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights

**Scope Confirmed:** 2026-01-07

---

---

## Technology Stack Analysis

### Programming Languages

**Node.js (TypeScript) vs Python**
For this project, **Node.js (TypeScript)** is the recommended choice given the user's preference for `yarn` and the robust ecosystem for both Playwright and Notion.
*   **Node.js:** Native environment for Puppeteer and Playwright (Microsoft). excellent async handling.
*   **Python:** Strong for data science/AI, but Playwright was originally built for Node.js.

_Recommendation: Node.js/TypeScript for type safety and alignment with user's stack._

### Development Frameworks and Libraries

**Scraping Engine: Playwright vs Puppeteer**
*   **Playwright:** Supports multi-browser (Chromium, Firefox, WebKit). Better "auto-waiting" reducing flaky tests. Stronger modern API.
*   **Puppeteer:** Older, focused on Chrome. Good but less versatile for robust scraping than Playwright.
*   **Verdict:** **Playwright** is superior for avoiding detection (can use WebKit/Firefox engines which are less regulated than Chrome in some contexts) and handling dynamic content.
*   **Anti-Bot Layer:** Essential integration with `playwright-extra` and `puppeteer-extra-plugin-stealth` prevents simple detection (webdriver flags).

_Source: [ScrapingAnt Comparison](https://scrapingant.com/blog/puppeteer-vs-playwright), [ZenRows Anti-Bot](https://zenrows.com/blog/puppeteer-stealth)_

### Database and Storage Technologies

**Notion Database (as Backend)**
*   **Role:** Acts as the primary CMS and database.
*   **Structure:** "Master" database with different views (Kanban, Table).
*   **Limitations:**
    *   **Rate Limits:** ~3 requests/second avg. Burst handling required.
    *   **Payloads:** Max 100 blocks per request. Rich text limits (2000 chars).
    *   **Row Limits:** Performance degrades after >10k rows (unlikely to be reached quickly with job offers, but "Archive" strategy needed).

_Source: [Notion API Limits](https://developers.notion.com/reference/request-limits)_

### Development Tools and Platforms

**Deployment: Local vs Cloud**
*   **Local (BMM Recommended Strategy):** Running content on the user's physical machine uses a generic "ISP/Residential" IP. Highly trusted by LinkedIn/Indeed.
*   **Cloud (VPS/Vercel):** Datacenter IPs are flagged/blocked rapidly by top-tier anti-bots. Requires expensive "Residential Proxies" to work reliability.
---

## Implementation Approaches and Technology Adoption

### Development Workflows and Tooling

**Project Structure (Feature-Based)**
*   `src/features/scraper`: Playwright logic.
*   `src/features/notion`: API Client.
*   `src/features/ai`: Ollama Client (Local).
*   `src/core`: Config, Logger.
*   `scripts/`: Standalone entry points (e.g., `run-daily.ts`).

**Tooling Ecosystem**
*   **Runtime:** Node.js (Latest LTS) + `tsx` (for running TS directly during dev).
*   **Linting:** `eslint` (Flat Config) + `prettier`.
*   **Build:** `tsc` (Standard TypeScript Compiler) to `dist/`.

### Operational Practices

**Logging Strategy (Local Windows Friendly)**
*   **Library:** **Winston** (Selected over Pino).
*   **Reason:** Pino requires external log rotation tools (harder on Windows). Winston has `winston-daily-rotate-file` built-in, perfect for a script running in the background found in a folder.
*   **Log Retention:** Keep logs for 14 days, then auto-delete.

### Cost Optimization

*   **API Caching:** Store "Last Scraped Date" in Notion to prevent re-scraping the same URL.
*   **Zero-Cost AI:** Utilizing Local LLM means no monthly API bills, only local electricity/compute.

---

## Technical Research Recommendations

### Implementation Roadmap

1.  **Phase 1: Foundation** - Setup Repo, ESLint, Logger, and Notion Client (Read-Only).
2.  **Phase 2: Scraper Prototype** - Playwright script to login to LinkedIn and dump HTML to file.
3.  **Phase 3: Integration** - Connect Scraper -> Ollama (Local) -> Notion.
4.  **Phase 4: Automation** - Add Circuit Breaker, Retries, and Task Scheduler setup.

### Technology Stack Recommendations

*   **Language:** TypeScript (Node.js)
*   **Scraper:** Playwright + `playwright-extra`
*   **Database:** Notion (via API)
*   **AI:** **Local LLM (Ollama)**
*   **Logging:** Winston
*   **Resilience:** `p-retry` + internal Circuit Breaker logic

### Final Verdict

The proposed architecture is **Feasible**, **Low Cost**, and **Maintainable** for a single-user local deployment.
---

## Architectural Patterns and Design

### System Architecture Patterns

**Modular Monolith (Locally Run)**
*   **Core Principle:** Single repository, but strict separation of concerns to allow future refactoring (e.g., moving the scraper to the cloud).
*   **Modules:**
    1.  `@scraper`: Playwright logic, browser management.
    2.  `@parser`: Regex/LLM extraction logic.
    3.  `@notion`: Client for Notion API (Database Sync).
    4.  `@core`: Config, Logger, Utilities.

### Resilience Patterns

**Circuit Breaker & Retries**
*   **Strategy:** Exponential Backoff for 429 (Rate Limit) errors.
*   **Circuit Breaker:** If > 5 consecutive failures (e.g., LinkedIn changes layout), STOP the script and send a notification (System Notification / Console Alert). Do not spam requests.

**Deduplication Strategy**
*   **Layer 1 (Local):** `cache/processed_ids.json` - Simple file store of last 1000 IDs to avoid Notion API lookups.
*   **Layer 2 (Remote):** Query Notion DB for existing URL before insertion.

### Data Architecture

**Unidirectional Data Flow**
`Source (LinkedIn)` -> `Raw HTML` -> `Structured JSON` -> `Notion DB`
*   **State:** The Notion Database is the "Single Source of Truth". Local files are just a temporary cache.
*   **Validation:** Use Zod/Pydantic schemas to ensure no "undefined" data hits the database.

### Security & Privacy

**Local-First Security**
*   **Credentials:** `.env` file for API Keys (Notion, OpenAI). Never committed.
*   **Session Management:** Playwright `auth.json` (cookies) stored locally. **GITIGNORE** this file to prevent leaking session tokens.
liability.

---

## Integration Patterns Analysis

### Notion Integration Strategy

**API Design: REST Polling vs Webhooks**
*   **Webhooks:** Exist but require a public HTTPS endpoint (Server/Ngrok). Complicates the "Local Run" architecture. Payload is minimal (requires callback).
*   **Polling (Recommended):** The script runs periodically (e.g., every hour).
    *   *Logic:* `Notion.databases.query({ filter: { property: "Status", select: { equals: "To Process" } } })`.
    *   *Simplicity:* Keep everything local. No external server maintenance.

**Data Flow**
1.  **Scraper** -> Generates `job_offer.json` (Raw Data).
2.  **Processor** -> Validates against Duplicates.
3.  **Loader** -> `Notion.pages.create()` (Insert).

### AI Integration Patterns

**Structured Data Extraction**
*   **Protocol:** **Ollama API** (`POST /api/generate`).
*   **Format:** Enabled `format: "json"` parameter with a strict System Prompt defining the JSON Schema.
*   **Model:** `llama3` or `mistral` (7B quantized) is sufficient for extraction tasks.

**Status Updates**
*   **Trigger:** User clicks a "Button" property in Notion (actually a checkbox "Generate Draft").
*   **Flow:** Script detects "Generate Draft" = Checked -> Calls Local Ollama API -> Updates "Draft Content" -> Unchecks box.

### System Interoperability

**Micro-Modular Architecture (Node.js)**
*   **Module 1: Scraper (Playwright)** - Responsible ONLY for getting HTML/Text.
*   **Module 2: Parser (LLM/Regex)** - Responsible ONLY for structuring data.
*   **Module 3: Manager (Notion Client)** - Responsible for DB Sync.
*   *Benefit:* If Notion changes API, only Module 3 breaks. If LinkedIn changes HTML, only Module 1 breaks.
*   **Conclusion:** Start with **Local Execution** (Task Scheduler / Cron) to save costs and avoid bans.

### AI Integration

**Text Generation: Local LLM (Ollama) vs OpenAI**
*   **Local LLM (Ollama + Llama 3):** User Preference.
    *   **Pros:** Total privacy, Zero API cost, Offline capability.
    *   **Cons:** Requires local RAM/GPU resources. Initial setup (install Ollama).
    *   **Reliability:** Use **Ollama Structured Outputs** (v0.5.0+) with `format: json` to guarantee valid extraction schemas.
*   **OpenAI API:** Fallback only if local resources are insufficient.

_Source: [Ollama Structured Outputs](https://ollama.com/blog/structured-outputs)_
