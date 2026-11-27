import { describe, expect, it } from "vitest";
import { NextResponse } from "next/server";
import { copyAuthResponseState } from "@/lib/supabase/response";

describe("copyAuthResponseState", () => {
  it("copies refreshed cookies and no-store headers onto redirects", () => {
    const source = NextResponse.next();
    source.cookies.set("sb-session", "secret", { httpOnly: true });
    source.headers.set("Cache-Control", "private, no-store");
    source.headers.set("Pragma", "no-cache");
    const target = NextResponse.redirect("https://example.com/sign-in");

    copyAuthResponseState(source, target);

    expect(target.cookies.get("sb-session")?.value).toBe("secret");
    expect(target.headers.get("Cache-Control")).toBe("private, no-store");
    expect(target.headers.get("Pragma")).toBe("no-cache");
  });
});
