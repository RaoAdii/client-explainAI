# ClientExplain AI

ClientExplain AI turns a legal-process brief into a clear, step-by-step explanation with plain-language definitions of key legal terms.

## Local setup

1. Use Node.js 22 or newer and run `npm install`.
2. Create a Supabase project and run the SQL files in `supabase/migrations/` in filename order in the SQL editor (or with the Supabase CLI). The latest migration allows up to 10 generation attempts per user per hour.
3. Copy `.env.example` to `.env.local` and add the Supabase URL, publishable key, server-only secret key, and a valid Groq API key (`GROQ_API_KEY`). This project currently uses Groq, not Gemini. Never expose either server secret to browser code.
4. In Supabase Auth, add `http://localhost:3000/auth/confirm` to the allowed redirect URLs. The callback supports both PKCE `code` redirects and token-hash email templates. For local demos, either configure email delivery or disable email confirmation.
5. Run `npm run dev` and open `http://localhost:3000`.

## Verification

```bash
npm run verify
```

On a project page, select **Explain this project** to get an AI-written overview, ordered process steps, and plain-language legal terms. No images are generated.

The application intentionally provides general legal information only. Verify important details with a qualified legal professional.
