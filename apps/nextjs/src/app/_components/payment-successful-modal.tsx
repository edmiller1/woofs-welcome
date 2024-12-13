"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { Button } from "@acme/ui/button";

import { api } from "~/trpc/react";
import { LoadingSpinner } from "./loading-spinner";
import { Modal } from "./modal";

export const PaymentSuccessModal = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const { data, isPending } = api.payment.getBusinessPlan.useQuery();

  const handleClose = () => {
    setIsOpen(false);
    router.push("/dashboard");
  };

  const isPaymentSuccessful = data?.plan === "pro" || data?.plan === "starter";

  return (
    <Modal
      showModal={isOpen}
      setShowModal={setIsOpen}
      onClose={handleClose}
      className="px-6 pt-6"
      preventDefaultClose={!isPaymentSuccessful}
    >
      <div className="flex flex-col items-center">
        {isPending || !isPaymentSuccessful ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <LoadingSpinner className="mb-4" />
            <p className="text-lg/7 font-medium text-gray-900">
              Upgrading your account...
            </p>
            <p className="mt-2 text-pretty text-center text-sm/6 text-gray-600">
              Please wait while we process your upgrade. This may take a moment.
            </p>
          </div>
        ) : (
          <>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <img
                src="/brand-asset-heart.png"
                className="h-full w-full object-cover"
                alt="Payment success"
              />
            </div>

            <div className="mt-6 flex flex-col items-center gap-1 text-center">
              <p className="text-pretty text-lg/7 font-medium tracking-tight">
                Upgrade successful! 🎉
              </p>
              <p className="text-pretty text-sm/6 text-gray-600">
                Thank you for upgrading to Pro and supporting Woofs Welcome.
                Your account has been upgraded.
              </p>
            </div>

            <div className="mt-8 w-full">
              <Button onClick={handleClose} className="h-12 w-full">
                <Check className="mr-2 size-5" />
                Go to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
