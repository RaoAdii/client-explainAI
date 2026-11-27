"use client";

import { useActionState } from "react";
import { AlertCircle, ArrowRight, Scale } from "lucide-react";
import type { ProjectInput } from "@/lib/projects/schema";

export type ProjectActionState = {
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

type ProjectFormProps = {
  action: (state: ProjectActionState, formData: FormData) => Promise<ProjectActionState>;
  initial?: Partial<ProjectInput>;
  submitLabel: string;
};

const initialState: ProjectActionState = {};

export function ProjectForm({ action, initial, submitLabel }: ProjectFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const errorFor = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="space-y-8">
      {state.message ? (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {state.message}
        </div>
      ) : null}

      <fieldset className="grid gap-6 md:grid-cols-2" disabled={pending}>
        <TextField label="Project name" name="name" defaultValue={initial?.name} error={errorFor("name")} placeholder="Tenant eviction overview" />
        <TextField label="Jurisdiction" name="jurisdiction" defaultValue={initial?.jurisdiction} error={errorFor("jurisdiction")} placeholder="Country, state, or court system" />
        <TextField label="Legal area" name="legalArea" defaultValue={initial?.legalArea} error={errorFor("legalArea")} placeholder="Civil litigation, family law…" />

        <div className="space-y-2">
          <label className="field-label" htmlFor="language">Language</label>
          <input id="language" value="English" disabled className="field bg-stone-100 text-stone-500" />
          <input type="hidden" name="language" value="English" />
          <p className="field-help">The MVP currently generates English visuals.</p>
        </div>

        <TextField label="Target audience" name="targetAudience" defaultValue={initial?.targetAudience} error={errorFor("targetAudience")} placeholder="Who will read the explanation?" />
        <TextField label="Complexity" name="complexity" defaultValue={initial?.complexity === "Unspecified" ? "" : initial?.complexity} error={errorFor("complexity")} placeholder="Unspecified, simple, detailed…" />

        <div className="space-y-2">
          <label className="field-label" htmlFor="workflowStatus">Workflow status</label>
          <select id="workflowStatus" name="workflowStatus" className="field" defaultValue={initial?.workflowStatus ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          {errorFor("workflowStatus") ? <p className="field-error">{errorFor("workflowStatus")}</p> : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="field-label" htmlFor="description">Project description</label>
          <textarea
            id="description"
            name="description"
            rows={7}
            className="field resize-y"
            defaultValue={initial?.description}
            placeholder="Describe the legal process and the main stages the client should understand. Avoid personal or confidential information."
          />
          <div className="flex justify-between gap-4">
            <p className={errorFor("description") ? "field-error" : "field-help"}>{errorFor("description") ?? "20–4,000 characters"}</p>
            <p className="field-help">Do not include sensitive case details.</p>
          </div>
        </div>
      </fieldset>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <div className="flex gap-3">
          <Scale className="mt-0.5 size-5 shrink-0" />
          <p><strong>General information only.</strong> Generated visuals are AI-created drafts and must be checked by a qualified legal professional.</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="button-primary" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
          {!pending ? <ArrowRight className="size-4" /> : null}
        </button>
      </div>
    </form>
  );
}

function TextField({ label, name, defaultValue, error, placeholder }: { label: string; name: string; defaultValue?: string; error?: string; placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="field-label" htmlFor={name}>{label}</label>
      <input id={name} name={name} defaultValue={defaultValue} className="field" placeholder={placeholder} />
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
