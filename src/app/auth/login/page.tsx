import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "TuzoHub | SignIn",
  description: "This is the SignIn page of TuzoHub, a Next.js dashboard template. Sign in to access your dashboard and manage your data effectively.",
};

export default function SignIn() {
  return <SignInForm />;
}
