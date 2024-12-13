import { redirect } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { auth } from "@acme/auth";
import { Button } from "@acme/ui/button";

import { api } from "~/trpc/server";
import { BusinessNameModal } from "../_components/business-name-modal";
import { DashboardPage } from "../_components/dashboard-page";
import { PaymentSuccessModal } from "../_components/payment-successful-modal";
import { DashboardEmptyPage } from "./dashboard-empty-state";

interface Props {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const Page = async ({ searchParams }: Props) => {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  const user = await api.auth.getUser();

  if (!user) {
    return redirect("/welcome");
  }

  const intent = searchParams.intent;

  const success = searchParams.success;

  return (
    <>
      {success ? <PaymentSuccessModal /> : null}
      {!user.businessName ? <BusinessNameModal /> : null}
      <DashboardPage
        cta={
          <Button className="w-full sm:w-fit">
            <PlusIcon className="size-4" />
            Create
          </Button>
        }
        title="Dashboard"
      >
        <DashboardEmptyPage />
      </DashboardPage>
    </>
  );
};

export default Page;
