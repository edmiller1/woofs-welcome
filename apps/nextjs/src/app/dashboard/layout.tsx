import { PropsWithChildren } from "react";

import { auth } from "@acme/auth";

import { api } from "~/trpc/server";
import { MainLayout } from "./main-layout";

const Layout = async ({ children }: PropsWithChildren) => {
  const session = await auth();
  const user = await api.auth.getUser();

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-white md:flex-row">
      <MainLayout children={children} session={session} user={user} />
    </div>
  );
};

export default Layout;
