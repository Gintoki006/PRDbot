"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import CustomUserButton from "./_components/auth/CustomUserButton";
import Typewriter from "./_components/Typewriter";

export default function Home() {
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
    <>
      {/* TopNavBar */}
      <nav
        id="globalNav"
        className={`fixed top-0 w-full z-50 border-b transition-all duration-300 ${
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
              <a
                className="text-white font-semibold text-sm hover:text-gh-text-secondary py-2 px-1"
                href="#"
              >
                Docs
              </a>
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
      </nav>

      <main className="flex-grow pt-16">
        {/* Hero Section */}
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
        {/* Logo Cloud / Social Proof */}
        <section className="border-y border-gh-border bg-gh-header py-8">
          <div className="max-w-[1280px] mx-auto px-4 flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">account_tree</span>
              <span className="font-bold text-lg text-white">GitLab</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">code_blocks</span>
              <span className="font-bold text-lg text-white">Bitbucket</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">hub</span>
              <span className="font-bold text-lg text-white">Azure DevOps</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl">rocket_launch</span>
              <span className="font-bold text-lg text-white">Linear</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-16 bg-gh-bg border-t border-gh-border mt-24">
        <div className="max-w-[1280px] mx-auto px-4 md:px-16">
          {/* Top Links Band */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold text-gh-text-main uppercase tracking-[0.1em] mb-2">
                Product
              </span>
              <div className="flex flex-col gap-3">
                <a className="text-sm text-gh-text-secondary hover:text-white transition-colors" href="#">
                  Features
                </a>
                <a className="text-sm text-gh-text-secondary hover:text-white transition-colors" href="#">
                  Pricing
                </a>
                <a className="text-sm text-gh-text-secondary hover:text-white transition-colors" href="#">
                  Enterprise
                </a>
                <a className="text-sm text-gh-text-secondary hover:text-white transition-colors" href="#">
                  Security
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold text-gh-text-main uppercase tracking-[0.1em] mb-2">
                Platform
              </span>
              <div className="flex flex-col gap-3">
                <a className="text-sm text-gh-text-secondary hover:text-white transition-colors" href="#">
                  Integrations
                </a>
                <a className="text-sm text-gh-text-secondary hover:text-white transition-colors" href="#">
                  API Docs
                </a>
                <a className="text-sm text-gh-text-secondary hover:text-white transition-colors" href="#">
                  Status
                </a>
                <a className="text-sm text-gh-text-secondary hover:text-white transition-colors" href="#">
                  Dev Portal
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold text-gh-text-main uppercase tracking-[0.1em] mb-2">
                Company
              </span>
              <div className="flex flex-col gap-3">
                <a className="text-sm text-gh-text-secondary hover:text-white transition-colors" href="#">
                  About
                </a>
                <a className="text-sm text-gh-text-secondary hover:text-white transition-colors" href="#">
                  Blog
                </a>
                <a className="text-sm text-gh-text-secondary hover:text-white transition-colors" href="#">
                  Careers
                </a>
                <a className="text-sm text-gh-text-secondary hover:text-white transition-colors" href="#">
                  Press
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-xs font-semibold text-gh-text-main uppercase tracking-[0.1em] mb-2">
                Legal
              </span>
              <div className="flex flex-col gap-3">
                <a className="text-sm text-gh-text-secondary hover:text-white transition-colors" href="#">
                  Privacy
                </a>
                <a className="text-sm text-gh-text-secondary hover:text-white transition-colors" href="#">
                  Terms
                </a>
                <a className="text-sm text-gh-text-secondary hover:text-white transition-colors" href="#">
                  Security
                </a>
              </div>
            </div>
          </div>
          {/* Large Wordmark Section */}
          <div className="relative flex flex-col items-center justify-end h-48 md:h-64 overflow-hidden pointer-events-none">
            <h2 className="text-[15vw] md:text-[18vw] font-bold leading-none select-none pointer-events-none opacity-[0.03] bg-clip-text text-transparent bg-gradient-to-b from-white to-transparent tracking-tighter">
              PRDbot
            </h2>
          </div>
          {/* Bottom Social & Copyright Band */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gh-border gap-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gh-fade border border-gh-border flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm text-gh-text-secondary">
                    terminal
                  </span>
                </div>
                <span className="text-xs text-gh-text-secondary tracking-widest uppercase">
                  © {new Date().getFullYear()} PRDbot.
                </span>
              </div>
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-gh-text-secondary hover:text-white cursor-pointer text-lg">
                  public
                </span>
                <span className="material-symbols-outlined text-gh-text-secondary hover:text-white cursor-pointer text-lg">
                  chat
                </span>
                <span className="material-symbols-outlined text-gh-text-secondary hover:text-white cursor-pointer text-lg">
                  code
                </span>
              </div>
            </div>
            <div className="flex gap-8">
              <a
                className="text-xs text-gh-text-secondary hover:text-white uppercase tracking-widest transition-colors"
                href="#"
              >
                Twitter
              </a>
              <a
                className="text-xs text-gh-text-secondary hover:text-white uppercase tracking-widest transition-colors"
                href="#"
              >
                GitHub
              </a>
              <a
                className="text-xs text-gh-text-secondary hover:text-white uppercase tracking-widest transition-colors"
                href="#"
              >
                Discord
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
