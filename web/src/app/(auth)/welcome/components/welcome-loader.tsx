"use client";

import { createUser } from "@/api/auth/createUser";
import { LottieAnimation } from "@/components/lottie-animation";
import dogWalking from "@/lottie/dog-walking.json";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const WelcomeLoader = () => {
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["create-account"],
    queryFn: async () => createUser(),
    refetchInterval: (query) => {
      return query.state.data?.isSynced ? false : 1000;
    },
  });

  useEffect(() => {
    if (data?.isSynced) router.push(data.redirectUrl);
  }, [data, router]);
  return (
    <div className="flex flex-col justify-center items-center">
      <LottieAnimation
        animationData={dogWalking}
        autoplay
        loop
        className="w-[300px]"
      />
      <h1 className="text-xl sm:text-2xl">
        One moment while we sign you in...
      </h1>
    </div>
  );
};
