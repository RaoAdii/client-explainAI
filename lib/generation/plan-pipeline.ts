import type { ProjectInput } from "@/lib/projects/schema";
import { infographicPlanSchema, type InfographicPlan, type PlanProvider } from "./groq";

export class InvalidInfographicPlanError extends Error {
  constructor() {
    super("Groq did not return a valid infographic plan after two attempts.");
    this.name = "InvalidInfographicPlanError";
  }
}

export async function generatePlanWithRetry(
  project: ProjectInput,
  provider: PlanProvider,
): Promise<{ plan: InfographicPlan; attempts: number }> {
  let correction: string | undefined;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const candidate = await provider.generatePlan(project, correction);
    const parsed = infographicPlanSchema.safeParse(candidate);
    if (parsed.success) return { plan: parsed.data, attempts: attempt };
    correction = "Return every required field, including 4 to 6 complete steps and 2 to 5 legal terms. Keep all text within the schema length limits.";
  }
  throw new InvalidInfographicPlanError();
}
