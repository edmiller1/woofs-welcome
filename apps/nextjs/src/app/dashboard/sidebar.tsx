import Link from "next/link";
import { Home, LucideIcon, Settings, Sparkles } from "lucide-react";

import type { Session } from "@acme/auth";
import { cn } from "@acme/ui";
import { Badge } from "@acme/ui/badge";
import { buttonVariants } from "@acme/ui/button";

import { User } from "~/lib/types";
import { UserNav } from "./user-nav";

interface SidebarItem {
  href: string;
  icon: LucideIcon;
  text: string;
  badge?: string;
}

interface SidebarCategory {
  category: string;
  items: SidebarItem[];
}

const SIDEBAR_ITEMS: SidebarCategory[] = [
  {
    category: "Overview",
    items: [{ href: "/dashboard", icon: Home, text: "Dashboard" }],
  },
  {
    category: "Account",
    items: [
      {
        href: "/dashboard/upgrade",
        icon: Sparkles,
        text: "Upgrade",
      },
    ],
  },
  {
    category: "Settings",
    items: [
      {
        href: "/dashboard/account-settings",
        icon: Settings,
        text: "Account Settings",
      },
    ],
  },
];

interface SidebarProps {
  onClose?: () => void;
  session: Session | null;
  user: User | undefined;
}

export const Sidebar = ({ onClose, session, user }: SidebarProps) => {
  return (
    <div className="relative z-20 flex h-full flex-col space-y-4 md:space-y-6">
      {/* logo */}
      <p className="hidden text-lg/7 font-semibold sm:block">
        Woofs<span className="text-primary">Welcome</span>
      </p>

      {/* navigation items */}
      <div className="flex-grow">
        <ul>
          {SIDEBAR_ITEMS.map(({ category, items }) => (
            <li key={category} className="mb-4 md:mb-8">
              <p className="text-xs font-medium leading-6 text-zinc-500">
                {category}
              </p>
              <div className="-mx-2 flex flex-1 flex-col">
                {items.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "group flex w-full items-center justify-start gap-x-2.5 rounded-md px-2 py-1.5 text-sm font-medium leading-6 text-zinc-700 transition hover:bg-gray-50",
                    )}
                    onClick={onClose}
                  >
                    <item.icon className="size-4 text-zinc-500 group-hover:text-zinc-700" />
                    <div className="flex w-full items-center justify-between">
                      {item.text}
                      {item.text === "Upgrade" ? (
                        <Badge className="hover:bg-primary">
                          {user?.plan === "none" ? "No Plan" : user?.plan}
                        </Badge>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col">
        <hr className="my-4 h-px w-full bg-gray-100 md:my-6" />

        {/* User button */}
        <UserNav session={session} user={user} />
      </div>
    </div>
  );
};
