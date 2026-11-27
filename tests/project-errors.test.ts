import { describe, expect, it } from "vitest";
import { projectMutationMessage } from "@/lib/projects/errors";

describe("projectMutationMessage", () => {
  it("explains when the Supabase schema has not been installed", () => {
    expect(projectMutationMessage({ code: "PGRST205", message: "Could not find the table public.projects" })).toContain("database setup is incomplete");
  });

  it("explains database permission failures", () => {
    expect(projectMutationMessage({ code: "42501", message: "permission denied" })).toContain("permissions are not configured");
  });

  it("does not expose unknown provider details", () => {
    expect(projectMutationMessage({ code: "XX000", message: "secret internal details" })).toBe("The project could not be saved. Please try again.");
  });
});
