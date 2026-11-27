import { describe, expect, it, vi } from "vitest";
import { geminiModelCandidates, withGeminiModelFallback } from "@/lib/generation/gemini";

describe("Gemini model fallback", () => {
  it("uses the fallback model when the primary model is temporarily unavailable", async () => {
    const generate = vi.fn(async (model: string) => {
      if (model === "gemini-3.8-flash") {
        throw Object.assign(new Error("The model is currently experiencing high demand"), {
          status: 503,
        });
      }
      return { status: "ok" };
    });

    await expect(
      withGeminiModelFallback(
        ["gemini-3.8-flash", "gemini-3.5-flash-lite"],
        generate,
      ),
    ).resolves.toEqual({ status: "ok" });
    expect(generate.mock.calls.map(([model]) => model)).toEqual([
      "gemini-3.8-flash",
      "gemini-3.5-flash-lite",
    ]);
  });

  it("does not hide authentication errors by trying another model", async () => {
    const generate = vi.fn(async () => {
      throw Object.assign(new Error("Invalid API key"), { status: 401 });
    });

    await expect(
      withGeminiModelFallback(
        ["gemini-3.8-flash", "gemini-3.5-flash-lite"],
        generate,
      ),
    ).rejects.toThrow("Invalid API key");
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("keeps configured model candidates unique", () => {
    expect(
      geminiModelCandidates("gemini-3.5-flash-lite", "gemini-3.5-flash-lite"),
    ).toEqual(["gemini-3.5-flash-lite"]);
  });
});
