"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import Image from "next/image";

interface Props {
  imageUrl: string;
  children: ReactNode;
}

export default function LocationCard({ children, imageUrl }: Props) {
  return (
    <motion.div className="h-72 w-full bg-transparent rounded-lg overflow-hidden group/card relative">
      <AnimatePresence mode="wait">
        <motion.div
          className="relative h-full w-full"
          initial="initial"
          whileHover="left"
          exit="exit"
        >
          <motion.div className="group-hover/card:block hidden absolute inset-0 w-full h-full bg-black/40 z-10 transition duration-500" />
          <motion.div
            variants={variants}
            className="h-full w-full relative bg-gray-50 dark:bg-black"
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
          >
            <Image
              alt="image"
              width={1000}
              height={500}
              src={imageUrl}
              className={cn(
                "h-full w-full object-cover object-center scale-[1.15]"
              )}
            />
          </motion.div>
          <motion.div
            variants={textVariants}
            transition={{
              duration: 0.5,
              ease: "easeOut",
            }}
            className={cn(
              "text-white absolute bottom-4 left-4 pr-12 z-40 w-full"
            )}
          >
            {children}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

const variants = {
  initial: {
    x: 0,
  },

  exit: {
    x: 0,
    y: 0,
  },
  left: {
    x: 20,
  },
};

const textVariants = {
  initial: {
    y: 0,
    x: 0,
    opacity: 0,
  },
  exit: {
    y: 0,
    x: 0,
    opacity: 0,
  },
  left: {
    x: -2,
    opacity: 1,
  },
};
