"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import CustomUserButton from "../auth/CustomUserButton";

export default function TopNavBar() {
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, x: "-50%" }}
      animate={{ y: 0, x: "-50%" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      id="globalNav"
      className={`fixed top-6 left-1/2 z-50 transition-all duration-500 rounded-full flex items-center justify-between w-[92%] md:w-[85%] max-w-[1000px] px-4 md:px-6 h-16 border ${
        scrolled
          ? "bg-[#0d1117]/80 backdrop-blur-xl border-[#30363d] shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
          : "bg-[#161b22]/40 backdrop-blur-md border-[#30363d]/50 shadow-lg shadow-black/20"
      }`}
    >
      <div className="flex items-center gap-4 w-full justify-between">
        <div className="flex items-center gap-6">
          <Link
            className="flex items-center gap-2 font-semibold text-white hover:opacity-80 transition-opacity"
            href="/"
          >
            <span className="material-symbols-outlined text-[28px] text-white">terminal</span>
            <span className="text-xl tracking-tight font-extrabold">PRDbot</span>
          </Link>
          <div className="hidden md:flex gap-1 bg-[#0d1117]/50 p-1 rounded-full border border-[#30363d]/30">
            <a
              className="text-[#8b949e] font-medium text-sm hover:text-white hover:bg-[#30363d]/50 rounded-full py-1.5 px-4 transition-all"
              href="#"
            >
              Product
            </a>
            <a
              className="text-[#8b949e] font-medium text-sm hover:text-white hover:bg-[#30363d]/50 rounded-full py-1.5 px-4 transition-all"
              href="#features"
            >
              Features
            </a>
            <Link
              className="text-[#8b949e] font-medium text-sm hover:text-white hover:bg-[#30363d]/50 rounded-full py-1.5 px-4 transition-all"
              href="/docs"
            >
              Docs
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isLoaded && !isSignedIn && (
            <>
              <Link href="/sign-in" className="text-[#8b949e] hover:text-white px-3 py-1.5 text-sm font-semibold transition-colors hidden sm:block">
                Sign in
              </Link>
              <Link href="/sign-up" className="bg-white text-black hover:bg-gray-200 px-5 py-2 text-sm font-bold rounded-full transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                Get Started
              </Link>
            </>
          )}
          {isLoaded && isSignedIn && (
            <>
              <Link href="/dashboard" className="text-[#8b949e] hover:text-white px-4 py-2 text-sm font-semibold rounded-full border border-[#30363d] hover:bg-[#30363d]/50 transition-all hidden sm:block">
                Dashboard
              </Link>
              <div className="ml-1 flex items-center justify-center">
                <CustomUserButton />
              </div>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
