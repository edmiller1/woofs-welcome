import Image from "next/image";

import { Button } from "@acme/ui/button";
import { Card } from "@acme/ui/card";

import { api } from "~/trpc/server";

export const DashboardEmptyPage = () => {
  return (
    <Card className="flex flex-1 flex-col items-center justify-center rounded-2xl p-6 text-center">
      <div className="flex w-full justify-center">
        <img
          src="/tree.png"
          alt="No categories"
          className="-mt-24 size-48 object-center"
        />
      </div>

      <h1 className="mt-2 text-xl/8 font-medium tracking-tight text-gray-900">
        No Listings, Events or Ads yet.
      </h1>

      <p className="mb-8 mt-2 max-w-prose text-sm/6 text-gray-600">
        Get started by creating a new listing, event or advertisement.
      </p>

      <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
        <Button
          variant="outline"
          className="flex w-full items-center space-x-2 sm:w-auto"
        >
          <span className="size-5">🚀</span>
          <span>Start Creating</span>
        </Button>
      </div>
    </Card>
  );
};
