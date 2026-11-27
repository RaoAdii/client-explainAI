import { AuthForm } from "@/components/auth/auth-form";
import { signIn } from "../actions";
export default function SignInPage() { return <AuthForm title="Welcome back" copy="Sign in to manage your legal-process visuals." action={signIn} mode="sign-in" />; }
