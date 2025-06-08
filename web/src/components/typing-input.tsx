"use client";

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { typingWords } from "@/lib/constants";

export const TypingInput = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    const currentWord = typingWords[currentWordIndex];

    if (isTyping) {
      // Typing effect
      if (currentText.length < currentWord.length) {
        const timeout = setTimeout(() => {
          setCurrentText(currentWord.slice(0, currentText.length + 1));
        }, 100); // Adjust typing speed here
        return () => clearTimeout(timeout);
      } else {
        // Pause before deleting
        const timeout = setTimeout(() => {
          setIsTyping(false);
        }, 2000); // Pause duration
        return () => clearTimeout(timeout);
      }
    } else {
      // Deleting effect
      if (currentText.length > 0) {
        const timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, 50); // Adjust deleting speed here
        return () => clearTimeout(timeout);
      } else {
        // Move to next word
        setCurrentWordIndex((prev) => (prev + 1) % typingWords.length);
        setIsTyping(true);
      }
    }
  }, [currentText, currentWordIndex, isTyping, typingWords]);

  return (
    <div className="flex flex-1 items-center border-b border-gray-200 px-6 py-4 md:border-b-0">
      <MapPin className="mr-3 h-5 w-5 text-gray-400" />
      <div className="flex-1">
        <Input
          type="text"
          placeholder={currentText}
          //value={location}
          // onChange={(e) => setLocation(e.target.value)}
          className="border-0 p-0 text-sm placeholder:text-gray-500 focus-visible:ring-0"
        />
      </div>
    </div>
  );
};
