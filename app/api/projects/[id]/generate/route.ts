import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { projectFromRow } from "@/lib/projects/data";
import { fingerprintProject, generationImagePath } from "@/lib/projects/utils";
import { renderInfographicPng } from "@/lib/generation/renderer";
import { generationFailure } from "@/lib/generation/errors";
import { getPlanTokenSecret, verifyPlanToken } from "@/lib/generation/plan-token";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to generate a visual." }, { status: 401 });

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: "Image generation is not configured on this server." }, { status: 503 });
  }

  const { data: row } = await supabase.from("projects").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!row) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const body: unknown = await request.json().catch(() => null);
  const token = body && typeof body === "object" && "token" in body && typeof body.token === "string" ? body.token : "";
  if (!token) return NextResponse.json({ error: "Prepare and review the process explanation before generating an image." }, { status: 400 });

  let claims;
  try {
    claims = verifyPlanToken(token, getPlanTokenSecret());
  } catch {
    return NextResponse.json({ error: "Image generation is not configured on this server." }, { status: 503 });
  }
  if (!claims || claims.projectId !== id || claims.userId !== user.id) {
    return NextResponse.json({ error: "The reviewed explanation is invalid or expired. Prepare it again." }, { status: 409 });
  }

  let uploadedPath: string | null = null;

  try {
    const project = projectFromRow(row);
    const fingerprint = await fingerprintProject(project);
    if (claims.fingerprint !== fingerprint) {
      return NextResponse.json({ error: "Project details changed. Prepare and review a new explanation before generating." }, { status: 409 });
    }

    const { data: run } = await admin.from("generation_runs").select("id,status")
      .eq("id", claims.runId).eq("project_id", id).eq("user_id", user.id).maybeSingle();
    if (run?.status !== "generating") {
      return NextResponse.json({ error: "This explanation has already been used or expired. Prepare a new one to continue." }, { status: 409 });
    }

    const image = await renderInfographicPng(claims.plan, project);
    const path = generationImagePath(user.id, id, claims.runId);
    const { error: uploadError } = await admin.storage.from("legal-visuals").upload(path, image, { contentType: "image/png", upsert: false, cacheControl: "31536000" });
    if (uploadError) throw new Error("The accepted image could not be stored.");
    uploadedPath = path;

    const generatedAt = new Date().toISOString();
    const { error: finalizeError } = await admin.rpc("complete_generation", { p_run_id: claims.runId, p_image_path: path, p_alt_text: claims.plan.altText, p_fingerprint: fingerprint, p_attempt_count: claims.attempts });
    if (finalizeError) throw new Error("The generated image could not be attached to the project.");
    return NextResponse.json({ status: "ready", generatedAt });
  } catch (cause) {
    if (uploadedPath) await admin.storage.from("legal-visuals").remove([uploadedPath]);
    const failure = generationFailure(cause);
    console.error("Infographic generation failed", {
      projectId: id,
      status: cause instanceof Error && "status" in cause ? cause.status : undefined,
      name: cause instanceof Error ? cause.name : "UnknownError",
      message: cause instanceof Error ? cause.message : "Unknown generation failure",
    });
    await admin.rpc("fail_generation", { p_run_id: claims.runId, p_error_message: failure.message, p_quality_issues: [], p_attempt_count: claims.attempts });
    return NextResponse.json({ error: failure.message }, { status: failure.status });
  }
}

