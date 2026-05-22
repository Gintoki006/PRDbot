"use client";

import { motion } from "framer-motion";
import { GlowCard } from "../ui/spotlight-card";

const features = [
  {
    icon: "architecture",
    title: "Three-Pass Architecture",
    description: "Drift Detection, Quality Review, and Rule Enforcement work in unison to keep your implementation tightly aligned with the PRD. Never ship a misaligned feature again.",
    color: "text-gh-blue",
    bg: "bg-gh-blue/10",
    glowColor: "blue",
    className: "md:col-span-2 md:row-span-2",
    innerClassName: "flex flex-col justify-end p-8 md:p-12 overflow-hidden relative group h-full",
    titleSize: "text-2xl md:text-3xl lg:text-4xl",
    visual: (
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gh-blue/10 rounded-full blur-[80px] group-hover:bg-gh-blue/20 transition-colors duration-700"></div>
        <div className="absolute top-12 right-12 md:top-16 md:right-16 opacity-[0.05] group-hover:opacity-[0.15] group-hover:scale-110 transition-all duration-700 transform origin-center rotate-12">
           <span className="material-symbols-outlined text-[160px] text-white">account_tree</span>
        </div>
      </div>
    )
  },
  {
    icon: "speed",
    title: "Instant Feedback",
    description: "Receive actionable PR comments automatically within seconds.",
    color: "text-[#bf87ff]",
    bg: "bg-[#bf87ff]/10",
    glowColor: "purple",
    className: "md:col-span-1 md:row-span-1",
    innerClassName: "p-8 flex flex-col justify-between group overflow-hidden relative h-full",
    titleSize: "text-xl",
    visual: (
      <div className="absolute -bottom-8 -right-8 opacity-[0.03] group-hover:opacity-10 group-hover:-translate-y-2 group-hover:-translate-x-2 transition-all duration-500 pointer-events-none">
         <span className="material-symbols-outlined text-[120px] text-[#bf87ff]">speed</span>
      </div>
    )
  },
  {
    icon: "rule",
    title: "Precision",
    description: "Enforce strict design systems effortlessly.",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    glowColor: "orange",
    className: "md:col-span-1 md:row-span-1",
    innerClassName: "p-8 flex flex-col justify-between group overflow-hidden relative h-full",
    titleSize: "text-xl",
    visual: (
      <div className="absolute -bottom-8 -right-8 opacity-[0.03] group-hover:opacity-10 group-hover:-translate-y-2 group-hover:-translate-x-2 transition-all duration-500 pointer-events-none">
         <span className="material-symbols-outlined text-[120px] text-orange-400">rule</span>
      </div>
    )
  },
  {
    icon: "integration_instructions",
    title: "GitHub Native Integration",
    description: "Hook up your repositories with a single click. No massive CI/CD workflows to manually configure.",
    color: "text-gh-green",
    bg: "bg-gh-green/10",
    glowColor: "green",
    className: "md:col-span-3 md:row-span-1",
    innerClassName: "flex flex-col md:flex-row items-start md:items-center justify-between p-8 md:p-12 group overflow-hidden relative h-full",
    titleSize: "text-2xl md:text-3xl",
    visual: (
      <div className="hidden md:flex flex-1 items-center justify-end relative z-10 w-full mt-8 md:mt-0">
        <div className="flex items-center gap-6 bg-[#0d1117] p-6 rounded-2xl border border-gh-border shadow-inner group-hover:border-gh-green/30 transition-colors duration-500 z-20">
           <div className="flex flex-col items-center gap-2">
             <div className="w-12 h-12 rounded-full bg-gh-header border border-gh-border flex items-center justify-center shadow-lg">
               <span className="material-symbols-outlined text-2xl text-gh-text-secondary">folder</span>
             </div>
             <span className="text-[10px] text-gh-text-secondary font-mono uppercase tracking-widest">Repo</span>
           </div>
           <div className="w-24 h-[2px] bg-gh-border relative overflow-hidden">
              <div className="absolute inset-0 bg-gh-green/80 w-1/2 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out delay-100"></div>
           </div>
           <div className="flex flex-col items-center gap-2">
             <div className="w-12 h-12 rounded-full bg-gh-green/10 border border-gh-green/20 flex items-center justify-center shadow-lg group-hover:bg-gh-green/20 transition-colors duration-500">
               <span className="material-symbols-outlined text-2xl text-gh-green">check_circle</span>
             </div>
             <span className="text-[10px] text-gh-green font-mono uppercase tracking-widest">Connected</span>
           </div>
        </div>
      </div>
    )
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-32 px-4 md:px-16 bg-[#06090f] border-y border-gh-border relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gh-border to-transparent"></div>
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6"
          >
            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-gh-blue to-[#bf87ff]">precision</span>.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-gh-text-secondary text-lg md:text-xl leading-relaxed"
          >
            Everything you need to automate your product requirements pipeline, effortlessly integrated into your GitHub workflow.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[minmax(220px,auto)] gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
              className={feature.className}
            >
              <GlowCard 
                customSize={true} 
                glowColor={feature.glowColor}
                className={feature.innerClassName}
              >
                <div className="relative z-10 pointer-events-none">
                  <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 shadow-inner border border-white/5`}>
                    <span className={`material-symbols-outlined ${feature.color} text-3xl`}>
                      {feature.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className={`${feature.titleSize} font-bold text-white mb-3 tracking-tight`}>{feature.title}</h3>
                    <p className="text-[#8b949e] text-[15px] leading-relaxed max-w-md">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {feature.visual && feature.visual}
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
