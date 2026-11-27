import { createHash } from "node:crypto";
import type { ProjectInput } from "./schema";

export async function fingerprintProject(project: ProjectInput): Promise<string> {
  const content = JSON.stringify({
    name: project.name,
    jurisdiction: project.jurisdiction,
    legalArea: project.legalArea,
    language: project.language,
    targetAudience: project.targetAudience,
    complexity: project.complexity,
    description: project.description,
  });

  return createHash("sha256").update(content).digest("hex");
}

export function safeDownloadName(name: string): string {
  const base = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${base || "legal-process-visual"}.png`;
}

export function generationImagePath(userId: string, projectId: string, runId: string): string {
  return `${userId}/${projectId}/${runId}.png`;
}
