import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { AuthShell, getNext } from "../auth-shell";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  return (
    <AuthShell title="Sign in" intro="Welcome back to Sartoria.">
      <Suspense fallback={<AuthForm mode="sign-in" />}>
        {getNext(searchParams).then((next) => (
          <AuthForm mode="sign-in" next={next} />
        ))}
      </Suspense>
    </AuthShell>
  );
}
