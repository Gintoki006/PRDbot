"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Typewriter from "../Typewriter";

export default function HeroSection() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden px-4 md:px-16">
      {/* Background Octocat (Right Side) */}
      <div className="absolute top-[5%] right-[-25%] md:right-[-15%] lg:right-[-10%] opacity-[0.03] rotate-12 pointer-events-none z-0 w-[600px] h-[600px] md:w-[800px] md:h-[800px]">
        <svg viewBox="0 0 16 16" fill="currentColor" className="w-full h-full text-white" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
        </svg>
      </div>
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full relative z-10">
        <div className="flex flex-col gap-6 text-left">
          <Typewriter />
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gh-text-secondary max-w-xl leading-relaxed mt-4"
          >
            AI-powered GitHub issue validation that ensures every task aligns with your product
            requirements. Stop shipping misaligned features.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap gap-3 mt-4"
          >
            {isLoaded && !isSignedIn && (
              <Link href="/sign-up" className="gh-btn-primary px-8 py-3 text-lg font-semibold rounded-md flex items-center gap-2 cursor-pointer">
                Get started
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </Link>
            )}
            {isLoaded && isSignedIn && (
              <Link href="/dashboard" className="gh-btn-primary px-8 py-3 text-lg font-semibold rounded-md flex items-center gap-2 cursor-pointer">
                Go to Dashboard
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </Link>
            )}
            <Link href="/docs" className="gh-btn-secondary px-8 py-3 text-lg font-semibold rounded-md flex items-center gap-2 cursor-pointer">
              View documentation
            </Link>
          </motion.div>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="relative w-full flex items-center justify-center lg:justify-end min-h-[400px]"
        >
          {/* Floating Icons UI Block */}
          <div className="relative w-full max-w-lg aspect-square">
            {/* Background glow */}
            <div className="absolute inset-10 bg-gh-blue/10 rounded-full blur-[80px] -z-10"></div>
            {/* Center Terminal */}
            <div
              className="absolute top-1/2 left-1/2 w-32 h-32 bg-gh-card-bg border border-gh-border rounded-2xl shadow-2xl flex items-center justify-center z-20"
              style={{ animation: "float 6s ease-in-out infinite" }}
            >
              <span className="material-symbols-outlined text-6xl text-gh-blue">terminal</span>
            </div>
            {/* Top right AI spark */}
            <div
              className="absolute top-[20%] right-[15%] w-24 h-24 bg-gh-fade border border-gh-border rounded-xl shadow-xl flex items-center justify-center z-10"
              style={{ animation: "float-simple 5s ease-in-out infinite 1s" }}
            >
              <span className="material-symbols-outlined text-4xl text-[#bf87ff]">
                auto_awesome
              </span>
            </div>
            {/* Bottom left Code */}
            <div
              className="absolute bottom-[20%] left-[15%] w-28 h-28 bg-gh-fade border border-gh-border rounded-xl shadow-xl flex items-center justify-center z-10"
              style={{ animation: "float-simple 7s ease-in-out infinite 2s" }}
            >
              <span className="material-symbols-outlined text-5xl text-gh-green">
                code_blocks
              </span>
            </div>
            {/* Small elements */}
            <div
              className="absolute top-[35%] left-[10%] w-14 h-14 bg-gh-header border border-gh-border rounded-full shadow-lg flex items-center justify-center z-0"
              style={{ animation: "float-simple 4s ease-in-out infinite 0.5s" }}
            >
              <span className="material-symbols-outlined text-2xl text-gh-text-secondary">
                rule
              </span>
            </div>
            <div
              className="absolute bottom-[30%] right-[10%] w-16 h-16 bg-gh-header border border-gh-border rounded-lg shadow-lg flex items-center justify-center z-0"
              style={{ animation: "float-simple 8s ease-in-out infinite 1.5s" }}
            >
              <span className="material-symbols-outlined text-3xl text-gh-text-secondary">
                commit
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
