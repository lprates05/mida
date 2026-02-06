# WhatsApp Bot MVP (Rule-Based + Optional LLM)

This MVP receives WhatsApp Cloud API messages, generates a deterministic **Decision Card** JSON for each message, and responds using template-based messaging. An optional `USE_LLM` feature flag enables LLM refinement of classification, extraction, and wording. Raw chat text is **not** stored—only structured summaries.

## Core Flow
1. WhatsApp webhook receives text message.
2. Rule-based classification (allowed/refused/unknown).
3. Rule-based extraction (amounts, timeframes, goals, constraints).
4. Decision Card JSON is built and stored in Supabase Postgres.
5. Optional LLM refinement (feature flag) with JSON validation and fallback.
6. Response templates generate a reply with supportive opening, assumptions, up to 3 clarifying questions, and a next step.
7. Human escalation rules can create a ticket.

## Local Development
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Create env file**:
   ```bash
   cp .env.example .env
   ```
3. **Update env values** in `.env` for WhatsApp Cloud API and Supabase.
4. **Run database schema**:
   ```bash
   psql "$DATABASE_URL" -f sql/schema.sql
   ```
5. **Start server**:
   ```bash
   npm run dev
   ```

## WhatsApp Cloud API Webhook Setup
- Verify URL: `GET /webhook`
- Webhook URL: `https://<your-domain>/webhook`
- Verify token: `WHATSAPP_VERIFY_TOKEN`

## Deployment Steps
1. Provision a server with Node.js 18+.
2. Create a Supabase Postgres instance and run `sql/schema.sql`.
3. Set environment variables (from `.env.example`).
4. Expose HTTPS endpoint for WhatsApp webhook (e.g., Render, Fly.io, AWS).
5. Start the app with `npm start`.

## Decision Card (Stored)
Each message results in a Decision Card JSON (stored in Postgres) with:
- `classification`: allowed/refused/unknown
- `extraction`: amounts/timeframes/goals/constraints
- `input_summary`: structured summary (no raw chat stored)
- `decision`: escalation details
- `llm`: usage status

## Feature Flags
- `USE_LLM=false` (default) keeps processing fully rule-based.
- If `USE_LLM=true`, LLM can refine classification/extraction/wording.

## Notes
- Raw chat text is never stored in Postgres.
- Escalation tickets are created for refused topics, human requests, or low confidence.
