import { redirect } from "next/navigation";

import { auth } from "@acme/auth";

import { LoginForm } from "./login-form";

const SignInPage = async () => {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center">
        <LoginForm />
      </div>
    </>
  );
};

export default SignInPage;
