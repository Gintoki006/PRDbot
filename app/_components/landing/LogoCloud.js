"use client";

import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 0.5, y: 0, transition: { duration: 0.5 } } // keeping the 50% opacity design
};

export default function LogoCloud() {
  return (
    <section className="border-y border-gh-border bg-[#0d1117] py-12 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 flex flex-col items-center">
        <p className="text-[#8b949e] text-sm font-semibold uppercase tracking-widest mb-8 text-center">
          Trusted by engineering teams at
        </p>
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-wrap justify-center items-center gap-12 md:gap-16 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
        >
          <motion.div variants={item} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">hub</span>
            <span className="font-bold text-xl tracking-tight text-white">Nexus</span>
          </motion.div>
          <motion.div variants={item} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">token</span>
            <span className="font-bold text-xl tracking-tight text-white">Quantum</span>
          </motion.div>
          <motion.div variants={item} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">polyline</span>
            <span className="font-bold text-xl tracking-tight text-white">Vertex</span>
          </motion.div>
          <motion.div variants={item} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">change_history</span>
            <span className="font-bold text-xl tracking-tight text-white">Zenith</span>
          </motion.div>
          <motion.div variants={item} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl">flare</span>
            <span className="font-bold text-xl tracking-tight text-white">Lumina</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
