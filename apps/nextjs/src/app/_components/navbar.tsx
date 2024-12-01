import Link from "next/link";
import { ArrowRight, Smartphone } from "lucide-react";

import { Button, buttonVariants } from "@acme/ui/button";

import { MaxWidthWrapper } from "./max-width-wrapper";

export const Navbar = () => {
  const user = false;

  return (
    <nav className="sticky inset-x-0 top-0 z-[100] h-16 w-full border-b border-gray-200 bg-white backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="z-40 flex font-semibold">
            Woofs<span className="text-primary">Welcome</span>
          </Link>

          <div className="flex h-full items-center space-x-4">
            {user ? (
              <>
                <Button size="sm" variant="ghost">
                  Sign out
                </Button>

                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    size: "sm",
                    className: "flex items-center gap-1",
                  })}
                >
                  Dashboard <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/about"
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  About
                </Link>
                <Link
                  href="/pricing"
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Pricing
                </Link>
                <Link
                  href="/sign-in"
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Sign in
                </Link>

                <div className="h-8 w-px bg-gray-200" />

                <Link
                  href="/sign-up"
                  className={buttonVariants({
                    size: "sm",
                    variant: "outline",
                    className: "flex items-center gap-1.5",
                  })}
                >
                  Get the app <Smartphone className="size-4" />
                </Link>
                <Link
                  href="/sign-up"
                  className={buttonVariants({
                    size: "sm",
                    className: "flex items-center gap-1.5",
                  })}
                >
                  List your business <ArrowRight className="size-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};
