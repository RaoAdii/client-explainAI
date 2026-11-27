import { AuthForm } from "@/components/auth/auth-form";
import { signUp } from "../actions";
export default function SignUpPage() { return <AuthForm title="Create your account" copy="Your projects and generated visuals stay private to your account." action={signUp} mode="sign-up" />; }
