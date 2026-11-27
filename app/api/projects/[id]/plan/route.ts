import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { projectFromRow } from "@/lib/projects/data";
import { createGroqPlanner } from "@/lib/generation/groq";
import { generatePlanWithRetry } from "@/lib/generation/plan-pipeline";
import { generationFailure } from "@/lib/generation/errors";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to get a project explanation." }, { status: 401 });

  const { data: row } = await supabase.from("projects").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!row) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const { error: reservationError } = await supabase.rpc("reserve_explanation", { p_project_id: id });
  if (reservationError) return reservationFailure(reservationError.message);

  try {
    const project = projectFromRow(row);
    const generated = await generatePlanWithRetry(project, createGroqPlanner());
    return NextResponse.json({ plan: generated.plan });
  } catch (cause) {
    const failure = generationFailure(cause);
    console.error("Project explanation generation failed", {
      projectId: id,
      status: cause instanceof Error && "status" in cause ? cause.status : undefined,
      name: cause instanceof Error ? cause.name : "UnknownError",
      message: cause instanceof Error ? cause.message : "Unknown generation failure",
    });
    return NextResponse.json({ error: failure.message }, { status: failure.status });
  }
}

function reservationFailure(message: string) {
  if (message.includes("explanation_rate_limited")) {
    return NextResponse.json({ error: "You’ve reached the limit of 10 explanations per hour. Please try again later." }, { status: 429 });
  }
  if (message.includes("explanation_project_not_found")) return NextResponse.json({ error: "Project not found." }, { status: 404 });
  if (message.includes("explanation_unauthorized")) return NextResponse.json({ error: "Sign in to get a project explanation." }, { status: 401 });
  console.error("Could not reserve a project explanation", { message });
  return NextResponse.json({ error: "The project explanation could not be started. Please try again." }, { status: 502 });
}
