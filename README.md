# PRDBot

PRDBot is an intelligent GitHub assistant designed to automatically review issues and ensure they align with your project's Product Requirements Document (PRD). By integrating directly into your GitHub workflow, it helps maintain product consistency, catches deviations early, and provides actionable feedback to developers and product managers.

## How It Works

PRDBot operates through a seamless, event-driven architecture:

1. **Repository Configuration:** Users log into the PRDBot dashboard, connect a GitHub repository, and upload their Product Requirements Document (PRD) in Markdown format.
2. **Event Listening:** PRDBot listens to incoming GitHub webhooks (such as when an issue is created or updated) for the registered repositories.
3. **Background Processing:** The webhook enqueues a background job via Inngest, ensuring reliable and durable execution without blocking the main API.
4. **AI Analysis:** The Gemini AI agent fetches the relevant PRD and analyzes the issue's content against the documented requirements.
5. **Actionable Feedback:** If the agent detects a deviation from the PRD, it uses GitHub's API (via Octokit) to automatically add a `prdbot-review` label and post a detailed comment on the issue. This comment includes the specific rule violated, an explanation, and a suggested rewrite.

## Technology Stack

- **Framework:** Next.js (App Router)
- **Authentication:** Clerk
- **Database ORM:** Prisma
- **Database Hosting:** Supabase (PostgreSQL)
- **Background Jobs:** Inngest
- **AI Model:** Google Gemini
- **GitHub Integration:** Octokit
- **Styling:** Tailwind CSS

## Getting Started

### Prerequisites

You will need accounts and API keys for the following services:
- Clerk (Authentication)
- Supabase (PostgreSQL Database)
- Google AI Studio (Gemini API Key)
- GitHub (Webhook Secret and Personal Access Token)
- Inngest (Background Jobs)

### Local Development Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy the example environment file and fill in your specific keys:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and populate all the required secrets.

3. **Database Setup:**
   Generate the Prisma client and run the initial database migrations to set up your Supabase database:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Run the Inngest Dev Server:**
   In a separate terminal window, start the Inngest local development server to process background jobs:
   ```bash
   npx inngest-cli@latest dev
   ```

### Application Structure

- `app/`: Next.js frontend pages, API routes, and dashboard layouts.
- `lib/agent/`: Core AI logic, prompt definitions, and tool execution handlers.
- `lib/inngest/`: Inngest client initialization and background function definitions.
- `lib/webhooks/`: Utilities for securely verifying incoming GitHub webhook payloads.
- `prisma/`: Database schema and migration files.

## Deployment

The application is optimized for deployment on Vercel. Ensure that all environment variables specified in `.env.example` are configured in your Vercel project settings prior to deployment. You will also need to configure your GitHub webhook to point to your production URL (`/api/webhooks/github`).
