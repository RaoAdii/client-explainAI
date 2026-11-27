import { describe, expect, it } from "vitest";
import { generationFailure } from "@/lib/generation/errors";
import { InvalidExplanationPlanError } from "@/lib/generation/plan-pipeline";

describe("explanationFailure", () => {
  it("reports Gemini quota exhaustion as a quota issue", () => {
    const error = Object.assign(new Error("RESOURCE_EXHAUSTED: quota exceeded; free tier limit: 0"), { status: 429 });
    expect(generationFailure(error)).toEqual({
      status: 429,
      message: "Gemini API quota is exhausted. Check the Google AI Studio project limits or billing, then try again.",
    });
  });

  it("reports model access and API-key failures without exposing provider details", () => {
    expect(generationFailure(Object.assign(new Error("model not found"), { status: 404 })).status).toBe(422);
    expect(generationFailure(Object.assign(new Error("invalid api key"), { status: 401 })).status).toBe(503);
  });

  it("keeps invalid structured plans distinct", () => {
    expect(generationFailure(new InvalidExplanationPlanError())).toEqual({
      status: 422,
      message: "Gemini could not produce a valid process explanation after two attempts. Refine the project description and try again.",
    });
  });
});
