// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectForm } from "@/components/projects/project-form";

describe("ProjectForm", () => {
  it("renders every project field with English locked", () => {
    render(<ProjectForm action={vi.fn()} submitLabel="Create project" />);

    for (const label of [
      "Project name",
      "Jurisdiction",
      "Legal area",
      "Language",
      "Target audience",
      "Complexity",
      "Workflow status",
      "Project description",
    ]) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }
    expect(screen.getByLabelText("Language")).toHaveValue("English");
    expect(screen.getByLabelText("Language")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Create project" })).toBeTruthy();
  });
});
