"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, FileText, RefreshCw, Sparkles } from "lucide-react";
import type { InfographicPlan } from "@/lib/generation/groq";

type Phase = "idle" | "preparing" | "review" | "generating" | "complete";
type PlanResponse = { plan: InfographicPlan; token: string };

export function GenerateButton({ projectId, hasImage }: { projectId: string; hasImage: boolean }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [plan, setPlan] = useState<InfographicPlan | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function prepareExplanation() {
    setPhase("preparing");
    setPlan(null);
    setToken("");
    setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}/plan`, { method: "POST" });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(readError(body) || "The explanation could not be prepared. Please try again.");
      if (!isPlanResponse(body)) throw new Error("The explanation response was incomplete. Please try again.");
      setPlan(body.plan);
      setToken(body.token);
      setPhase("review");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The explanation could not be prepared. Please try again.");
      setPhase("idle");
    }
  }

  async function generate() {
    if (!token) return;
    setPhase("generating");
    setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(readError(body) || "Generation failed. Please try again.");
      setToken("");
      setPhase("complete");
      router.refresh();
    } catch (cause) {
      setToken("");
      setError(cause instanceof Error ? cause.message : "Generation failed. Please try again.");
      setPhase("idle");
    }
  }

  return (
    <div className="mt-5 space-y-4">
      {phase === "idle" ? (
        <div className="rounded-xl border border-[#d9e2e1] bg-[#f5f8f7] p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
          <div>
            <h3 className="font-semibold text-slate-900">{plan ? "Review an updated explanation" : "Explain the process before creating an image"}</h3>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">First, get a plain-language project overview, ordered process steps, and key legal terms. Review them before generating the infographic.</p>
          </div>
          <button onClick={prepareExplanation} className="button-primary mt-3 shrink-0 sm:mt-0">
            <FileText className="size-4" /> {plan ? "Prepare a new explanation" : "Prepare explanation"}
          </button>
        </div>
      ) : null}

      {phase === "preparing" ? (
        <div className="flex items-center gap-3 rounded-xl border border-[#d9e2e1] bg-[#f5f8f7] p-4 text-sm text-slate-700" role="status">
          <RefreshCw className="size-4 animate-spin" /> Preparing the project overview, process steps, and legal terms…
        </div>
      ) : null}

      {error ? <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert"><AlertTriangle className="size-5 shrink-0" /><p>{error}</p></div> : null}

      {plan ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7" aria-labelledby="process-explanation-title">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf2f2] text-[#183640]"><FileText className="size-5" /></span>
            <div>
              <p className="eyebrow">Review before image generation</p>
              <h3 id="process-explanation-title" className="mt-1 text-xl font-semibold text-slate-900">{plan.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">{plan.subtitle}</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-[#f7f7f4] p-4">
            <h4 className="text-sm font-semibold text-slate-900">Project overview</h4>
            <p className="mt-2 text-sm leading-6 text-slate-700">{plan.projectSummary}</p>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-900">Completed process flow</h4>
            <ol className="mt-4 space-y-0">
              {plan.steps.map((step, index) => (
                <li key={`${step.title}-${index}`} className="relative flex gap-4 pb-5 last:pb-0">
                  {index < plan.steps.length - 1 ? <span className="absolute left-[17px] top-9 h-[calc(100%-1rem)] w-px bg-[#d7dfdc]" aria-hidden="true" /> : null}
                  <span className="z-10 grid size-9 shrink-0 place-items-center rounded-full bg-[#edf2f2] text-sm font-bold text-[#234955]">{index + 1}</span>
                  <div className="pt-1">
                    <h5 className="font-semibold text-slate-900">{step.title}</h5>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-6 border-t border-stone-100 pt-5">
            <h4 className="text-sm font-semibold text-slate-900">Key legal terms, in plain language</h4>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {plan.keyTerms.map((item, index) => (
                <div key={`${item.term}-${index}`} className="rounded-xl border border-stone-200 p-4">
                  <dt className="text-sm font-semibold text-[#183640]">{item.term}</dt>
                  <dd className="mt-1 text-sm leading-6 text-slate-600">{item.meaning}</dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Local procedure may vary.</strong> {plan.variabilityNote} This AI-generated explanation is general information, not legal advice. Verify it with a qualified legal professional.</p>

          {phase === "review" ? (
            <div className="mt-5 flex flex-col gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500">The infographic will be rendered from this reviewed explanation. This review is valid for 10 minutes.</p>
              <button onClick={generate} className="button-primary shrink-0"><Sparkles className="size-4" /> Generate infographic</button>
            </div>
          ) : null}
          {phase === "generating" ? <div className="mt-5 flex items-center gap-2 border-t border-stone-100 pt-5 text-sm text-slate-600" role="status"><RefreshCw className="size-4 animate-spin" /> Creating the infographic from this reviewed flow…</div> : null}
          {phase === "complete" ? (
            <div className="mt-5 flex flex-col gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-800" role="status"><CheckCircle2 className="size-4" /> {hasImage ? "Infographic created from this reviewed flow." : "Infographic generated from this reviewed flow."}</p>
              <button onClick={prepareExplanation} className="button-secondary shrink-0"><RefreshCw className="size-4" /> Create another version</button>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function readError(value: unknown): string {
  if (!value || typeof value !== "object" || !("error" in value) || typeof value.error !== "string") return "";
  return value.error;
}

function isPlanResponse(value: unknown): value is PlanResponse {
  if (!value || typeof value !== "object" || !("plan" in value) || !("token" in value) || typeof value.token !== "string") return false;
  const plan = value.plan;
  if (!plan || typeof plan !== "object") return false;
  if (!("title" in plan) || typeof plan.title !== "string" || !("subtitle" in plan) || typeof plan.subtitle !== "string") return false;
  if (!("projectSummary" in plan) || typeof plan.projectSummary !== "string" || !("variabilityNote" in plan) || typeof plan.variabilityNote !== "string") return false;
  if (!("altText" in plan) || typeof plan.altText !== "string" || !("steps" in plan) || !Array.isArray(plan.steps)) return false;
  if (!("keyTerms" in plan) || !Array.isArray(plan.keyTerms)) return false;
  const hasStringFields = (item: unknown, fields: string[]) => {
    if (!item || typeof item !== "object") return false;
    const record = item as Record<string, unknown>;
    return fields.every((field) => typeof record[field] === "string");
  };
  return plan.steps.every((step) => hasStringFields(step, ["title", "description"]))
    && plan.keyTerms.every((term) => hasStringFields(term, ["term", "meaning"]));
}
