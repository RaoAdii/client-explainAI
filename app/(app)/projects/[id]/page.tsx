import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Edit3, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { projectFromRow } from "@/lib/projects/data";
import { StatusBadge } from "@/components/projects/status-badge";
import { ProjectExplainer } from "@/components/projects/project-explainer";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("*").eq("id", id).single();
  if (!data) notFound();
  const project = projectFromRow(data);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ChevronLeft className="size-4" /> Back to projects</Link>
      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-3"><StatusBadge status={project.workflowStatus} /></div><h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{project.name}</h1><p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500"><MapPin className="size-4" />{project.jurisdiction} · {project.legalArea}</p></div><Link href={`/projects/${id}/edit`} className="button-secondary"><Edit3 className="size-4" /> Edit project</Link></div>

      <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
          <div className="border-b border-stone-100 pb-5"><h2 className="font-semibold text-slate-900">Project explanation</h2><p className="mt-1 text-sm text-slate-500">Plain-language details, organized into clear steps.</p></div>
          <ProjectExplainer projectId={id} />
        </section>

        <aside className="space-y-5"><div className="rounded-2xl border border-stone-200 bg-white p-6"><h2 className="font-semibold text-slate-900">Project brief</h2><dl className="mt-5 space-y-4 text-sm"><Detail label="Audience" value={project.targetAudience} /><Detail label="Complexity" value={project.complexity} /><Detail label="Language" value={project.language} /></dl><div className="mt-5 border-t border-stone-100 pt-5"><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{project.description}</p></div></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>For general understanding</strong><p className="mt-1">Legal procedures differ by location and situation. Confirm important details with a qualified legal professional.</p></div></aside>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-1 text-slate-700">{value}</dd></div>; }
