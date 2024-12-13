"use client";

import { ReactNode, useState } from "react";
import { Menu, X } from "lucide-react";

import type { Session } from "@acme/auth";

import { User } from "~/lib/types";
import { Modal } from "../_components/modal";
import { Sidebar } from "./sidebar";

interface MainProps {
  children: ReactNode;
  session: Session | null;
  user: User | undefined;
}

export const MainLayout = ({ children, session, user }: MainProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  return (
    <>
      {/* sidebar for desktop */}
      <div className="relative z-10 hidden h-full w-64 border-r border-gray-100 p-6 md:block lg:w-80">
        <Sidebar session={session} user={user} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* mobile header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 md:hidden">
          <p className="text-lg/7 font-semibold">
            Ping<span className="text-primary">Panda</span>
          </p>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="text-gray-500 hover:text-gray-600"
          >
            <Menu className="size-6" />
          </button>
        </div>

        {/* main content area */}
        <div className="relative z-10 flex-1 overflow-y-auto bg-gray-50 p-4 shadow-md md:p-6">
          <div className="relative flex min-h-full flex-col">
            <div className="flex h-full flex-1 flex-col space-y-4">
              {children}
            </div>
          </div>
        </div>

        <Modal
          className="p-4"
          showModal={isDrawerOpen}
          setShowModal={setIsDrawerOpen}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg/7 font-semibold">
              Woofs<span className="text-primary">Welcome</span>
            </p>
            <button
              aria-label="Close modal"
              onClick={() => setIsDrawerOpen(false)}
            >
              <X className="size-6" />
            </button>
          </div>

          <Sidebar session={session} user={user} />
        </Modal>
      </div>
    </>
  );
};
