import { AuthForm } from "@/components/auth/auth-form";
import { updatePassword } from "../actions";
export default function ResetPasswordPage() { return <AuthForm title="Choose a new password" copy="Use a unique password with at least eight characters." action={updatePassword} mode="reset" />; }
