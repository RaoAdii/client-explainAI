"use client";

import { useState } from "react";
import { AlertTriangle, FileText, RefreshCw } from "lucide-react";
import type { ExplanationPlan } from "@/lib/generation/gemini";

type PlanResponse = { plan: ExplanationPlan };

export function ProjectExplainer({ projectId }: { projectId: string }) {
  const [plan, setPlan] = useState<ExplanationPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function explainProject() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}/plan`, { method: "POST" });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(readError(body) || "The explanation could not be prepared. Please try again.");
      if (!isPlanResponse(body)) throw new Error("The explanation response was incomplete. Please try again.");
      setPlan(body.plan);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The explanation could not be prepared. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 space-y-5">
      <div className="rounded-xl border border-[#d9e2e1] bg-[#f5f8f7] p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
        <div>
          <h3 className="font-semibold text-slate-900">Understand this project step by step</h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Get a plain-language overview, an ordered explanation of the process, and definitions of key legal terms. No images are generated.</p>
        </div>
        <button onClick={explainProject} className="button-primary mt-3 shrink-0 sm:mt-0" disabled={loading}>
          {loading ? <RefreshCw className="size-4 animate-spin" /> : <FileText className="size-4" />}
          {loading ? "Preparing explanation…" : plan ? "Refresh explanation" : "Explain this project"}
        </button>
      </div>

      {error ? <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert"><AlertTriangle className="size-5 shrink-0" /><p>{error}</p></div> : null}
      {loading && !plan ? <p className="text-sm text-slate-500" role="status">Reading the project details and preparing the explanation…</p> : null}

      {plan ? (
        <section className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7" aria-labelledby="process-explanation-title">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf2f2] text-[#183640]"><FileText className="size-5" /></span>
            <div>
              <p className="eyebrow">Plain-language explanation</p>
              <h3 id="process-explanation-title" className="mt-1 text-xl font-semibold text-slate-900">{plan.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">{plan.subtitle}</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-[#f7f7f4] p-4">
            <h4 className="text-sm font-semibold text-slate-900">What this project is about</h4>
            <p className="mt-2 text-sm leading-6 text-slate-700">{plan.projectSummary}</p>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-900">The process, step by step</h4>
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
            <h4 className="text-sm font-semibold text-slate-900">Legal terms explained</h4>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {plan.keyTerms.map((item, index) => (
                <div key={`${item.term}-${index}`} className="rounded-xl border border-stone-200 p-4">
                  <dt className="text-sm font-semibold text-[#183640]">{item.term}</dt>
                  <dd className="mt-1 text-sm leading-6 text-slate-600">{item.meaning}</dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Important:</strong> {plan.variabilityNote} This is general information, not legal advice. Check local requirements with a qualified legal professional.</p>
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
  if (!value || typeof value !== "object" || !("plan" in value)) return false;
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
