"use client";

import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Footer() {
  return (
    <footer className="w-full py-16 bg-gh-bg border-t border-gh-border mt-24">
      <div className="max-w-[1280px] mx-auto px-4 md:px-16">
        {/* Top Links Band */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          <motion.div variants={item} className="flex flex-col gap-4">
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
          </motion.div>
          <motion.div variants={item} className="flex flex-col gap-4">
            <span className="text-xs font-semibold text-gh-text-main uppercase tracking-[0.1em] mb-2">
              Platform
            </span>
            <div className="flex flex-col gap-3">
              <a className="text-sm text-gh-text-secondary hover:text-white transition-colors" href="#">
                Integrations
              </a>
              <a className="text-sm text-gh-text-secondary hover:text-white transition-colors" href="/docs">
                Documentation
              </a>
              <a className="text-sm text-gh-text-secondary hover:text-white transition-colors" href="#">
                Status
              </a>
              <a className="text-sm text-gh-text-secondary hover:text-white transition-colors" href="#">
                Dev Portal
              </a>
            </div>
          </motion.div>
          <motion.div variants={item} className="flex flex-col gap-4">
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
          </motion.div>
          <motion.div variants={item} className="flex flex-col gap-4">
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
          </motion.div>
        </motion.div>
        {/* Large Wordmark Section */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative flex flex-col items-center justify-end h-48 md:h-64 overflow-hidden pointer-events-none"
        >
          <h2 className="text-[15vw] md:text-[18vw] font-bold leading-none select-none pointer-events-none opacity-[0.03] bg-clip-text text-transparent bg-gradient-to-b from-white to-transparent tracking-tighter">
            PRDbot
          </h2>
        </motion.div>
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
  );
}
