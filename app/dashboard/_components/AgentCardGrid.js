"use client";

import AgentCard from "./AgentCard";
import { motion } from "framer-motion";

export default function AgentCardGrid({ action }) {
  if (!action) return null;

  // Safely extract the first AI finding from potentially stringified JSON
  const getAiFinding = (findings) => {
    if (!findings) return 'Strategically aligned.';
    if (Array.isArray(findings) && findings.length > 0) return findings[0];
    if (typeof findings === 'string') {
      try {
        const parsed = JSON.parse(findings);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch (e) {
        return findings;
      }
    }
    return 'Strategically aligned.';
  };

  // Map legacy overall status to strict card status
  const mapVerdictStatus = (status) => {
    if (status === "violated" || status === "error") return "violation";
    if (status === "flagged") return "warning";
    return "compliant";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <AgentCard
        icon="explore"
        title="Drift Agent"
        status={action.driftStatus || "compliant"}
        score={action.driftScore}
        finding={action.driftReason || 'No drift detected.'}
      />
      <AgentCard
        icon="assignment"
        title="PM Agent"
        status={action.aiReviewStatus || "compliant"}
        score={action.alignmentScore}
        finding={getAiFinding(action.aiFindings)}
      />
      <AgentCard
        icon="fact_check"
        title="QA Agent"
        status={action.ruleEnforcementStatus || "compliant"}
        finding={action.ruleQuoted || 'All rules satisfied.'}
      />
      <AgentCard
        icon="gavel"
        title="Verdict"
        status={mapVerdictStatus(action.status)}
        finding={action.result || 'Evaluation complete.'}
      />
    </motion.div>
  );
}
