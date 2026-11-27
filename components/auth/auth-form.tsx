"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/app/(auth)/actions";

export function AuthForm({ title, copy, action, mode }: { title: string; copy: string; action: (state: AuthState, data: FormData) => Promise<AuthState>; mode: "sign-in" | "sign-up" | "forgot" | "reset" }) {
  const [state, formAction, pending] = useActionState(action, {});
  const needsEmail = mode !== "reset";
  const needsPassword = mode === "sign-in" || mode === "sign-up" || mode === "reset";
  const button = mode === "sign-in" ? "Sign in" : mode === "sign-up" ? "Create account" : mode === "forgot" ? "Send reset link" : "Set new password";

  return (
    <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-7 shadow-[0_20px_60px_rgba(28,37,41,.07)] sm:p-9">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
      <form action={formAction} className="mt-8 space-y-5">
        {needsEmail ? <div className="space-y-2"><label htmlFor="email" className="field-label">Email address</label><input id="email" name="email" type="email" autoComplete="email" required className="field" placeholder="you@example.com" /></div> : null}
        {needsPassword ? <div className="space-y-2"><label htmlFor="password" className="field-label">{mode === "reset" ? "New password" : "Password"}</label><input id="password" name="password" type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} minLength={8} required className="field" /><p className="field-help">At least 8 characters</p></div> : null}
        {state.message ? <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-5 text-amber-900" role="status">{state.message}</p> : null}
        <button className="button-primary w-full" disabled={pending}>{pending ? "Please wait…" : button}</button>
      </form>
      <div className="mt-6 space-y-2 text-center text-sm text-slate-600">
        {mode === "sign-in" ? <><Link className="block text-[#315d6a] hover:underline" href="/forgot-password">Forgot your password?</Link><p>New here? <Link className="font-semibold text-[#315d6a] hover:underline" href="/sign-up">Create an account</Link></p></> : null}
        {mode === "sign-up" ? <p>Already have an account? <Link className="font-semibold text-[#315d6a] hover:underline" href="/sign-in">Sign in</Link></p> : null}
        {mode === "forgot" ? <Link className="font-semibold text-[#315d6a] hover:underline" href="/sign-in">Back to sign in</Link> : null}
      </div>
    </div>
  );
}
