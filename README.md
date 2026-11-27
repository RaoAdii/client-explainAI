# ClientExplain AI

ClientExplain AI turns a legal-process brief into structured content with Groq, renders a client-facing infographic deterministically, and stores the PNG privately in Supabase.

## Local setup

1. Use Node.js 22 or newer and run `npm install`.
2. Create a Supabase project and run `supabase/migrations/202611270001_initial_schema.sql` in the SQL editor (or with the Supabase CLI).
3. Copy `.env.example` to `.env.local` and add the Supabase URL, publishable key, server-only secret key, and a freshly rotated Groq API key. Never expose either server secret to browser code.
4. In Supabase Auth, add `http://localhost:3000/auth/confirm` to the allowed redirect URLs. The callback supports both PKCE `code` redirects and token-hash email templates. For local demos, either configure email delivery or disable email confirmation.
5. Run `npm run dev` and open `http://localhost:3000`.

## Verification

```bash
npm run verify
```

The application intentionally provides general legal information only. Every generated image is labeled as an AI-created draft requiring professional review.
