import { User } from "@supabase/supabase-js";
import { AlignJustify, CircleUser, GalleryHorizontalEnd } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";

interface Props {
  user: User | null;
}

export const Navbar = ({ user }: Props) => {
  return (
    <header className="flex items-center justify-between h-20 w-full shrink-0 px-4 md:px-12">
      <Link href="/" className="flex items-center gap-2">
        <GalleryHorizontalEnd />
        <span className="text-xl font-bold">Woofs Welcome</span>
      </Link>

      {user ? (
        <Button variant="ghost" className="rounded-full py-3 px-1">
          <CircleUser className="size-6" />
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="">
            Create a business account
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full py-3 px-1">
                <AlignJustify className="size-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <Link href="/sign-in">
                <DropdownMenuItem>Sign in</DropdownMenuItem>
              </Link>
              <Link href="/sign-up">
                <DropdownMenuItem>Sign up</DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </header>
  );
};
