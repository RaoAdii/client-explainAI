import Link from "next/link";
import { ArrowRight, FileText, Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { projectFromRow } from "@/lib/projects/data";
import { StatusBadge } from "@/components/projects/status-badge";
import { workflowStatuses, type WorkflowStatus } from "@/lib/projects/schema";

export const metadata = { title: "Projects" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("projects").select("*").order("updated_at", { ascending: false });
  if (workflowStatuses.includes(params.status as WorkflowStatus)) query = query.eq("workflow_status", params.status!);
  if (params.q?.trim()) query = query.ilike("name", `%${params.q.trim().replace(/[%_]/g, "")}%`);
  const { data } = await query;
  const projects = (data ?? []).map(projectFromRow);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow">Workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Your projects</h1><p className="mt-2 text-sm text-slate-600">Create and manage clear, step-by-step legal-process explanations.</p></div>
        <Link href="/projects/new" className="button-primary"><Plus className="size-4" /> New project</Link>
      </div>

      <div className="mt-9 flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Project status">
          {[['', 'All'], ['draft', 'Draft'], ['active', 'Active'], ['archived', 'Archived']].map(([value, label]) => <Link key={value} href={value ? `/dashboard?status=${value}` : "/dashboard"} className={`rounded-lg px-3 py-2 text-sm font-medium ${(params.status ?? '') === value ? "bg-[#edf2f2] text-[#234955]" : "text-slate-500 hover:bg-stone-50"}`}>{label}</Link>)}
        </nav>
        <form className="relative" action="/dashboard"><Search className="absolute left-3 top-2.5 size-4 text-slate-400" /><input name="q" defaultValue={params.q} className="field h-9 pl-9 text-sm sm:w-64" placeholder="Search projects" />{params.status ? <input type="hidden" name="status" value={params.status} /> : null}</form>
      </div>

      {projects.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="group rounded-2xl border border-stone-200 bg-white p-6 transition hover:border-stone-300 hover:shadow-[0_18px_45px_rgba(28,37,41,.07)]">
              <div className="flex items-start justify-between gap-4"><span className="grid size-10 place-items-center rounded-xl bg-[#edf2f2] text-[#315d6a]"><FileText className="size-5" /></span><StatusBadge status={project.workflowStatus} /></div>
              <h2 className="mt-5 font-semibold text-slate-900 group-hover:text-[#315d6a]">{project.name}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{project.description}</p>
              <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4 text-xs text-slate-500"><span>{project.jurisdiction}</span><ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center"><FileText className="mx-auto size-8 text-stone-400" /><h2 className="mt-4 font-semibold text-slate-900">No projects found</h2><p className="mt-2 text-sm text-slate-500">Start with a legal process your audience needs explained.</p><Link href="/projects/new" className="button-primary mt-6">Create a project</Link></div>
      )}
    </main>
  );
}
