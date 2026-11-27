// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GenerateButton } from "@/components/projects/generate-button";
import { examplePlan } from "./fixtures/infographic";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

describe("GenerateButton", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("shows the reviewed explanation before generating from the same plan", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ plan: examplePlan, token: "signed-plan-token" }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ status: "ready" }) });
    vi.stubGlobal("fetch", fetchMock);
    render(<GenerateButton projectId="project-123" hasImage={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Prepare explanation" }));
    expect(await screen.findByText(examplePlan.projectSummary)).toBeTruthy();
    expect(screen.getByText("Key legal terms, in plain language")).toBeTruthy();
    expect(screen.getByText(examplePlan.steps[0].title)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Generate infographic" }));
    await waitFor(() => expect(refresh).toHaveBeenCalledOnce());
    expect(fetchMock.mock.calls[0][0]).toBe("/api/projects/project-123/plan");
    expect(fetchMock.mock.calls[1][0]).toBe("/api/projects/project-123/generate");
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      body: JSON.stringify({ token: "signed-plan-token" }),
    });
    expect(screen.getByText("Infographic generated from this reviewed flow.")).toBeTruthy();
  });
});
