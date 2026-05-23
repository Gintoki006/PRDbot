"use client";

import { motion } from "framer-motion";

const statusConfig = {
  compliant: {
    classes: "border-green-500 bg-green-50 text-green-800 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30",
    icon: "check_circle",
  },
  warning: {
    classes: "border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/30",
    icon: "warning",
  },
  violation: {
    classes: "border-red-500 bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30",
    icon: "error",
  },
  error: {
    classes: "border-red-500 bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30",
    icon: "error",
  },
  flagged: {
    classes: "border-yellow-500 bg-yellow-50 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/30",
    icon: "warning",
  },
  default: {
    classes: "border-gray-500 bg-gray-50 text-gray-800 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/30",
    icon: "info",
  }
};

export default function AgentCard({ icon, title, status, score, finding, prUrl }) {
  const config = statusConfig[status?.toLowerCase()] || statusConfig.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`rounded-xl border p-4 flex flex-col justify-between h-full shadow-sm ${config.classes}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-xl">{icon}</span>
          <h3 className="font-semibold text-sm tracking-wide uppercase">{title}</h3>
        </div>
        <span className="material-symbols-outlined text-xl">{config.icon}</span>
      </div>

      <div className="mt-auto">
        {score !== undefined && score !== null && (
          <div className="text-2xl font-bold mb-1">
            {score}<span className="text-sm opacity-70 font-normal">/100</span>
          </div>
        )}
        {prUrl ? (
          <a
            href={prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline hover:opacity-80 transition-opacity break-all leading-relaxed"
          >
            View Pull Request →
          </a>
        ) : (
          <p className="text-sm opacity-90 line-clamp-2 leading-relaxed">
            {finding}
          </p>
        )}
      </div>
    </motion.div>
  );
}
