import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AlertTriangle, ChevronLeft, Download, Edit3, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { projectFromRow } from "@/lib/projects/data";
import { fingerprintProject } from "@/lib/projects/utils";
import { StatusBadge } from "@/components/projects/status-badge";
import { GenerateButton } from "@/components/projects/generate-button";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("*").eq("id", id).single();
  if (!data) notFound();
  const project = projectFromRow(data);
  const stale = Boolean(project.imagePath && project.imageInputFingerprint !== await fingerprintProject(project));
  const { data: latestRun } = await supabase.from("generation_runs").select("status,error_message,created_at").eq("project_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle();

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ChevronLeft className="size-4" /> Back to projects</Link>
      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-3"><StatusBadge status={project.workflowStatus} />{stale ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">Outdated visual</span> : null}</div><h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{project.name}</h1><p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="size-4" />{project.jurisdiction} · {project.legalArea}</p></div><Link href={`/projects/${id}/edit`} className="button-secondary"><Edit3 className="size-4" /> Edit project</Link></div>

      <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
          <div className="border-b border-stone-100 pb-5"><h2 className="font-semibold text-slate-900">Client infographic</h2><p className="mt-1 text-sm text-slate-500">English · Quality checked automatically</p></div>
          <GenerateButton projectId={id} hasImage={Boolean(project.imagePath)} />
          {latestRun?.status === "failed" ? <div className="mt-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertTriangle className="size-5 shrink-0" /><p>{latestRun.error_message || "The latest generation could not be completed. Your previous accepted image is unchanged."}</p></div> : null}
          {stale ? <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle className="size-5 shrink-0" /><p>The project details changed after this visual was created. Regenerate it before use.</p></div> : null}
          {project.imagePath ? <div className="mt-6"><div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50"><Image src={`/api/projects/${id}/image?v=${encodeURIComponent(project.imageGeneratedAt ?? "current")}`} alt={project.imageAltText || `Generated infographic for ${project.name}`} width={1600} height={2000} className="h-auto w-full" unoptimized /></div><div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-slate-500">AI-generated draft—verify with a qualified legal professional.</p><a className="button-secondary" href={`/api/projects/${id}/image?download=1&v=${encodeURIComponent(project.imageGeneratedAt ?? "current")}`}><Download className="size-4" /> Download PNG</a></div></div> : <div className="grid min-h-[280px] place-items-center py-12 text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#edf2f2] text-2xl">§</span><h3 className="mt-5 font-semibold text-slate-900">No visual yet</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Review the project explanation, complete process flow, and legal terms above before creating the infographic.</p></div></div>}
        </section>

        <aside className="space-y-5"><div className="rounded-2xl border border-stone-200 bg-white p-6"><h2 className="font-semibold text-slate-900">Project brief</h2><dl className="mt-5 space-y-4 text-sm"><Detail label="Audience" value={project.targetAudience} /><Detail label="Complexity" value={project.complexity} /><Detail label="Language" value={project.language} /></dl><div className="mt-5 border-t border-stone-100 pt-5"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{project.description}</p></div></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Before sharing</strong><p className="mt-1">Check every stage against the procedure that applies to the client. This visual is not legal advice.</p></div></aside>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-1 text-slate-700">{value}</dd></div>; }
