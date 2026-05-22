"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import Typewriter from "../Typewriter";

export default function HeroSection() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden px-4 md:px-16">
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
        <div className="flex flex-col gap-6 text-left">
          <Typewriter />
          <p className="text-lg md:text-xl text-gh-text-secondary max-w-xl leading-relaxed mt-4">
            AI-powered GitHub issue validation that ensures every task aligns with your product
            requirements. Stop shipping misaligned features.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
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
            <Link href="#" className="gh-btn-secondary px-8 py-3 text-lg font-semibold rounded-md flex items-center gap-2 cursor-pointer">
              View documentation
            </Link>
          </div>
        </div>
        <div className="relative w-full flex items-center justify-center lg:justify-end min-h-[400px]">
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
        </div>
      </div>
    </section>
  );
}
