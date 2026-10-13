import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { AuthShell, getNext } from "../auth-shell";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false },
};

export default function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  return (
    <AuthShell
      title="Create an account"
      intro="Save your details and keep track of your orders."
    >
      <Suspense fallback={<AuthForm mode="sign-up" />}>
        {getNext(searchParams).then((next) => (
          <AuthForm mode="sign-up" next={next} />
        ))}
      </Suspense>
    </AuthShell>
  );
}
