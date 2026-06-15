# PRDBot

PRDBot is an autonomous AI agent that enforces your Product Requirements Document on every GitHub issue the moment it is created. Connect a repository, upload your PRD once, and every new issue is automatically evaluated through **four AI agents** — Drift Detection, AI Issue Review, Rule Enforcement, and Code Generation — with results streamed live to the dashboard and actionable feedback posted directly on GitHub.

## How It Works

PRDBot operates through a seamless, event-driven architecture:

1. **Repository Configuration:** Log into the PRDBot dashboard, connect a GitHub repository, and upload your Product Requirements Document (PRD) in Markdown format. On save, Gemini automatically extracts product identity metadata (target user, core focus, out-of-scope items, anti-patterns) used by the Drift Detection agent.
2. **Event Listening:** PRDBot listens for incoming GitHub webhooks (issue created) for every registered repository.
3. **Background Processing:** The webhook enqueues a background job via Inngest, ensuring reliable and durable execution with exponential-backoff retries — without blocking the main API.
4. **Three-Pass AI Analysis (Single Gemini Call):** The agent runs three sequential analysis passes in a single structured JSON call to Gemini:
   - **Pass 1 — Drift Detection 🧭:** Detects issues that conflict with the product's core vision, target user, or explicit out-of-scope boundaries. Produces a drift score (0–100) and type (`vision_conflict`, `wrong_user`, `out_of_scope`, `anti_pattern`).
   - **Pass 2 — AI Issue Review 📋:** Scores strategic alignment, roadmap relevance, and business value — equivalent to a senior PM's gut check, automated. Produces an alignment score (0–100) and findings list.
   - **Pass 3 — Rule Enforcement ✅:** Checks the issue against every explicit written rule in the PRD, quotes the exact rule violated, and generates a suggested rewrite.
5. **Code Generation 🤖:** For compliant issues, a fourth Code Agent fetches relevant repository files, calls Gemini to generate production-ready code changes, opens a pull request on GitHub, and posts a comment linking back to the issue.
6. **Actionable Feedback:** The combined result is posted as a structured GitHub comment covering all three passes. Issues are labeled `prdbot-review` when flagged. All results stream live to the dashboard via Supabase Realtime.

## Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Authentication** | Clerk (GitHub OAuth) |
| **Database ORM** | Prisma |
| **Database Hosting** | Supabase (PostgreSQL) |
| **Background Jobs** | Inngest |
| **AI Model** | Google Gemini 2.5 Flash |
| **GitHub Integration** | Octokit (`@octokit/rest`) |
| **Realtime Streaming** | Supabase Realtime (broadcast channels) |
| **Animations** | Framer Motion |
| **Styling** | Tailwind CSS v4 |

## Architecture

```
New GitHub Issue Created
    └── POST /api/webhooks/github (verified via HMAC SHA-256)
            └── 202 Accepted immediately
                    └── Inngest event: "agent/issue.created"
                            └── Step: fetch-prd (prdText + prdMeta from Supabase)
                                    └── Step: run-agent (single Gemini call → structured JSON)
                                            ├── Pass 1: Drift Detection   → broadcast "drift" event
                                            ├── Pass 2: AI Issue Review   → broadcast "ai_review" event
                                            ├── Pass 3: Rule Enforcement  → broadcast "rule_enforcement" event
                                            └── overall.action:
                                                    ├── comment_on_issue → Octokit posts combined comment
                                                    ├── flag_for_review  → Octokit adds "prdbot-review" label
                                                    └── none             → issue marked compliant
                                    └── Step: save-result → AgentAction record persisted
                            └── (if compliant) Inngest event: "agent/issue.codegenerate"
                                    ├── Fetch relevant files from GitHub
                                    ├── Gemini generates code changes (JSON file plan)
                                    ├── Create branch + commit files via Git Data API
                                    └── Open pull request, post comment with PR link
```

## Key Features

| Feature | Description |
|---|---|
| GitHub OAuth Login | Clerk Auth with GitHub provider |
| Repository Management | Add, view, and remove connected repositories |
| PRD Upload & Storage | PRD text + auto-extracted identity metadata (`prdMeta`) stored per repo |
| Webhook Receiver | POST endpoint that verifies HMAC signature and triggers agent via Inngest |
| Pass 1 — Drift Detection | Vision conflict, wrong user, out-of-scope, anti-pattern detection with 0–100 score |
| Pass 2 — AI Issue Review | Alignment score, roadmap fit, business value analysis |
| Pass 3 — Rule Enforcement | Explicit rule checking with exact rule citation and suggested rewrite |
| Single Gemini Call | All 3 passes in one structured JSON response (no latency penalty) |
| Code Agent | Generates code changes and opens a pull request for compliant issues |
| Multi-Agent UI | 4 agent cards (Drift, PM, QA, Verdict) + Code Agent card on dashboard |
| Live Agent Log | Supabase Realtime streams each pass step to the dashboard with per-agent labels and scores |
| Simulate Issue | Test the agent without a real GitHub webhook |
| Action History | Full audit log with per-pass results, expandable detail rows, and status filters |

## Getting Started

### Prerequisites

You will need accounts and API keys for the following services:

- [Clerk](https://clerk.com) — Authentication (enable GitHub OAuth provider)
- [Supabase](https://supabase.com) — PostgreSQL database
- [Google AI Studio](https://aistudio.google.com) — Gemini API key
- [GitHub](https://github.com) — Webhook secret and Personal Access Token
- [Inngest](https://www.inngest.com) — Background job event keys

### Local Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/Gintoki006/PRDbot.git
   cd PRDbot
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and fill in all required values:

   | Variable | Description |
   |---|---|
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
   | `CLERK_SECRET_KEY` | Clerk secret key |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
   | `DATABASE_URL` | Supabase connection string (Session Mode pooler) |
   | `GEMINI_API_KEY` | Google AI Studio API key |
   | `GITHUB_WEBHOOK_SECRET` | Secret used to verify webhook payloads |
   | `INNGEST_EVENT_KEY` | Inngest event key |
   | `INNGEST_SIGNING_KEY` | Inngest signing key |

3. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Run the Inngest dev server** (separate terminal):
   ```bash
   npx inngest-cli@latest dev
   ```
   Open [http://localhost:8288](http://localhost:8288) to verify both `run-agent-loop` and the Code Agent function are registered.

6. **Configure a GitHub webhook** (use [ngrok](https://ngrok.com) to expose your local server):
   - Payload URL: `https://<ngrok-url>/api/webhooks/github`
   - Content type: `application/json`
   - Secret: matches `GITHUB_WEBHOOK_SECRET` in `.env.local`
   - Events: **Issues** only

## Application Structure

```
app/
├── (auth)/                  # Clerk sign-in / sign-up pages
├── _components/             # Shared UI components (landing page)
├── api/
│   ├── agent/simulate/      # POST — trigger a simulated agent run
│   ├── history/             # GET — paginated audit log
│   ├── inngest/             # Inngest serve handler
│   ├── prd/                 # GET / POST / DELETE — PRD management
│   ├── repos/               # GET / POST / DELETE — repository management
│   └── webhooks/github/     # POST — GitHub webhook receiver
├── dashboard/
│   ├── _components/
│   │   ├── AgentCard.js        # Single agent result card (status, score, finding)
│   │   ├── AgentCardGrid.js    # 2×2 grid of 4 AgentCards + Code Agent card
│   │   ├── AgentLogPanel.js    # Live Supabase Realtime log with per-agent labels
│   │   ├── AddRepoModal.js     # Connect a GitHub repository
│   │   ├── HistoryTable.js     # Audit log with three-pass expandable detail
│   │   ├── PrdUploadModal.js   # Upload / update PRD rules
│   │   ├── RepoCard.js         # Repository card with PRD status badge
│   │   └── SimulatePanel.js    # Test the agent without a real webhook
│   ├── layout.js               # Dashboard shell with sidebar navigation
│   └── page.js                 # Main dashboard page
├── docs/                    # Documentation pages
└── profile/                 # User profile page

lib/
├── agent/
│   ├── executeTool.js       # GitHub actions: post comment, add label, build combined comment
│   ├── extractPrdMeta.js    # Gemini call to extract product identity from PRD text
│   ├── generateCode.js      # Gemini call to generate code changes from an issue
│   ├── loop.js              # Main agent loop (single Gemini call → three-pass JSON)
│   ├── prompt.js            # System prompt builder (prdText + prdMeta)
│   └── tools.js             # Tool declarations (legacy — no longer used for function calling)
├── github/
│   ├── createPullRequest.js # Git Data API: branch → commits → PR
│   └── fetchRelevantFiles.js # Fetch relevant repo files for code generation
├── inngest/
│   ├── client.js            # Inngest client (id: "prdbot")
│   ├── codeAgentFunction.js # Code Agent background function
│   └── functions.js         # Main agent background function (three-pass evaluation)
├── prompts/
│   └── codeAgentSystemPrompt.js  # System prompt for the Code Agent
├── supabase/
│   ├── client.js            # Browser-side Supabase client (Realtime subscriptions)
│   └── server.js            # Server-side Supabase client (service role)
├── countRules.js            # Heuristic rule counter for PRD text
├── octokit.js               # Octokit factory (initialize with a GitHub token)
├── prisma.js                # Prisma singleton (prevents connection exhaustion in serverless)
└── webhooks/
    └── verify.js            # HMAC SHA-256 webhook signature verification

prisma/
└── schema.prisma            # Repository, Prd, AgentAction models
```

## Data Models

### `Prd`

| Field | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `userId` | String | Clerk user ID |
| `repoFullName` | String | Unique per user (`owner/repo`) |
| `prdText` | String | Full PRD content |
| `prdMeta` | Json | Extracted identity: `{ targetUser, coreFocus, outOfScope[], antiPatterns[] }` |
| `ruleCount` | Int | Derived on save |

### `AgentAction`

| Field | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `repoFullName` | String | Indexed |
| `issueNumber` | Int | GitHub issue number |
| `issueTitle` | String | Issue title |
| `toolCalled` | String | `comment_on_issue`, `flag_for_review`, or `none` |
| `driftStatus` | String | `compliant`, `warning`, or `violation` |
| `driftScore` | Int | 0–100 |
| `driftType` | String | `vision_conflict`, `wrong_user`, `out_of_scope`, `anti_pattern`, or `none` |
| `driftReason` | String | Explanation of drift |
| `driftSuggestedAlt` | String | Alternative suggestion |
| `aiReviewStatus` | String | `compliant`, `warning`, or `violation` |
| `alignmentScore` | Int | 0–100 |
| `aiFindings` | Json | Array of strategic finding strings |
| `aiMissing` | Json | Array of missing elements |
| `ruleEnforcementStatus` | String | `compliant`, `warning`, or `violation` |
| `ruleQuoted` | String | Exact PRD rule(s) violated |
| `suggestedRewrite` | String | Suggested issue rewrite |
| `confidence` | Int | 0–100 |
| `result` | String | Combined agent summary |
| `status` | String | `compliant`, `violated`, `flagged`, `error`, or `simulated` |
| `simulated` | Boolean | `true` if triggered via Simulate panel |
| `prUrl` | String? | Pull request URL (Code Agent) |
| `codeAgentStatus` | String | `idle`, `generating`, `pr_opened`, or `error` |

## GitHub Comment Format

When a violation is detected, PRDBot posts a structured comment covering all three passes:

```markdown
## 🤖 PRDBot Analysis

---

### 🧭 Drift Agent — ❌ Drift Detected (Score: 91/100)

**Type:** Vision Conflict
**Reason:** Introduces consumer-social mechanics that conflict with the B2B productivity focus.
**Conflicts with:** "Out of scope — social features"
**Suggested alternative:** Instead of social feeds, consider collaborative engineering timelines.

---

### 📋 PM Agent — ⚠ Alignment Score: 38%

**Findings:**
- No roadmap objective mentions UI theming
- Target user prioritises workflow over aesthetics per PRD
- No user impact or business value defined

---

### ✅ QA Agent — ❌ 2 Rules Violated

**Rule violated:** "Every issue must have a time estimate"
**Rule violated:** "UI issues must mention mobile accessibility"

**Suggested rewrite:**
Add: Estimated effort, mobile accessibility note, roadmap link.

---

*Generated by PRDBot — not a blocker, a nudge toward better requirements.*
```

## Error Handling

| Scenario | Handling |
|---|---|
| Webhook received but no PRD found | Agent logs error, no GitHub action, `status: "error"` |
| Gemini API failure | Inngest retries with exponential backoff (up to 3 attempts) |
| Gemini returns malformed JSON | Fallback to rule enforcement only; passes 1 & 2 marked `error` |
| `prdMeta` extraction fails at upload | PRD saved with empty `prdMeta`; Pass 1 skipped at eval time |
| Octokit comment/label post fails | Error logged, `status: "error"`, Inngest retries |
| GitHub webhook secret mismatch | 401 returned immediately, request dropped |
| Code Agent file fetch fails | Error broadcast, graceful exit — does not crash evaluation |

## Deployment

The application is optimized for deployment on **Vercel**.

1. Push your code to GitHub and connect the repository to a Vercel project.
2. Add all environment variables from `.env.example` to your Vercel project settings.
3. Set the build command to run migrations before building:
   ```
   prisma generate && prisma migrate deploy && next build
   ```
4. Configure the Inngest integration on Vercel (auto-discovers `/api/inngest`).
5. Set your GitHub webhook to point to the production URL:
   ```
   https://your-domain.vercel.app/api/webhooks/github
   ```
