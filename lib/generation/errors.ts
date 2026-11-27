import { InvalidExplanationPlanError } from "./plan-pipeline";

type ProviderError = Error & { status?: number; code?: string | number };

export type GenerationFailure = { status: number; message: string };

export function generationFailure(cause: unknown): GenerationFailure {
  if (cause instanceof InvalidExplanationPlanError) {
    return { status: 422, message: "Gemini could not produce a valid process explanation after two attempts. Refine the project description and try again." };
  }

  const error = cause instanceof Error ? cause as ProviderError : undefined;
  const text = `${error?.message ?? ""} ${error?.code ?? ""}`.toLowerCase();
  if (error?.status === 429 || /resource_exhausted|quota exceeded|rate limit/.test(text)) {
    return { status: 429, message: "Gemini API quota is exhausted. Check the Google AI Studio project limits or billing, then try again." };
  }
  if (error?.status === 404 || /model.+not found|not found.+model/.test(text)) {
    return { status: 422, message: "The configured Gemini model is unavailable to this API key. Check GEMINI_MODEL and try again." };
  }
  if ([400, 401, 403].includes(error?.status ?? 0) && /key|credential|permission|api/.test(text)) {
    return { status: 503, message: "Gemini rejected the server API credentials. Check GEMINI_API_KEY and its project permissions." };
  }
  if (/connect timeout|fetch failed|und_err_connect_timeout/.test(text)) {
    return { status: 504, message: "The server could not reach Gemini. Check the network connection and try again." };
  }
  if (/configured/.test(text)) {
    return { status: 503, message: "AI explanations are not configured on this server." };
  }
  return { status: 502, message: "Gemini could not complete the process explanation. Please try again." };
}
