"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { message?: string };

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { message: "Enter your email and password." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { message: "We could not sign you in. Check your details and try again." };
  redirect("/dashboard");
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || password.length < 8) return { message: "Use a valid email and a password of at least 8 characters." };
  const origin = (await headers()).get("origin") || "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${origin}/auth/confirm?next=/dashboard` } });
  if (error) return { message: error.message };
  return { message: "Check your email to confirm your account, then sign in." };
}

export async function requestPasswordReset(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "").trim();
  if (!email) return { message: "Enter your email address." };
  const origin = (await headers()).get("origin") || "http://localhost:3000";
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/confirm?next=/reset-password` });
  return { message: "If an account exists, a password reset link is on its way." };
}

export async function updatePassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password") || "");
  if (password.length < 8) return { message: "Use at least 8 characters." };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { message: error.message };
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
