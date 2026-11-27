import Link from "next/link";
import { ArrowRight, Check, FileText, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-stone-200/90 bg-[#f8f7f3]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Brand />
          <nav className="flex items-center gap-3" aria-label="Account">
            <Link href="/sign-in" className="button-secondary">Sign in</Link>
            <Link href="/sign-up" className="button-primary">Get started <ArrowRight className="size-4" /></Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28">
        <div className="flex flex-col justify-center">
          <p className="eyebrow">Legal processes, made understandable</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[1.06] tracking-[-.04em] text-slate-900 sm:text-6xl">
            Explain the process.<br />Not the legal jargon.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
            Turn a legal process description into a clear, client-friendly explanation with ordered steps and plain-language definitions of legal terms.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/sign-up" className="button-primary px-5">Create your first explanation <ArrowRight className="size-4" /></Link>
            <a href="#how-it-works" className="button-secondary px-5">How it works</a>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-slate-500"><ShieldCheck className="size-4 text-[#315d6a]" /> Private projects. No confidential case details required.</p>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-[0_30px_80px_rgba(28,37,41,.10)] sm:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-stone-100 pb-5">
            <div><p className="text-xs font-semibold uppercase tracking-widest text-amber-700">Example explanation</p><h2 className="mt-1 font-semibold text-slate-900">A civil claim, step by step</h2></div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">Plain language</span>
          </div>
          <div className="space-y-3">
            {[
              ["01", "Understand the claim", "Review the issue, parties, and desired outcome."],
              ["02", "Pre-action steps", "Exchange key information and explore resolution."],
              ["03", "File and respond", "Submit the claim and receive the formal response."],
              ["04", "Prepare the case", "Organize evidence and follow court directions."],
              ["05", "Resolve or attend hearing", "Settle where possible or proceed to a decision."],
            ].map(([number, title, copy]) => (
              <div key={number} className="flex gap-4 rounded-xl border border-stone-200 p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#edf2f2] text-sm font-bold text-[#234955]">{number}</span>
                <div><p className="text-sm font-semibold text-slate-800">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{copy}</p></div>
              </div>
            ))}
          </div>
          <p className="mt-5 border-t border-stone-100 pt-4 text-[11px] leading-4 text-slate-400">General information only—not legal advice.</p>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-stone-200 bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="eyebrow">A focused workflow</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">From project brief to clear explanation</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              [FileText, "Describe", "Add the jurisdiction, legal area, audience, and the process clients need to understand."],
              [FileText, "Explain", "Groq creates a plain-language overview, ordered process steps, and definitions of key legal terms."],
              [Check, "Understand", "Read the explanation and confirm local requirements with a qualified legal professional."],
            ].map(([Icon, title, copy], index) => {
              const StepIcon = Icon as typeof FileText;
              return <article key={String(title)} className="rounded-2xl border border-stone-200 p-7"><span className="text-xs font-semibold text-amber-700">0{index + 1}</span><StepIcon className="mt-6 size-6 text-[#315d6a]" /><h3 className="mt-4 font-semibold text-slate-900">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{String(copy)}</p></article>;
            })}
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <Brand /><p>General legal information only. Not legal advice.</p>
      </footer>
    </main>
  );
}
