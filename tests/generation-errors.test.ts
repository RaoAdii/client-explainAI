import { describe, expect, it } from "vitest";
import { generationFailure } from "@/lib/generation/errors";
import { InvalidInfographicPlanError } from "@/lib/generation/plan-pipeline";

describe("generationFailure", () => {
  it("reports Groq quota exhaustion as a quota issue", () => {
    const error = Object.assign(new Error("RESOURCE_EXHAUSTED: quota exceeded; free tier limit: 0"), { status: 429 });
    expect(generationFailure(error)).toEqual({
      status: 429,
      message: "Groq quota is exhausted. Check the Groq project limits or billing, then try again.",
    });
  });

  it("reports model access and API-key failures without exposing provider details", () => {
    expect(generationFailure(Object.assign(new Error("model not found"), { status: 404 })).status).toBe(422);
    expect(generationFailure(Object.assign(new Error("invalid api key"), { status: 401 })).status).toBe(503);
  });

  it("keeps invalid structured plans distinct", () => {
    expect(generationFailure(new InvalidInfographicPlanError())).toEqual({
      status: 422,
      message: "Groq could not produce a valid 4–6 step infographic plan after two attempts. Refine the project description and try again.",
    });
  });
});
