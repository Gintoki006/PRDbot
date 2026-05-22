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
    <footer className="w-full pt-16 pb-6 bg-[#06090f] border-t border-[#30363d] mt-24 overflow-hidden relative">
      <div className="max-w-[1440px] mx-auto px-4 md:px-16 flex flex-col items-center">
        {/* Top Links Band */}
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 gap-x-12 gap-y-12 w-full max-w-xl mx-auto mb-16 md:mb-24 z-10"
        >
          <motion.div variants={item} className="flex flex-col gap-5">
            <span className="text-xs font-semibold text-white uppercase tracking-[0.1em]">
              Product
            </span>
            <div className="flex flex-col gap-4">
              <a className="text-[13px] text-[#8b949e] hover:text-white transition-colors" href="#features">
                Features
              </a>
              <a className="text-[13px] text-[#8b949e] hover:text-white transition-colors" href="/dashboard">
                Dashboard
              </a>
            </div>
          </motion.div>
          <motion.div variants={item} className="flex flex-col gap-5">
            <span className="text-xs font-semibold text-white uppercase tracking-[0.1em]">
              Resources
            </span>
            <div className="flex flex-col gap-4">
              <a className="text-[13px] text-[#8b949e] hover:text-white transition-colors" href="/docs">
                Documentation
              </a>
              <a className="text-[13px] text-[#8b949e] hover:text-white transition-colors" href="#">
                GitHub Setup
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Large Wordmark Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="w-full flex justify-center items-end mt-4 mb-8 select-none pointer-events-none"
        >
          <h2 className="text-[18vw] md:text-[22vw] font-black leading-[0.75] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-[#06090f]">
            PRDbot
          </h2>
        </motion.div>

        {/* Bottom Social & Copyright Band */}
        <div className="w-full flex flex-col md:flex-row justify-between items-center z-10 gap-6">
          <div className="flex items-center gap-3 text-[#8b949e]">
            <div className="flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] font-extrabold text-white">
                terminal
              </span>
            </div>
            <span className="text-[12px] font-bold tracking-widest uppercase text-[#c9d1d9]">
              {new Date().getFullYear()} PRDBOT.
            </span>
          </div>
          
          <div className="flex gap-6">
            <a
              className="text-[11px] text-[#8b949e] hover:text-white uppercase font-bold tracking-widest transition-colors"
              href="#"
            >
              Twitter
            </a>
            <a
              className="text-[11px] text-[#8b949e] hover:text-white uppercase font-bold tracking-widest transition-colors"
              href="#"
            >
              GitHub
            </a>
            <a
              className="text-[11px] text-[#8b949e] hover:text-white uppercase font-bold tracking-widest transition-colors"
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
