"use client";

import { Footprints, Home, Map, Utensils } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function ExploreButtons() {
  const router = useRouter();
  return (
    <div className="flex items-center space-x-5 sm:hidden xl:block">
      <Button
        variant="outline"
        onClick={() => router.push("/explore?query=where-to-go")}
      >
        <Map className="mr-2" />
        Where To Go
      </Button>
      <Button
        variant="outline"
        onClick={() => router.push("/explore?query=where-to-eat")}
      >
        <Utensils className="mr-2" />
        Where to Eat
      </Button>
      <Button
        variant="outline"
        onClick={() => router.push("/explore?query=where-to-stay")}
      >
        <Home className="mr-2" />
        Places To Stay
      </Button>
      <Button
        variant="outline"
        onClick={() => router.push("/explore?query=what-to-do")}
      >
        <Footprints className="mr-2" />
        What To Do
      </Button>
    </div>
  );
}
