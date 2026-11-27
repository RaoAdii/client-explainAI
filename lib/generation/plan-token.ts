import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { infographicPlanSchema, type InfographicPlan } from "./groq";

const TOKEN_TTL_MS = 10 * 60 * 1000;

const claimsSchema = z.object({
  projectId: z.string().uuid(),
  userId: z.string().uuid(),
  runId: z.string().uuid(),
  fingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  attempts: z.number().int().min(1).max(2),
  expiresAt: z.number().int(),
  plan: infographicPlanSchema,
});

export type PlanTokenClaims = z.infer<typeof claimsSchema>;
type PlanTokenInput = Omit<PlanTokenClaims, "expiresAt">;

export function getPlanTokenSecret(): string {
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("Supabase server credentials are not configured.");
  return secret;
}

export function createPlanToken(input: PlanTokenInput, secret: string, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ ...input, expiresAt: now + TOKEN_TTL_MS })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyPlanToken(token: string, secret: string, now = Date.now()): PlanTokenClaims | null {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra !== undefined) return null;

  const expected = createHmac("sha256", secret).update(payload).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  try {
    const parsed: unknown = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    const result = claimsSchema.safeParse(parsed);
    if (!result.success || result.data.expiresAt <= now) return null;
    return result.data;
  } catch {
    return null;
  }
}
