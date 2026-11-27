import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202611270001_initial_schema.sql", "utf8");
const quotaMigration = readFileSync("supabase/migrations/202611270002_increase_generation_limit.sql", "utf8");
const explanationMigration = readFileSync("supabase/migrations/202611270003_text_explanations.sql", "utf8");

describe("database generation security contract", () => {
  it("reserves quota atomically under a per-user database lock", () => {
    expect(migration).toContain("create or replace function public.reserve_generation");
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("generation_rate_limited");
    expect(migration).toContain("generation_in_progress");
  });

  it("raises the existing hourly generation cap without removing atomic reservation", () => {
    expect(quotaMigration).toContain("pg_advisory_xact_lock");
    expect(quotaMigration).toMatch(/created_at >= now\(\) - interval '1 hour'\) >= 10/);
  });

  it("rate-limits text explanations independently of image generation", () => {
    expect(explanationMigration).toContain("public.reserve_explanation");
    expect(explanationMigration).toContain("public.explanation_requests");
    expect(explanationMigration).toContain("pg_advisory_xact_lock");
    expect(explanationMigration).toMatch(/created_at >= now\(\) - interval '1 hour'\) >= 10/);
    expect(explanationMigration).toContain("grant execute on function public.reserve_explanation(uuid) to authenticated");
  });

  it("prevents browser clients from writing the generation ledger or accepted images", () => {
    expect(migration).toContain("revoke insert, update, delete on public.generation_runs from authenticated");
    expect(migration).toContain("grant execute on function public.complete_generation");
    expect(migration).toContain("to service_role");
    expect(migration).not.toContain('create policy "Users create own legal visuals"');
    expect(migration).not.toContain('create policy "Users update own legal visuals"');
  });

  it("limits direct project writes to form fields", () => {
    expect(migration).toContain("revoke insert, update on public.projects from authenticated");
    expect(migration).toContain("grant update (name, jurisdiction, legal_area, language, target_audience, complexity, workflow_status, description)");
  });

  it("finalizes the image pointer and run state in one database function", () => {
    expect(migration).toContain("create or replace function public.complete_generation");
    expect(migration).toContain("update public.projects");
    expect(migration).toContain("update public.generation_runs");
  });
});
