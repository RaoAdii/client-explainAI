import { describe, expect, it } from "vitest";
import { buildGroqMessages, infographicPlanSchema } from "@/lib/generation/groq";
import { generatePlanWithRetry } from "@/lib/generation/plan-pipeline";
import type { ProjectInput } from "@/lib/projects/schema";
import { examplePlan, exampleProject } from "./fixtures/infographic";

describe("infographicPlanSchema", () => {
  it("accepts a concise four-to-six-step plan", () => {
    expect(infographicPlanSchema.parse(examplePlan).steps).toHaveLength(4);
  });

  it("rejects too few steps and overlong labels", () => {
    expect(() => infographicPlanSchema.parse({ ...examplePlan, steps: examplePlan.steps.slice(0, 3) })).toThrow();
    expect(() => infographicPlanSchema.parse({ ...examplePlan, steps: examplePlan.steps.map((step, index) => index ? step : { ...step, title: "x".repeat(56) }) })).toThrow();
  });
});

describe("buildGroqMessages", () => {
  it("keeps untrusted project content out of the system instruction", () => {
    const messages = buildGroqMessages(exampleProject);
    expect(messages[0].content).not.toContain(exampleProject.description);
    expect(messages[1].content).toContain("BEGIN UNTRUSTED PROJECT DATA");
    expect(messages[1].content).toContain(exampleProject.description);
    expect(messages[0].content).toContain("Do not invent exact deadlines");
  });
});

describe("generatePlanWithRetry", () => {
  it("retries one invalid plan and returns the valid correction", async () => {
    const corrections: Array<string | undefined> = [];
    const provider = {
      generatePlan: async (_project: ProjectInput, correction?: string) => {
        corrections.push(correction);
        return corrections.length === 1 ? { ...examplePlan, steps: [] } : examplePlan;
      },
    };
    const result = await generatePlanWithRetry(exampleProject, provider);
    expect(result.plan.steps).toHaveLength(4);
    expect(result.attempts).toBe(2);
    expect(corrections[1]).toContain("4 to 6");
  });

  it("fails after two invalid plans", async () => {
    await expect(generatePlanWithRetry(exampleProject, { generatePlan: async () => ({ steps: [] }) })).rejects.toThrow("valid infographic plan");
  });
});
