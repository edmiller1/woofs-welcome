"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "@acme/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { Input } from "@acme/ui/input";

import { DiscordLogo } from "../../../_components/discord-logo";
import { GoogleLogo } from "../../../_components/google-logo";

export const SignUpForm = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("email", { email, callbackUrl: "/" });
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create your business account</CardTitle>
        <CardDescription>Choose your preferred sign up method</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            <Mail className="mr-2 h-4 w-4" /> Sign up with Email
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button
          onClick={() => signIn("google", { callbackUrl: "/welcome" })}
          variant="outline"
          className="w-full"
        >
          <GoogleLogo /> Sign up with Google
        </Button>
        <Button
          onClick={() => signIn("discord", { callbackUrl: "/welcome" })}
          variant="outline"
          className="w-full"
        >
          <DiscordLogo /> Sign up with Discord
        </Button>
        <div className="mt-4 w-full text-center text-sm">
          Already have a business account?{" "}
          <Link
            href="/sign-in"
            className="text-sm text-blue-600 hover:underline"
          >
            Sign in
          </Link>
          <p className="mt-4">
            Only want to explore Dog-Friendly places?{" "}
            <Link href="/app" className="text-sm text-blue-600 hover:underline">
              Get the app
            </Link>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};