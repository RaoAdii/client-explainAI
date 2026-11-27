import type { ProjectInput } from "@/lib/projects/schema";
import { explanationPlanSchema, type ExplanationPlan, type PlanProvider } from "./gemini";

export class InvalidExplanationPlanError extends Error {
  constructor() {
    super("Gemini did not return a valid process explanation after two attempts.");
    this.name = "InvalidExplanationPlanError";
  }
}

export async function generatePlanWithRetry(
  project: ProjectInput,
  provider: PlanProvider,
): Promise<{ plan: ExplanationPlan; attempts: number }> {
  let correction: string | undefined;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const candidate = await provider.generatePlan(project, correction);
    const parsed = explanationPlanSchema.safeParse(candidate);
    if (parsed.success) return { plan: parsed.data, attempts: attempt };
    correction = "Return every required field, including 4 to 6 complete steps and 2 to 5 legal terms. Keep all text within the schema length limits.";
  }
  throw new InvalidExplanationPlanError();
}
