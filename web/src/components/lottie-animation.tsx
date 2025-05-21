"use client";

import Lottie from "lottie-react";
import { cn } from "@/lib/utils";

interface Props {
  loop: boolean;
  autoplay: boolean;
  animationData: unknown;
  className?: string;
}

export const LottieAnimation = ({
  loop,
  autoplay,
  animationData,
  className,
}: Props) => {
  return (
    <div className={cn(className)}>
      <Lottie animationData={animationData} loop={loop} autoplay={autoplay} />
    </div>
  );
};
