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
    <section className="border-y border-gh-border bg-gh-header py-8 overflow-hidden">
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="max-w-[1280px] mx-auto px-4 flex flex-wrap justify-center items-center gap-12 grayscale"
      >
        <motion.div variants={item} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl">account_tree</span>
          <span className="font-bold text-lg text-white">GitLab</span>
        </motion.div>
        <motion.div variants={item} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl">code_blocks</span>
          <span className="font-bold text-lg text-white">Bitbucket</span>
        </motion.div>
        <motion.div variants={item} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl">hub</span>
          <span className="font-bold text-lg text-white">Azure DevOps</span>
        </motion.div>
        <motion.div variants={item} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-2xl">rocket_launch</span>
          <span className="font-bold text-lg text-white">Linear</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
