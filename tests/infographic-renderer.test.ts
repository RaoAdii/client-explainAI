import { describe, expect, it } from "vitest";
import { renderInfographicPng, renderInfographicSvg } from "@/lib/generation/renderer";
import { examplePlan, exampleProject } from "./fixtures/infographic";

describe("renderInfographicSvg", () => {
  it("renders the fixed canvas, palette, process steps, and disclaimer", () => {
    const svg = renderInfographicSvg(examplePlan, exampleProject);
    expect(svg).toContain('width="1200" height="1500"');
    expect(svg).toContain("#183640");
    expect(svg).toContain("#C27A24");
    expect(svg).not.toMatch(/<linearGradient|<radialGradient|purple/i);
    expect(svg).toContain("AI-generated draft—verify with a qualified legal professional");
    expect(svg).toContain("Receive notice");
  });

  it("escapes model and project text before inserting it into SVG", () => {
    const svg = renderInfographicSvg({ ...examplePlan, title: "Claim & <script>alert(1)</script>" }, { ...exampleProject, jurisdiction: "Court <unsafe>" });
    expect(svg).toContain("Claim &amp; &lt;script&gt;");
    expect(svg).toContain("Court &lt;unsafe&gt;");
    expect(svg).not.toContain("<script>");
  });
});

describe("renderInfographicPng", () => {
  it("converts the SVG to a valid portrait PNG", async () => {
    const png = await renderInfographicPng(examplePlan, exampleProject);
    expect([...png.subarray(0, 8)]).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(png.length).toBeGreaterThan(10_000);
  });
});
