import type { WorkflowStatus } from "@/lib/projects/schema";

const styles = { draft: "bg-stone-100 text-stone-700", active: "bg-emerald-50 text-emerald-800", archived: "bg-slate-100 text-slate-600" };
export function StatusBadge({ status }: { status: WorkflowStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[status]}`}>{status}</span>;
}
