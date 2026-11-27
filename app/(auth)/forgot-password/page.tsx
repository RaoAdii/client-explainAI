import { AuthForm } from "@/components/auth/auth-form";
import { requestPasswordReset } from "../actions";
export default function ForgotPasswordPage() { return <AuthForm title="Reset your password" copy="We will email you a secure link if the account exists." action={requestPasswordReset} mode="forgot" />; }
