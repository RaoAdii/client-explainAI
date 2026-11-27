import { describe, expect, it } from "vitest";
import { reservationUnavailable } from "@/lib/generation/reservation";

describe("reservationUnavailable", () => {
  it("allows explanation generation when the optional RPC migration is missing", () => {
    expect(reservationUnavailable({ code: "PGRST202", message: "Could not find the function public.reserve_explanation(p_project_id)" })).toBe(true);
    expect(reservationUnavailable({ code: "42883", message: "function reserve_explanation does not exist" })).toBe(true);
  });

  it("does not bypass real reservation failures", () => {
    expect(reservationUnavailable({ code: "P0001", message: "explanation_rate_limited" })).toBe(false);
    expect(reservationUnavailable({ code: "42501", message: "permission denied" })).toBe(false);
  });
});
