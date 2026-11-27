import { NextResponse } from "next/server";

const AUTH_CACHE_HEADERS = ["cache-control", "expires", "pragma"] as const;

export function copyAuthResponseState(source: NextResponse, target: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  AUTH_CACHE_HEADERS.forEach((name) => {
    const value = source.headers.get(name);
    if (value) target.headers.set(name, value);
  });
  return target;
}
