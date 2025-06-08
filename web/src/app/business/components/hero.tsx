import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const Hero = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Background Image with Diagonal Clip */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/fluffs.jpg')",
            clipPath: "polygon(60% 0%, 100% 0%, 100% 100%, 40% 100%)",
          }}
        >
          {/* Dark overlay for better text contrast on image */}
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-8 max-w-lg">
              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Have a dog-friendly business?
              </h1>

              {/* Description */}
              <p className="text-lg text-muted-foreground leading-relaxed">
                Create or claim your business and join our amazing dog-friendly
                community. Update your business profile, and photos and create
                events.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/business/sign-in">
                  <Button
                    variant="default"
                    size="lg"
                    className="px-8 py-3 text-base font-semibold w-full sm:w-auto"
                  >
                    Sign in
                  </Button>
                </Link>
                <Link href="/business/sign-up">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="px-0 text-base font-semibold group w-full sm:w-auto justify-center sm:justify-start"
                  >
                    Create an account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right side is handled by the background image */}
            <div className="hidden lg:block"></div>
          </div>
        </div>
      </div>

      {/* Mobile Background - Simple overlay on smaller screens */}
      <div className="lg:hidden absolute inset-0 bg-gradient-to-br from-white via-white/95 to-white/80">
        <Image
          src="/fluffs.jpg"
          alt="Business professional"
          fill
          className="object-cover mix-blend-soft-light opacity-20"
        />
      </div>
    </div>
  );
};
