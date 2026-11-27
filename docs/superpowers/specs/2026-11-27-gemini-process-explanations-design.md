# Gemini process explanations design

ClientExplain AI provides text-only explanations of legal processes. Gemini `gemini-3.8-flash` supplies a constrained English explanation, and the project page presents it as a plain-language overview, an ordered process flow, and definitions of key legal terms.

Each explanation contains a title, subtitle, project summary, 4–6 ordered steps, 2–5 plain-language legal terms, a local-procedure caveat, and accessible alt text. User content is delimited as untrusted data; exact deadlines, citations, fees, contacts, guarantees, and case-specific advice are prohibited. Zod rejects malformed output, and one corrective Gemini retry is allowed.

Explanation requests are authenticated and rate-limited independently of legacy image-generation records. No image is generated, stored, previewed, or downloaded. The explanation is general information, not legal advice.
