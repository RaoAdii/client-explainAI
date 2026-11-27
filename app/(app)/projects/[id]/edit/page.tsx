import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProjectForm } from "@/components/projects/project-form";
import { createClient } from "@/lib/supabase/server";
import { projectFromRow } from "@/lib/projects/data";
import { updateProject } from "../../../actions";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("*").eq("id", id).single();
  if (!data) notFound();
  const project = projectFromRow(data);
  const action = updateProject.bind(null, id);
  return <main className="mx-auto max-w-4xl px-5 py-10 lg:px-8"><Link href={`/projects/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ChevronLeft className="size-4" /> Back to project</Link><div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 sm:p-9"><p className="eyebrow">Edit project</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Update the project brief</h1><p className="mt-2 text-sm text-slate-600">Changes to the process details will mark an existing visual as outdated.</p><div className="mt-9"><ProjectForm action={action} initial={project} submitLabel="Save changes" /></div></div></main>;
}
