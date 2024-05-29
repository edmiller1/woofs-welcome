import { AlignJustify, Footprints, Home, Map, Utensils } from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "./ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { NORTH_ISLAND_PLACES, SOUTH_ISLAND_PLACES } from "@/lib/constants";
import Search from "./Search";
import ExploreButtons from "./ExploreButtons";

export default function Navbar() {
  return (
    <>
      {/* Mobile */}
      <div className="w-full sm:hidden">
        <div className="px-5 h-16 flex items-center justify-between py-3">
          <h1 className="text-4xl">🐶</h1>
          <div className="flex items-center space-x-3">
            <Search />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <AlignJustify />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader className="text-left">
                  <SheetTitle>Discover</SheetTitle>
                </SheetHeader>
                <div className="my-5 space-y-2">
                  <Link
                    href="/explore?query=where-to-go"
                    className="flex items-center"
                  >
                    <Map size={16} className="mr-2" />
                    Where To Go
                  </Link>
                  <Link
                    href="/explore?query=where-to-eat"
                    className="flex items-center"
                  >
                    <Utensils size={16} className="mr-2" />
                    Where to Eat
                  </Link>
                  <Link
                    href="/explore?query=where-to-stay"
                    className="flex items-center"
                  >
                    <Home size={16} className="mr-2" />
                    Places To Stay
                  </Link>
                  <Link
                    href="/explore?query=what-to-do"
                    className="flex items-center"
                  >
                    <Footprints size={16} className="mr-2" />
                    What To Do
                  </Link>
                </div>
                <Separator />
                <SheetHeader className="mt-5 text-left">
                  <SheetTitle>Explore</SheetTitle>
                </SheetHeader>
                <div className="my-5">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="north-island">
                      <AccordionTrigger>North Island</AccordionTrigger>
                      {NORTH_ISLAND_PLACES.map((place) => (
                        <AccordionContent key={place} className="py-1">
                          {place}
                        </AccordionContent>
                      ))}
                    </AccordionItem>
                  </Accordion>
                </div>
                <div className="my-5">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="north-island">
                      <AccordionTrigger>South Island</AccordionTrigger>
                      {SOUTH_ISLAND_PLACES.map((place) => (
                        <AccordionContent key={place} className="py-1">
                          {place}
                        </AccordionContent>
                      ))}
                    </AccordionItem>
                  </Accordion>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden sm:block sm:w-full">
        <div className="h-16 flex items-center justify-between py-3 px-10">
          <h1 className="hidden 2xl:block text-4xl font-extrabold">
            Woof&apos;s Welcome 🐶
          </h1>
          <h1 className="block sm:block sm:text-4xl 2xl:hidden">🐶</h1>
          <ExploreButtons />
          <div className="flex items-center">
            <Search />
            <Sheet>
              <SheetTrigger asChild className="ml-10">
                <Button variant="outline" size="icon">
                  <AlignJustify />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader className="text-left xl:hidden">
                  <SheetTitle>Discover</SheetTitle>
                </SheetHeader>
                <div className="my-5 space-y-2 xl:hidden">
                  <a href="#" className="flex items-center">
                    <Map size={16} className="mr-2" />
                    Where To Go
                  </a>
                  <a href="#" className="flex items-center">
                    <Utensils size={16} className="mr-2" />
                    Where to Eat
                  </a>
                  <a href="#" className="flex items-center">
                    <Home size={16} className="mr-2" />
                    Places To Stay
                  </a>
                  <a href="#" className="flex items-center">
                    <Footprints size={16} className="mr-2" />
                    What To Do
                  </a>
                </div>
                <Separator className="xl:hidden" />
                <SheetHeader className="mt-5 text-left">
                  <SheetTitle>Explore</SheetTitle>
                </SheetHeader>
                <div className="my-5">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="north-island">
                      <AccordionTrigger>North Island</AccordionTrigger>
                      {NORTH_ISLAND_PLACES.map((place) => (
                        <AccordionContent key={place} className="py-1">
                          <Link
                            href={`/${place}`}
                            className="hover:text-primary hover:underline"
                          >
                            {place}
                          </Link>
                        </AccordionContent>
                      ))}
                    </AccordionItem>
                  </Accordion>
                </div>
                <div className="my-5">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="north-island">
                      <AccordionTrigger>South Island</AccordionTrigger>
                      {SOUTH_ISLAND_PLACES.map((place) => (
                        <AccordionContent key={place} className="py-1">
                          <Link
                            href={`/${place}`}
                            className="hover:text-primary hover:underline"
                          >
                            {place}
                          </Link>
                        </AccordionContent>
                      ))}
                    </AccordionItem>
                  </Accordion>
                </div>
                <div className="h-3/4 flex items-end justify-center">
                  <Button>
                    <Map size={20} className="mr-2" />
                    Search via Map
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </>
  );
}
