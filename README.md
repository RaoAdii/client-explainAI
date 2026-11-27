# ClientExplain AI

ClientExplain AI is a legal-tech web application that turns a legal-process brief into a clear, client-friendly explanation. A law-firm user creates a project, records its jurisdiction and legal context, and asks the application to produce a plain-language overview, ordered process steps, and definitions of important legal terms.

The application improves client communication; it does not replace legal advice. A qualified legal professional should review generated explanations before sharing them with a client.

## What the application does

1. A user creates an account or signs in.
2. The user creates a legal project with its name, jurisdiction, legal area, audience, complexity, workflow status, and description.
3. Supabase stores the project and associates it with the authenticated user.
4. On the project page, the user selects **Explain this project**.
5. Gemini creates a structured explanation containing:
   - a title and short introduction;
   - a plain-language project summary;
   - four to six ordered process steps;
   - two to five relevant legal-term definitions; and
   - a reminder that procedures may vary.

The current application generates a structured text explanation. It does not generate an image.

## Main features

- Email and password authentication with Supabase Auth
- Protected dashboard and project pages
- Create, view, and edit legal-process projects
- Draft, active, and archived workflow states
- User-owned data protected with Supabase Row Level Security
- Schema-validated AI responses
- Automatic Gemini model fallback during model outages or capacity errors
- Per-user explanation rate limiting when the latest database migration is installed
- Responsive, minimal interface without gradients or purple styling

## Technology stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | Next.js 16, React, TypeScript | Pages, forms, Server Actions, and API routes |
| Styling | Tailwind CSS | Responsive minimal interface |
| Authentication | Supabase Auth | Sign-up, sign-in, password recovery, and sessions |
| Database | Supabase Postgres | Projects and explanation request records |
| Authorization | Supabase Row Level Security | Isolates every user's projects |
| AI provider | Google Gemini via `@google/genai` | Generates structured legal-process explanations |
| Validation | Zod | Validates project input and generated output |
| Testing | Vitest and Testing Library | Unit, component, and security-contract tests |

## Application flow

```text
Browser
  │
  ├── Supabase Auth ──► authenticated session
  │
  ├── Project form ──► Next.js Server Action ──► Supabase projects table
  │
  └── Explain project
        └── POST /api/projects/:id/plan
              ├── verify the signed-in user owns the project
              ├── reserve a rate-limit slot when the RPC is installed
              ├── send the project brief to Gemini
              ├── validate the structured response with Zod
              └── return the client-friendly explanation
```

Project content is treated as untrusted data rather than model instructions. The generation prompt asks Gemini not to invent exact deadlines, fees, citations, guaranteed outcomes, or case-specific legal advice.

## Prerequisites

- Node.js 22 or newer
- npm
- A Supabase project
- A Gemini API key from Google AI Studio

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

Open the SQL editor in your Supabase project and run every file in `supabase/migrations/` in filename order:

1. `202611270001_initial_schema.sql`
2. `202611270002_increase_generation_limit.sql`
3. `202611270003_text_explanations.sql`

The third migration creates the `explanation_requests` table and `reserve_explanation` database function. This enables the limit of 10 explanation requests per user per hour.

### 3. Configure authentication

In Supabase Auth, add this local callback URL to the allowed redirect URLs:

```text
http://localhost:3000/auth/confirm
```

For a local demonstration, configure an email provider or temporarily disable email confirmation in the Supabase authentication settings.

### 4. Configure environment variables

Copy `.env.example` to `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

Add the real values to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-server-only-secret-key

GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-3.8-flash
GEMINI_FALLBACK_MODEL=gemini-3.5-flash-lite
```

Only variables beginning with `NEXT_PUBLIC_` are available to browser code. Never add the Supabase secret key or Gemini API key to a public variable, commit them to Git, or include them in screenshots.

The Groq variables in `.env.example` are retained from an earlier experiment and are not used by the current explanation pipeline. Groq's configured text model does not generate images.

### 5. Start the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and add your first project. Restart the development server whenever environment variables are changed.

## Gemini model behavior

The application first uses `GEMINI_MODEL`, which defaults to `gemini-3.8-flash`. If that model is unavailable, rate-limited, or experiencing high demand, the server automatically tries `GEMINI_FALLBACK_MODEL`, which defaults to `gemini-3.5-flash-lite`.

The fallback is used for model availability errors only. Invalid or unauthorized API credentials are reported directly so configuration problems are not hidden.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the local Next.js development server |
| `npm run build` | Creates a production build |
| `npm start` | Starts the production server after a build |
| `npm run lint` | Runs ESLint |
| `npm run typecheck` | Checks TypeScript without emitting files |
| `npm test` | Runs the Vitest test suite once |
| `npm run test:watch` | Runs tests in watch mode |
| `npm run verify` | Runs linting, type checking, tests, and the production build |

Before submitting or deploying the project, run:

```bash
npm run verify
```

## Troubleshooting

### “The project could not be created”

- Confirm the initial Supabase migration was applied.
- Confirm `.env.local` contains the correct Supabase URL and keys.
- Verify that the signed-in user has a valid session.
- Restart the development server after changing environment variables.

### “The project explanation could not be started”

Apply `202611270003_text_explanations.sql`. The application can continue without the reservation RPC during local development, but installing the migration enables the intended rate limit and removes the database warning.

### “AI explanations are not configured on this server”

Add a valid `GEMINI_API_KEY` to `.env.local`, then restart the server.

### Gemini reports high demand or an unavailable model

Keep `GEMINI_FALLBACK_MODEL=gemini-3.5-flash-lite` configured. The application automatically tries it after a supported availability error.

### Gemini rejects the API credentials

Check that the key is valid, belongs to a Google project with Gemini API access, and has not been restricted in a way that blocks the server.

## Security and legal safeguards

- Supabase Row Level Security prevents users from reading or modifying another user's projects.
- The API route verifies project ownership before sending data to Gemini.
- Server credentials remain server-only.
- Project content is isolated and labelled as untrusted in the AI prompt.
- Generated responses are validated before being displayed.
- The system avoids promising outcomes or inventing precise legal requirements.
- Generated content is general legal information and requires professional review.

## Project structure

```text
app/
  (auth)/                    Authentication pages and actions
  (app)/                     Protected dashboard and project pages
  api/projects/[id]/plan/    Explanation-generation endpoint
components/                  Shared UI and project components
lib/
  generation/                Gemini prompt, fallback, validation, and errors
  projects/                  Project schemas, errors, and data access
  supabase/                  Browser, server, admin, and proxy clients
supabase/migrations/         Database schema, policies, and functions
tests/                       Unit, component, and security tests
```

## Current scope

ClientExplain AI currently focuses on generating reviewed, structured text explanations in English. Image generation, multilingual output, saved explanation history, exports, and team collaboration are possible future extensions, but they are not part of the current implementation.

## Disclaimer

ClientExplain AI is a communication aid. It does not provide legal advice, establish an attorney-client relationship, or guarantee that a generated explanation accurately reflects every rule in a particular jurisdiction. Always verify generated material with a qualified legal professional before relying on or distributing it.
