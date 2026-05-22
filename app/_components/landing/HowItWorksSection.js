"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Connect Your Repo",
    description: "Link your GitHub repository in seconds. No complex CI/CD pipelines to configure. PRDbot hooks directly into your workflow.",
    icon: "cable",
    color: "text-[#58a6ff]",
    bg: "bg-[#58a6ff]/10"
  },
  {
    num: "02",
    title: "Define the PRD",
    description: "Upload your markdown Product Requirement Document or link your issue tracker. PRDbot learns the exact constraints and goals of your feature.",
    icon: "markdown",
    color: "text-[#bf87ff]",
    bg: "bg-[#bf87ff]/10"
  },
  {
    num: "03",
    title: "Automated Issue Validation",
    description: "When someone opens a GitHub Issue, PRDbot automatically reviews the description against the PRD and leaves actionable feedback if it detects missing requirements or scope drift.",
    icon: "robot_2",
    color: "text-[#238636]",
    bg: "bg-[#238636]/10"
  }
];

const getGlowColor = (index) => {
  if (index === 0) return "rgba(88, 166, 255, 0.1)";
  if (index === 1) return "rgba(191, 135, 255, 0.1)";
  return "rgba(35, 134, 54, 0.1)";
};

const getGlowBorder = (index) => {
  if (index === 0) return "rgba(88, 166, 255, 0.3)";
  if (index === 1) return "rgba(191, 135, 255, 0.3)";
  return "rgba(35, 134, 54, 0.3)";
};

const getBaseBorder = (index) => {
  if (index === 0) return "rgba(88, 166, 255, 0.1)";
  if (index === 1) return "rgba(191, 135, 255, 0.1)";
  return "rgba(35, 134, 54, 0.1)";
};

const iconVariants = {
  animate: (i) => {
    let times;
    let valuesIndex;
    
    // Total cycle is 5s. Beam passes Icon 1 at 0s, Icon 2 at 2s (40%), Icon 3 at 4s (80%).
    if (i === 0) {
      times = [0, 0.05, 0.15, 0.95, 1];
      valuesIndex = [1, 0, 0, 0, 1]; // Peak at edges
    } else if (i === 1) {
      times = [0, 0.35, 0.4, 0.45, 1];
      valuesIndex = [0, 0, 1, 0, 0]; // Peak at 40%
    } else {
      times = [0, 0.75, 0.8, 0.85, 1];
      valuesIndex = [0, 0, 1, 0, 0]; // Peak at 80%
    }

    const baseShadow = `0px 0px 0px ${getGlowColor(i)}`;
    const peakShadow = `0px 0px 25px ${getGlowColor(i)}`;
    
    const baseBorder = getBaseBorder(i);
    const peakBorder = getGlowBorder(i);

    return {
      boxShadow: valuesIndex.map(v => v === 1 ? peakShadow : baseShadow),
      borderColor: valuesIndex.map(v => v === 1 ? peakBorder : baseBorder),
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "linear",
        times: times
      }
    };
  }
};

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-32 px-4 md:px-16 bg-[#0d1117] relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="text-center mb-24 max-w-2xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6"
          >
            How it <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#8b949e]">works</span>.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="text-[#8b949e] text-lg md:text-xl leading-relaxed"
          >
            Three simple steps to bridge the gap between product management and engineering.
          </motion.p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[40px] left-[16.67%] right-[16.67%] h-[2px] bg-gradient-to-r from-transparent via-[#30363d] to-transparent -z-10">
             {/* Animated scanning beam */}
             <motion.div 
               animate={{ 
                 left: ["0%", "5%", "50%", "95%", "100%", "100%"],
                 opacity: [0, 1, 1, 1, 0, 0]
               }}
               transition={{ duration: 5, ease: "linear", times: [0, 0.04, 0.4, 0.76, 0.8, 1], repeat: Infinity }}
               className="absolute top-[-1px] bottom-[-1px] w-[60px] -ml-[30px] bg-gradient-to-r from-transparent via-[#8b949e]/35 to-transparent blur-[1px]"
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="flex flex-col relative"
              >
                {/* Number / Icon header */}
                <div className="flex flex-col items-center mb-8">
                  <motion.div 
                    custom={index}
                    variants={iconVariants}
                    animate="animate"
                    style={{ borderColor: getBaseBorder(index) }}
                    className={`w-20 h-20 rounded-2xl ${step.bg} border-2 flex items-center justify-center mb-6 backdrop-blur-sm relative group transition-transform duration-300 hover:-translate-y-2`}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className={`material-symbols-outlined ${step.color} text-4xl relative z-10`}>
                      {step.icon}
                    </span>
                    {/* Floating Step Number */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center shadow-lg z-20">
                      <span className="text-[10px] font-black text-white">{step.num}</span>
                    </div>
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 text-center tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-[#8b949e] text-center leading-relaxed text-[15px] px-2 md:px-6">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
