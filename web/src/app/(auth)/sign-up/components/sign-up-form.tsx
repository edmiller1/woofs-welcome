"use client";

import { GoogleLogo } from "@/components/google-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import config from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const SignUpForm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) => {
  const supabase = createClient();
  const router = useRouter();

  const [signUpEmail, setSignUpEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${config.domainName}/welcome`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithOtp({
        email: signUpEmail.trim(),
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        setIsLoading(false);
        throw error;
      } else {
        toast.success(
          `Success! Please check your email: ${signUpEmail} for a one time password code.`,
          {
            duration: 10000,
          }
        );
        setTimeout(() => {
          const promise = () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ name: "Sonner" }), 2000)
            );
          router.push(
            `${config.domainName}/verify-otp?email=${encodeURIComponent(
              signUpEmail
            )}`
          );
          toast.promise(promise, {
            loading: "Loading...",
            success: () => {
              return "Redirecting to verification page... ";
            },
            error: "Error",
          });
        }, 3000);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[400px]">
      <CardContent>
        <form
          onSubmit={handleEmailSignUp}
          className={cn("flex flex-col gap-6", className)}
          {...props}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-balance text-sm text-muted-foreground">
              Enter your email below to create an account
            </p>
          </div>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" type="text" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" type="text" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                onChange={(e) => setSignUpEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-3 animate-spin" strokeWidth={3} />{" "}
                  Signing up...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </form>
        <div className="space-y-4">
          <div className="mt-3 relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-card px-2 text-muted-foreground">
              Or sign up with
            </span>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <GoogleLogo />
            Sign up with Google
          </Button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/sign-in" className="underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
