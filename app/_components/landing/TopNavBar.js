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
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      id="globalNav"
      className={`fixed top-0 w-full z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "bg-gh-header/90 backdrop-blur-md border-gh-border"
          : "bg-gh-header border-transparent"
      }`}
    >
      <div className="flex justify-between items-center h-16 px-4 md:px-8 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-4">
          <a
            className="flex items-center gap-2 font-semibold text-white hover:text-gh-text-secondary transition-colors"
            href="#"
          >
            <span className="material-symbols-outlined text-3xl">terminal</span>
            <span className="text-xl tracking-tight">PRDbot</span>
          </a>
          <div className="hidden md:flex gap-4 ml-4">
            <a
              className="text-white font-semibold text-sm hover:text-gh-text-secondary py-2 px-1"
              href="#"
            >
              Product
            </a>
            <a
              className="text-white font-semibold text-sm hover:text-gh-text-secondary py-2 px-1"
              href="#"
            >
              Features
            </a>
            <a
              className="text-white font-semibold text-sm hover:text-gh-text-secondary py-2 px-1"
              href="#"
            >
              Pricing
            </a>
            <Link
              className="text-white font-semibold text-sm hover:text-gh-text-secondary py-2 px-1 transition-colors"
              href="/docs"
            >
              Docs
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center bg-[#010409] border border-gh-border rounded-md px-3 py-1 gap-2">
            <span className="material-symbols-outlined text-gh-text-secondary text-sm">
              search
            </span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm w-44 text-gh-text-main placeholder-gh-text-secondary outline-none"
              placeholder="Search or jump to..."
              type="text"
            />
            <span className="text-xs border border-gh-border px-1.5 rounded text-gh-text-secondary">
              /
            </span>
          </div>
          {isLoaded && !isSignedIn && (
            <>
              <Link href="/sign-in" className="gh-btn-secondary px-3 py-1.5 text-sm font-semibold rounded-md flex items-center gap-1.5 cursor-pointer">
                <span className="material-symbols-outlined text-sm">login</span>
                Sign in
              </Link>
              <Link href="/sign-up" className="gh-btn-primary px-3 py-1.5 text-sm font-semibold rounded-md cursor-pointer">
                Sign up
              </Link>
            </>
          )}
          {isLoaded && isSignedIn && (
            <>
              <Link href="/dashboard" className="gh-btn-secondary px-3 py-1.5 text-sm font-semibold rounded-md flex items-center gap-1.5 cursor-pointer">
                <span className="material-symbols-outlined text-sm">dashboard</span>
                Dashboard
              </Link>
              <CustomUserButton />
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
