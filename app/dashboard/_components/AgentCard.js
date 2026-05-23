import { motion } from "framer-motion";
import { GlowCard } from "../../_components/ui/spotlight-card";

const glowColorMap = {
  compliant: "green",
  warning: "orange",
  violation: "red",
  error: "red",
  flagged: "orange",
  default: "blue"
};

const borderMap = {
  compliant: "rgba(35, 134, 54, 0.3)",
  warning: "rgba(250, 180, 50, 0.3)",
  violation: "rgba(248, 81, 73, 0.3)",
  error: "rgba(248, 81, 73, 0.3)",
  flagged: "rgba(250, 180, 50, 0.3)",
  default: "rgba(48, 54, 61, 0.5)"
};

const statusConfig = {
  compliant: {
    classes: "text-green-400",
    icon: "check_circle",
  },
  warning: {
    classes: "text-yellow-400",
    icon: "warning",
  },
  violation: {
    classes: "text-red-400",
    icon: "error",
  },
  error: {
    classes: "text-red-400",
    icon: "error",
  },
  flagged: {
    classes: "text-yellow-400",
    icon: "warning",
  },
  default: {
    classes: "text-gh-text-secondary",
    icon: "info",
  }
};

export default function AgentCard({ icon, title, status, score, finding }) {
  const config = statusConfig[status?.toLowerCase()] || statusConfig.default;
  const normalizedStatus = status?.toLowerCase() || "default";
  const glowColor = glowColorMap[normalizedStatus] || glowColorMap.default;
  const borderColor = borderMap[normalizedStatus] || borderMap.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="h-full"
    >
      <GlowCard
        customSize={true}
        glowColor={glowColor}
        radius={16}
        style={{
          '--backup-border': borderColor,
          '--backdrop': 'rgba(13, 17, 23, 0.75)'
        }}
        className={`p-5 flex flex-col justify-between h-full border ${config.classes}`}
      >
        <div className="flex justify-between items-start mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">{icon}</span>
            <h3 className="font-semibold text-sm tracking-wide uppercase text-white">{title}</h3>
          </div>
          <span className="material-symbols-outlined text-xl">{config.icon}</span>
        </div>

        <div className="mt-auto relative z-10">
          {score !== undefined && score !== null && (
            <div className="text-2xl font-bold mb-1 text-white">
              {score}<span className="text-sm opacity-70 font-normal">/100</span>
            </div>
          )}
          <p className="text-sm opacity-90 line-clamp-2 leading-relaxed text-gh-text-secondary">
            {finding}
          </p>
        </div>
      </GlowCard>
    </motion.div>
  );
}
