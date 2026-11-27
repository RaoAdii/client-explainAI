import { z } from "zod";

export const workflowStatuses = ["draft", "active", "archived"] as const;

const trimmed = (label: string, min: number, max: number) =>
  z.string().trim().min(min, `${label} must be at least ${min} characters.`).max(max, `${label} must be ${max} characters or fewer.`);

export const projectSchema = z.object({
  name: trimmed("Project name", 3, 120),
  jurisdiction: trimmed("Jurisdiction", 2, 160),
  legalArea: trimmed("Legal area", 2, 120),
  language: z.literal("English"),
  targetAudience: trimmed("Target audience", 2, 160),
  complexity: z
    .string()
    .trim()
    .max(120, "Complexity must be 120 characters or fewer.")
    .transform((value) => value || "Unspecified"),
  workflowStatus: z.enum(workflowStatuses),
  description: trimmed("Project description", 20, 4000),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type WorkflowStatus = (typeof workflowStatuses)[number];

export const generationStatuses = ["pending", "generating", "succeeded", "failed"] as const;
export type GenerationStatus = (typeof generationStatuses)[number];
