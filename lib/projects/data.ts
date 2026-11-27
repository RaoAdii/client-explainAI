import type { ProjectInput, WorkflowStatus } from "./schema";

export type ProjectRecord = ProjectInput & {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export function projectFromRow(row: Record<string, unknown>): ProjectRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    jurisdiction: String(row.jurisdiction),
    legalArea: String(row.legal_area),
    language: "English",
    targetAudience: String(row.target_audience),
    complexity: String(row.complexity),
    workflowStatus: row.workflow_status as WorkflowStatus,
    description: String(row.description),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function projectToRow(project: ProjectInput) {
  return {
    name: project.name,
    jurisdiction: project.jurisdiction,
    legal_area: project.legalArea,
    language: project.language,
    target_audience: project.targetAudience,
    complexity: project.complexity,
    workflow_status: project.workflowStatus,
    description: project.description,
  };
}
