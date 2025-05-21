import type { Metadata } from "next";
import { SignInForm } from "./components/sign-in-form";
import { CircleAlert, GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
};

interface Props {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const SignInPage = async ({ searchParams }: Props) => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    if (searchParams.returnUrl) {
      redirect(searchParams.returnUrl as string);
    } else {
      redirect("/dashboard");
    }
  }

  const params = await searchParams;
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-between gap-2 md:justify-between">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Woofs Welcome
          </a>
          <Link
            href="/business/sign-up"
            className={buttonVariants({ variant: "link" })}
          >
            Create a business account.
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignInForm />
            {params.error === "true" && (
              <div className="w-[400px] mt-10">
                <Alert variant="destructive">
                  <CircleAlert className="h-4 w-4" />
                  <AlertTitle>Oh no!</AlertTitle>
                  <AlertDescription>
                    Something went wrong. Please try signing in again. <br />(
                    {params.message})
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/placeholder.svg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default SignInPage;
