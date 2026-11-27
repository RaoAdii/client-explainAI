import { describe, expect, it } from "vitest";
import { createPlanToken, verifyPlanToken } from "@/lib/generation/plan-token";
import { examplePlan } from "./fixtures/infographic";

const claims = {
  projectId: "80058510-82ff-4f6d-9dc3-1bd434c6ec3f",
  userId: "12345678-1234-4234-8234-123456789abc",
  runId: "87654321-4321-4321-8321-cba987654321",
  fingerprint: "a".repeat(64),
  attempts: 1,
  plan: examplePlan,
};

describe("reviewed plan token", () => {
  it("authenticates the plan and project context until expiry", () => {
    const token = createPlanToken(claims, "test-secret", 1_000);
    expect(verifyPlanToken(token, "test-secret", 1_001)).toMatchObject(claims);
    expect(verifyPlanToken(token, "test-secret", 601_000)).toBeNull();
    expect(verifyPlanToken(token, "wrong-secret", 1_001)).toBeNull();
  });

  it("rejects edited and malformed tokens", () => {
    const token = createPlanToken(claims, "test-secret", 1_000);
    const [payload, signature] = token.split(".");
    const editedPayload = `${payload.slice(0, -1)}${payload.endsWith("a") ? "b" : "a"}`;
    expect(verifyPlanToken(`${editedPayload}.${signature}`, "test-secret", 1_001)).toBeNull();
    expect(verifyPlanToken("not-a-token", "test-secret", 1_001)).toBeNull();
  });
});
