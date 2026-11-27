import { describe, expect, it } from "vitest";
import { projectSchema } from "@/lib/projects/schema";
import { fingerprintProject, generationImagePath, safeDownloadName } from "@/lib/projects/utils";

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

describe("project utilities", () => {
  it("changes the fingerprint only when generation inputs change", async () => {
    const parsed = projectSchema.parse(validProject);
    const original = await fingerprintProject(parsed);
    expect(await fingerprintProject({ ...parsed, workflowStatus: "archived" })).toBe(original);
    expect(await fingerprintProject({ ...parsed, jurisdiction: "Mumbai, India" })).not.toBe(original);
  });

  it("creates a safe PNG filename", () => {
    expect(safeDownloadName(" Client / Matter: 2026 ")).toBe("client-matter-2026.png");
  });

  it("uses immutable per-run image paths", () => {
    expect(generationImagePath("user-1", "project-2", "run-3")).toBe("user-1/project-2/run-3.png");
  });
});
