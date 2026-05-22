"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const texts = [
  { white: "Your PRD’s", blue: "Automated Enforcer" },
  { white: "Every issue reviewed.", blue: "Every sprint aligned." },
  { white: "Read the PRD. Review the issue.", blue: "Enforce the vision." },
  { white: "AI-powered", blue: "PRD review." }
];

function TypingBlock({ textObj }) {
  const [charIndex, setCharIndex] = useState(0);
  const totalChars = textObj.white.length + textObj.blue.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCharIndex((prev) => {
        if (prev < totalChars) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 40); // typing speed
    return () => clearInterval(interval);
  }, [totalChars]);

  const displayedWhite = textObj.white.substring(0, charIndex);
  const displayedBlue = textObj.blue.substring(0, Math.max(0, charIndex - textObj.white.length));
  const showBreak = charIndex >= textObj.white.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute w-full"
    >
      <span>{displayedWhite}</span>
      {showBreak && <br />}
      <span className="text-gh-blue">{displayedBlue}</span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-[3px] md:w-[4px] h-10 md:h-16 bg-gh-blue ml-2 align-middle -mt-2"
      />
    </motion.div>
  );
}

export default function Typewriter() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 6000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <h1 className="font-display-hero text-5xl md:text-7xl text-white relative min-h-[180px] md:min-h-[220px]">
      <AnimatePresence mode="wait">
        <TypingBlock key={index} textObj={texts[index]} />
      </AnimatePresence>
    </h1>
  );
}
