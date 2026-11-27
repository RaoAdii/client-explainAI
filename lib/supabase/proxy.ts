import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { copyAuthResponseState } from "./response";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  const path = request.nextUrl.pathname;
  const protectedPath = path.startsWith("/dashboard") || path.startsWith("/projects");
  const authPath = path.startsWith("/sign-in") || path.startsWith("/sign-up");

  if (!user && protectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", path);
    return copyAuthResponseState(response, NextResponse.redirect(url));
  }
  if (user && authPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return copyAuthResponseState(response, NextResponse.redirect(url));
  }
  return response;
}
