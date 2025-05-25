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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export const SignInForm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) => {
  const supabase = createClient();
  const router = useRouter();

  const [signInEmail, setSignInEmail] = useState<string>("");
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

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithOtp({
        email: signInEmail.trim(),
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        setIsLoading(false);
        throw error;
      } else {
        toast.success(
          `Success! Please check your email: ${signInEmail} for a one time password code.`,
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
              signInEmail
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
          onSubmit={handleEmailSignIn}
          className={cn("flex flex-col gap-6", className)}
          {...props}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">Sign in to your account</h1>
            <p className="text-balance text-sm text-muted-foreground">
              Enter your email below to sign in to your account
            </p>
          </div>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                onChange={(e) => setSignInEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-3 animate-spin" strokeWidth={3} />{" "}
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </div>
        </form>
        <div className="space-y-4">
          <div className="mt-3 relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <GoogleLogo />
            Sign in with Google
          </Button>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <a href="#" className="underline underline-offset-4">
              Sign up
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
