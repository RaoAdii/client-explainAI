import { describe, expect, it } from "vitest";
import { buildGeminiPrompt, explanationPlanSchema, GEMINI_SYSTEM_INSTRUCTION } from "@/lib/generation/gemini";
import { generatePlanWithRetry } from "@/lib/generation/plan-pipeline";
import type { ProjectInput } from "@/lib/projects/schema";
import { exampleExplanation, exampleProject } from "./fixtures/explanation";

describe("explanationPlanSchema", () => {
  it("accepts a concise four-to-six-step plan", () => {
    expect(explanationPlanSchema.parse(exampleExplanation).steps).toHaveLength(4);
  });

  it("rejects too few steps and overlong labels", () => {
    expect(() => explanationPlanSchema.parse({ ...exampleExplanation, steps: exampleExplanation.steps.slice(0, 3) })).toThrow();
    expect(() => explanationPlanSchema.parse({ ...exampleExplanation, steps: exampleExplanation.steps.map((step, index) => index ? step : { ...step, title: "x".repeat(56) }) })).toThrow();
    expect(() => explanationPlanSchema.parse({ ...exampleExplanation, keyTerms: exampleExplanation.keyTerms.slice(0, 1) })).toThrow();
  });
});

describe("buildGeminiPrompt", () => {
  it("keeps untrusted project content out of the system instruction", () => {
    const prompt = buildGeminiPrompt(exampleProject);
    expect(GEMINI_SYSTEM_INSTRUCTION).not.toContain(exampleProject.description);
    expect(prompt).toContain("BEGIN UNTRUSTED PROJECT DATA");
    expect(prompt).toContain(exampleProject.description);
    expect(GEMINI_SYSTEM_INSTRUCTION).toContain("Do not invent exact deadlines");
    expect(GEMINI_SYSTEM_INSTRUCTION).toContain("define 2 to 5 relevant legal terms");
  });
});

describe("generatePlanWithRetry", () => {
  it("retries one invalid plan and returns the valid correction", async () => {
    const corrections: Array<string | undefined> = [];
    const provider = {
      generatePlan: async (_project: ProjectInput, correction?: string) => {
        corrections.push(correction);
        return corrections.length === 1 ? { ...exampleExplanation, steps: [] } : exampleExplanation;
      },
    };
    const result = await generatePlanWithRetry(exampleProject, provider);
    expect(result.plan.steps).toHaveLength(4);
    expect(result.attempts).toBe(2);
    expect(corrections[1]).toContain("4 to 6");
  });

  it("fails after two invalid plans", async () => {
    await expect(generatePlanWithRetry(exampleProject, { generatePlan: async () => ({ steps: [] }) })).rejects.toThrow("valid process explanation");
  });
});
