"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { projectSchema } from "@/lib/projects/schema";
import { projectToRow } from "@/lib/projects/data";
import { projectMutationMessage } from "@/lib/projects/errors";
import { createClient } from "@/lib/supabase/server";
import type { ProjectActionState } from "@/components/projects/project-form";

function values(formData: FormData) {
  return {
    name: formData.get("name"),
    jurisdiction: formData.get("jurisdiction"),
    legalArea: formData.get("legalArea"),
    language: formData.get("language"),
    targetAudience: formData.get("targetAudience"),
    complexity: formData.get("complexity"),
    workflowStatus: formData.get("workflowStatus"),
    description: formData.get("description"),
  };
}

async function authenticatedClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createProject(_: ProjectActionState, formData: FormData): Promise<ProjectActionState> {
  const parsed = projectSchema.safeParse(values(formData));
  if (!parsed.success) return { message: "Please correct the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  const { supabase, user } = await authenticatedClient();
  if (!user) return { message: "Your session has expired. Sign in again." };
  const { data, error } = await supabase.from("projects").insert({ ...projectToRow(parsed.data), user_id: user.id }).select("id").single();
  if (error || !data) {
    console.error("createProject failed", { code: error?.code, message: error?.message, details: error?.details });
    return { message: projectMutationMessage(error) };
  }
  redirect(`/projects/${data.id}`);
}

export async function updateProject(projectId: string, _: ProjectActionState, formData: FormData): Promise<ProjectActionState> {
  const parsed = projectSchema.safeParse(values(formData));
  if (!parsed.success) return { message: "Please correct the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  const { supabase, user } = await authenticatedClient();
  if (!user) return { message: "Your session has expired. Sign in again." };
  const { error } = await supabase.from("projects").update(projectToRow(parsed.data)).eq("id", projectId).eq("user_id", user.id);
  if (error) {
    console.error("updateProject failed", { code: error.code, message: error.message, details: error.details });
    return { message: projectMutationMessage(error) };
  }
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}`);
}
