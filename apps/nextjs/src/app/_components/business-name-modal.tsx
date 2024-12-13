"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@acme/ui/alert-dialog";
import { Button } from "@acme/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";

import { api } from "~/trpc/react";
import { LoadingSpinner } from "./loading-spinner";

const formSchema = z.object({
  businessName: z
    .string()
    .min(2, { message: "Business name is required" })
    .max(50),
});

export const BusinessNameModal = () => {
  const router = useRouter();
  const utils = api.useUtils();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
    },
  });

  const [isOpen, setIsOpen] = useState(true);

  const updateBusinessName = api.auth.updateBusinessName.useMutation({
    onSuccess: async () => {
      handleClose();
      toast.success("Successfully updated business name");
      await utils.auth.invalidate();
    },
    onError: () => {
      toast.error("Failed to update business name. Please try again.");
    },
  });

  const handleClose = () => {
    setIsOpen(false);
    router.push("/dashboard");
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateBusinessName.mutate(values);
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>One last step</AlertDialogTitle>
          <AlertDialogDescription>
            We just need the name of your business. All other information can be
            added/updated in the account settings page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="businessName">Business name</FormLabel>
                  <FormControl>
                    <Input placeholder="Business name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="float-end">
              {updateBusinessName.isPending ? <LoadingSpinner /> : "Continue"}
            </Button>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
