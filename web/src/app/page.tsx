import { Navbar } from "@/components/navbar";
import { TypingInput } from "@/components/typing-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/server";
import { MapPin, Search } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <>
      <Navbar user={user} />
      <div className="relative h-[80vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('./main.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 flex h-full items-center justify-center px-4">
          <div className="w-full max-w-4xl text-center">
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight max-w-5xl">
                Explore New Zealand's Dog-Friendly Places
              </h1>
              <p className="text-lg text-white/90 md:text-xl">
                Discover 1000's of dog-friendly places, activities and events
                across New Zealand.
              </p>
            </div>

            <div className="mx-auto max-w-4xl">
              <div className="flex flex-col overflow-hidden rounded-full bg-white shadow-2xl md:flex-row">
                <TypingInput />
                <div className="flex items-center justify-center p-2">
                  <Button
                    size="lg"
                    className="h-12 w-12 rounded-full md:h-14 md:w-14"
                  >
                    <Search className="h-5 w-5 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
