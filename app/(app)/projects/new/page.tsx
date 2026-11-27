import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProjectForm } from "@/components/projects/project-form";
import { createProject } from "../../actions";

export const metadata = { title: "New project" };
export default function NewProjectPage() {
  return <main className="mx-auto max-w-4xl px-5 py-10 lg:px-8"><Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"><ChevronLeft className="size-4" /> Back to projects</Link><div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 sm:p-9"><p className="eyebrow">New project</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Describe the legal process</h1><p className="mt-2 text-sm leading-6 text-slate-600">Give the generator enough context to make a useful high-level visual. Avoid names and confidential case facts.</p><div className="mt-9"><ProjectForm action={createProject} submitLabel="Create project" /></div></div></main>;
}
