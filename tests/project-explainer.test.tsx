// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectExplainer } from "@/components/projects/project-explainer";
import { examplePlan } from "./fixtures/infographic";

describe("ProjectExplainer", () => {
  it("shows a clear explanation without requesting an image", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ plan: examplePlan }),
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<ProjectExplainer projectId="project-123" />);

    fireEvent.click(screen.getByRole("button", { name: "Explain this project" }));

    expect(await screen.findByText(examplePlan.projectSummary)).toBeTruthy();
    expect(screen.getByText("The process, step by step")).toBeTruthy();
    expect(screen.getByText("Legal terms explained")).toBeTruthy();
    expect(screen.getByText(examplePlan.steps[0].title)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toBe("/api/projects/project-123/plan");
  });
});
