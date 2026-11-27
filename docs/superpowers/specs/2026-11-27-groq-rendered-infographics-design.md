# Groq-rendered infographics design

ClientExplain AI will replace Gemini native image generation with a deterministic infographic pipeline. Groq `openai/gpt-oss-20b` supplies a constrained English process plan; application code validates it, renders a 1200×1500 SVG in the existing warm-white/navy/amber visual language, and converts it to PNG for the existing private Supabase flow.

The plan contains a title, jurisdiction summary, 4–6 ordered steps, an optional variability note, and accessible alt text. User content is delimited as untrusted data; exact deadlines, citations, fees, contacts, guarantees, and case-specific advice are prohibited. Zod rejects malformed output, and one corrective Groq retry is allowed. The renderer escapes all text, wraps it to fixed bounds, always adds the legal-review disclaimer itself, and never lets model output control markup or styling.

This preserves auth, project CRUD, rate limits, storage, stale-image behavior, preview, and download. Gemini dependencies and configuration are removed. The chosen approach is Groq JSON plus deterministic SVG/PNG; direct Groq image generation was impossible because Groq has no image-output model, and keeping Gemini was rejected due unavailable quota.
