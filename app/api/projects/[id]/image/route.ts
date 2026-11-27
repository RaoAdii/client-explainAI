import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeDownloadName } from "@/lib/projects/utils";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: project } = await supabase.from("projects").select("name,image_path").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!project?.image_path) return NextResponse.json({ error: "Image not found" }, { status: 404 });
  const { data, error } = await supabase.storage.from("legal-visuals").download(project.image_path);
  if (error || !data) return NextResponse.json({ error: "Image not found" }, { status: 404 });
  const download = new URL(request.url).searchParams.get("download") === "1";
  return new Response(data, { headers: { "Content-Type": "image/png", "Cache-Control": "private, no-store", "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${safeDownloadName(project.name)}"` } });
}
