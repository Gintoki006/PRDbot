"use client";

import { motion } from "framer-motion";
import { GlowCard } from "../ui/spotlight-card";

const comparisons = [
  {
    title: "Issue Creation",
    before: "Product managers and developers manually write issues and hope they remembered all the edge cases from the scattered Notion PRDs.",
    after: "The moment a GitHub issue is opened, PRDbot instantly validates it against your active PRD and flags any missing requirements."
  },
  {
    title: "Scope Creep",
    before: "Developers start working on issues that include features or technical changes never approved in the original product specs.",
    after: "Rogue issues and scope creep are caught immediately. PRDbot warns the team if an issue goes off-script before any code is written."
  },
  {
    title: "Acceptance Criteria",
    before: "Issues are vaguely defined, leading to endless back-and-forth ping-pong between developers and PMs during the sprint.",
    after: "PRDbot automatically comments on the issue with the exact missing acceptance criteria sourced directly from your PRD."
  },
  {
    title: "Alignment",
    before: "The PRD gets written once, ignored by the engineering team, and becomes a stale document almost instantly.",
    after: "The PRD becomes an executable contract. Every single GitHub issue is tightly coupled to your single source of truth."
  }
];

export default function ProblemSolutionSection() {
  return (
    <section className="py-32 px-4 md:px-16 bg-[#06090f] relative overflow-hidden border-b border-[#30363d]">
      <div className="max-w-[1000px] mx-auto relative z-10">
        <div className="text-center mb-24 max-w-2xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6"
          >
            The old way is <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">broken</span>.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-[#8b949e] text-lg md:text-xl leading-relaxed"
          >
            See how PRDbot transforms the chaotic development pipeline into a streamlined, automated workflow.
          </motion.p>
        </div>

        <div className="flex flex-col gap-6 md:gap-4">
          {/* Header Row (Desktop) */}
          <div className="hidden md:grid grid-cols-2 gap-8 px-4 pb-4">
             <div className="flex items-center gap-3 text-red-400 font-bold text-xl">
               <span className="material-symbols-outlined text-2xl">warning</span> 
               Without PRDbot
             </div>
             <div className="flex items-center gap-3 text-[#238636] font-bold text-xl pl-4">
               <span className="material-symbols-outlined text-2xl">check_circle</span> 
               With PRDbot
             </div>
          </div>
          
          {comparisons.map((item, index) => (
             <motion.div 
               key={index}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ delay: index * 0.1, duration: 0.5 }}
               className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-8 relative"
             >
               {/* Label pill in the center on desktop, top on mobile */}
               <div className="md:absolute md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 z-20 flex justify-center mb-2 md:mb-0">
                  <span className="bg-[#0d1117] border border-[#30363d] text-white text-[11px] font-extrabold uppercase tracking-[0.2em] px-5 py-2 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                    {item.title}
                  </span>
               </div>
               
               {/* Before (Without PRDbot) */}
               <GlowCard glowColor="red" customSize={true} className="w-full h-full p-8 md:pr-16 group transition-colors relative overflow-hidden">
                  <div className="absolute inset-0 bg-red-950/10 pointer-events-none rounded-3xl"></div>
                  <div className="md:hidden flex items-center gap-2 text-red-400 font-bold text-sm mb-4">
                    <span className="material-symbols-outlined text-base">warning</span> 
                    Without PRDbot
                  </div>
                  <p className="text-[#8b949e] text-[15px] leading-relaxed relative z-10">{item.before}</p>
                  <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-red-500/5 text-8xl -rotate-12 pointer-events-none">close</span>
               </GlowCard>
               
               {/* After (With PRDbot) */}
               <GlowCard glowColor="green" customSize={true} className="w-full h-full p-8 md:pl-16 group transition-colors relative overflow-hidden">
                  <div className="absolute inset-0 bg-[#238636]/10 pointer-events-none rounded-3xl"></div>
                  <div className="md:hidden flex items-center gap-2 text-[#238636] font-bold text-sm mb-4">
                    <span className="material-symbols-outlined text-base">check_circle</span> 
                    With PRDbot
                  </div>
                  <p className="text-white text-[15px] leading-relaxed relative z-10">{item.after}</p>
                  <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-[#238636]/5 text-8xl -rotate-12 pointer-events-none">check</span>
               </GlowCard>
             </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
