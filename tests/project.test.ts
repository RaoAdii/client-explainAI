import { describe, expect, it } from "vitest";
import { projectSchema } from "@/lib/projects/schema";

const validProject = {
  name: "Tenant eviction overview",
  jurisdiction: "Delhi, India",
  legalArea: "Civil litigation",
  language: "English",
  targetAudience: "Residential tenant",
  complexity: "",
  workflowStatus: "draft",
  description: "Explain the usual stages from notice through a court hearing and possible resolution.",
} as const;

describe("projectSchema", () => {
  it("normalizes blank complexity to Unspecified", () => {
    expect(projectSchema.parse(validProject).complexity).toBe("Unspecified");
  });

  it("locks the output language to English", () => {
    expect(() => projectSchema.parse({ ...validProject, language: "Hindi" })).toThrow();
  });

  it("rejects descriptions shorter than twenty characters", () => {
    expect(() => projectSchema.parse({ ...validProject, description: "Too short" })).toThrow();
  });
});
