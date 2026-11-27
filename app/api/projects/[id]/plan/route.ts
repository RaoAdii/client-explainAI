import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { projectFromRow } from "@/lib/projects/data";
import { fingerprintProject } from "@/lib/projects/utils";
import { createGroqPlanner } from "@/lib/generation/groq";
import { generatePlanWithRetry, InvalidInfographicPlanError } from "@/lib/generation/plan-pipeline";
import { generationFailure } from "@/lib/generation/errors";
import { createPlanToken, getPlanTokenSecret } from "@/lib/generation/plan-token";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to prepare a process explanation." }, { status: 401 });

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: "Image generation is not configured on this server." }, { status: 503 });
  }

  const { data: row } = await supabase.from("projects").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!row) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const { data: runId, error: reservationError } = await supabase.rpc("reserve_generation", { p_project_id: id });
  if (reservationError || !runId) return reservationFailure(reservationError?.message);

  try {
    const project = projectFromRow(row);
    const generated = await generatePlanWithRetry(project, createGroqPlanner());
    const fingerprint = await fingerprintProject(project);
    const token = createPlanToken({
      projectId: id,
      userId: user.id,
      runId: String(runId),
      fingerprint,
      attempts: generated.attempts,
      plan: generated.plan,
    }, getPlanTokenSecret());

    return NextResponse.json({ plan: generated.plan, token });
  } catch (cause) {
    const issues = cause instanceof InvalidInfographicPlanError ? ["Structured infographic plan validation failed."] : [];
    const failure = generationFailure(cause);
    console.error("Process explanation generation failed", {
      projectId: id,
      status: cause instanceof Error && "status" in cause ? cause.status : undefined,
      name: cause instanceof Error ? cause.name : "UnknownError",
      message: cause instanceof Error ? cause.message : "Unknown generation failure",
    });
    await admin.rpc("fail_generation", {
      p_run_id: runId,
      p_error_message: failure.message,
      p_quality_issues: issues,
      p_attempt_count: cause instanceof InvalidInfographicPlanError ? 2 : 0,
    });
    return NextResponse.json({ error: failure.message }, { status: failure.status });
  }
}

function reservationFailure(message?: string) {
  if (message?.includes("generation_in_progress")) return NextResponse.json({ error: "A visual is already being generated for this project." }, { status: 409 });
  if (message?.includes("generation_rate_limited")) return NextResponse.json({ error: "Generation limit reached. Try again after an hour." }, { status: 429 });
  if (message?.includes("generation_project_not_found")) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  return NextResponse.json({ error: "The generation could not be started." }, { status: 502 });
}
