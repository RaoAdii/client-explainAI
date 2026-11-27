# Groq-rendered Infographics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Gemini image generation with Groq-authored structured content rendered deterministically to private PNG infographics.

**Architecture:** Groq returns a schema-validated `InfographicPlan`; the app retries invalid output once, renders escaped SVG, converts it with Sharp, and reuses the existing Supabase acceptance flow.

**Tech Stack:** Next.js, TypeScript, Groq SDK, Zod, Sharp, Supabase

**Spec:** `docs/superpowers/specs/2026-11-27-groq-rendered-infographics-design.md`

## Global Constraints

- English only; 1200×1500 PNG; 4–6 process steps.
- Warm white, charcoal, muted navy, and amber; no gradients or purple.
- The application, never Groq, owns markup, styling, and the exact disclaimer.
- Treat project and model text as untrusted; escape before SVG insertion.

## Review Focus

- XML/markup characters in model output must render as text, never markup.
- Excessively long labels must fit the fixed canvas without clipping.
- Invalid JSON/schema output gets exactly one corrective retry.
- Provider quota, auth, and network failures remain actionable.
- Generated PNGs continue through immutable private Storage paths.

---

### Task 1: Structured content and renderer

- [ ] Write failing tests for plan validation, prompt isolation, retry behavior, SVG escaping, wrapping, palette, dimensions, and PNG output.
- [ ] Implement Groq plan schema/client and deterministic SVG/PNG renderer.
- [ ] Run focused tests and confirm they pass.

### Task 2: Route and product integration

- [ ] Replace the Gemini pipeline in the generation route and update provider error mapping.
- [ ] Replace Gemini copy, dependencies, and environment documentation with Groq.
- [ ] Run the full verification suite and production build.
