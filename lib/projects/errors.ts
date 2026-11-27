type DatabaseError = { code?: string; message?: string } | null;

export function projectMutationMessage(error: DatabaseError): string {
  if (error?.code === "PGRST205" || error?.code === "42P01") {
    return "Project database setup is incomplete. Apply the Supabase migration, then try again.";
  }
  if (error?.code === "42501" || /permission denied|row-level security/i.test(error?.message ?? "")) {
    return "Project database permissions are not configured correctly. Reapply the Supabase migration.";
  }
  return "The project could not be saved. Please try again.";
}
