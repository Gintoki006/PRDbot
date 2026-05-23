"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "./Toast";

// Helper to convert PRD JSON structure to markdown string
function convertJsonToMarkdown(prd) {
  let md = `# Product Requirements Document: ${prd.prdTitle}\n\n`;
  md += `## Overview\n${prd.overview}\n\n`;
  
  md += `## Target Users\n`;
  if (prd.targetUsers && prd.targetUsers.length > 0) {
    prd.targetUsers.forEach(user => { md += `- ${user}\n`; });
  } else {
    md += `- None specified\n`;
  }
  md += `\n`;

  md += `## Core Goals\n`;
  if (prd.coreGoals && prd.coreGoals.length > 0) {
    prd.coreGoals.forEach(goal => { md += `- ${goal}\n`; });
  } else {
    md += `- None specified\n`;
  }
  md += `\n`;

  md += `## Out of Scope\n`;
  if (prd.outOfScope && prd.outOfScope.length > 0) {
    prd.outOfScope.forEach(item => { md += `- ${item}\n`; });
  } else {
    md += `- None specified\n`;
  }
  md += `\n`;

  md += `## Anti-Patterns\n`;
  if (prd.antiPatterns && prd.antiPatterns.length > 0) {
    prd.antiPatterns.forEach(pattern => { md += `- ${pattern}\n`; });
  } else {
    md += `- None specified\n`;
  }
  md += `\n`;

  md += `## Explicit Rules\n`;
  if (prd.explicitRules && prd.explicitRules.length > 0) {
    prd.explicitRules.forEach(ruleObj => {
      md += `- **Rule:** ${ruleObj.rule} *(Source: ${ruleObj.source})*\n`;
    });
  } else {
    md += `- None specified\n`;
  }
  md += `\n`;

  md += `## Roadmap Objectives\n`;
  if (prd.roadmapObjectives && prd.roadmapObjectives.length > 0) {
    prd.roadmapObjectives.forEach(obj => { md += `- ${obj}\n`; });
  } else {
    md += `- None specified\n`;
  }
  md += `\n`;

  md += `## Tech Stack\n`;
  if (prd.techStack && prd.techStack.length > 0) {
    prd.techStack.forEach(tech => { md += `- ${tech}\n`; });
  } else {
    md += `- None specified\n`;
  }
  md += `\n`;
  
  return md;
}

export default function PrdGeneratorModal({ isOpen, onClose, repo, onSuccess }) {
  const toast = useToast();
  const [status, setStatus] = useState("idle"); // idle, loading, ready, saving
  const [progressMsg, setProgressMsg] = useState("");
  const [error, setError] = useState("");
  
  // Generated PRD state
  const [prdData, setPrdData] = useState(null);

  useEffect(() => {
    if (isOpen && repo) {
      setStatus("loading");
      setError("");
      setPrdData(null);
      generatePrd();
    }
  }, [isOpen, repo]);

  const generatePrd = async () => {
    setProgressMsg("Connecting to GitHub...");
    try {
      // Step 1: Connecting / Fetching signals
      await new Promise(r => setTimeout(r, 800));
      setProgressMsg("Extracting codebase signals (README, open issues, PRs)...");
      
      const res = await fetch("/api/prd/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoFullName: repo.repoFullName }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "PRD generation failed");
      }

      setProgressMsg("Synthesizing product requirements document using AI...");
      await new Promise(r => setTimeout(r, 600));

      const data = await res.json();
      
      // Post-process rules and fields to determine needsReview
      const needsReview = checkIfNeedsReview(data);
      setPrdData({ ...data, needsReview });
      setStatus("ready");
    } catch (err) {
      console.error(err);
      setError(err.message);
      setStatus("idle");
      toast.error(err.message);
    }
  };

  const checkIfNeedsReview = (data) => {
    const checkText = (text) => typeof text === "string" && text.includes("[NEEDS REVIEW]");
    const checkArr = (arr) => Array.isArray(arr) && arr.some(item => typeof item === "string" && item.includes("[NEEDS REVIEW]"));
    const checkRules = (rules) => Array.isArray(rules) && rules.some(r => checkText(r.rule));
    
    return (
      checkText(data.prdTitle) ||
      checkText(data.overview) ||
      checkArr(data.targetUsers) ||
      checkArr(data.coreGoals) ||
      checkArr(data.outOfScope) ||
      checkArr(data.antiPatterns) ||
      checkRules(data.explicitRules) ||
      checkArr(data.roadmapObjectives)
    );
  };

  const handleFieldChange = (field, value) => {
    setPrdData(prev => {
      const updated = { ...prev, [field]: value };
      updated.needsReview = checkIfNeedsReview(updated);
      return updated;
    });
  };

  const handleArrayChange = (field, index, value) => {
    setPrdData(prev => {
      const updatedArr = [...prev[field]];
      updatedArr[index] = value;
      const updated = { ...prev, [field]: updatedArr };
      updated.needsReview = checkIfNeedsReview(updated);
      return updated;
    });
  };

  const handleRuleChange = (index, value) => {
    setPrdData(prev => {
      const updatedRules = [...prev.explicitRules];
      updatedRules[index] = { ...updatedRules[index], rule: value };
      const updated = { ...prev, explicitRules: updatedRules };
      updated.needsReview = checkIfNeedsReview(updated);
      return updated;
    });
  };

  const handleSave = async () => {
    setStatus("saving");
    setError("");

    try {
      const markdown = convertJsonToMarkdown(prdData);
      
      // Identity metadata schema formatting
      const prdMeta = {
        prdTitle: prdData.prdTitle,
        coreFocus: prdData.overview,
        targetUsers: prdData.targetUsers,
        coreGoals: prdData.coreGoals,
        outOfScope: prdData.outOfScope,
        antiPatterns: prdData.antiPatterns,
        explicitRules: prdData.explicitRules,
        roadmapObjectives: prdData.roadmapObjectives,
        techStack: prdData.techStack,
        confidence: prdData.confidence
      };

      const res = await fetch("/api/prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoFullName: repo.repoFullName,
          prdText: markdown,
          prdMeta,
          source: "auto_generated",
          autoGenMeta: prdData.autoGenMeta,
          needsReview: prdData.needsReview
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to save auto-generated PRD");
      }

      await onSuccess();
      toast.success("Auto-generated PRD saved successfully!");
      onClose();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      setStatus("ready");
    }
  };

  const getSourceBadge = (source) => {
    switch (source) {
      case "readme":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">📄 README</span>;
      case "issue":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30">🐛 Issues</span>;
      case "pr":
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">🔀 PRs</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">🤖 Inferred</span>;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && repo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={status !== "loading" && status !== "saving" ? onClose : undefined}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-gh-card-bg border border-gh-border rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden relative z-10"
          >
            {/* Header */}
            <div className="p-4 border-b border-gh-border flex items-center justify-between bg-gh-header flex-none">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-gh-blue text-[20px]">sparkles</span>
                  PRD Auto-Writer & Scan
                </h2>
                <p className="text-xs text-gh-text-secondary mt-0.5">{repo.repoFullName}</p>
              </div>
              {status !== "loading" && status !== "saving" && (
                <button
                  onClick={onClose}
                  className="text-gh-text-secondary hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              )}
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
              {status === "loading" && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-full border-2 border-gh-blue/20 border-t-gh-blue animate-spin" />
                    <span className="material-symbols-outlined text-gh-blue text-[24px] absolute inset-0 m-auto w-fit h-fit animate-pulse">
                      explore
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">Analyzing Repository</h3>
                  <p className="text-sm text-gh-text-secondary text-center max-w-md animate-pulse">
                    {progressMsg}
                  </p>
                </div>
              )}

              {error && status !== "loading" && (
                <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start gap-2 mb-6">
                  <span className="material-symbols-outlined text-red-400 text-sm mt-0.5">error</span>
                  <div>
                    <h4 className="text-sm font-semibold text-red-400">Generation Failed</h4>
                    <p className="text-sm text-red-400/80 mt-1">{error}</p>
                    <button
                      onClick={generatePrd}
                      className="mt-3 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-white rounded text-xs font-semibold border border-red-500/30 transition-all"
                    >
                      Retry Generation
                    </button>
                  </div>
                </div>
              )}

              {status === "ready" && prdData && (
                <div className="space-y-6">
                  {/* Confidence Banner */}
                  <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    prdData.confidence.overall >= 60 
                      ? 'bg-gh-green/5 border-gh-green/20' 
                      : 'bg-yellow-500/5 border-yellow-500/20'
                  }`}>
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        Confidence Score: <span className={prdData.confidence.overall >= 60 ? "text-gh-green" : "text-yellow-500"}>
                          {prdData.confidence.overall}%
                        </span>
                      </h3>
                      <p className="text-xs text-gh-text-secondary mt-1 max-w-xl">
                        {prdData.confidence.notes || "Based on available README, issues, and PR signals."}
                      </p>
                    </div>
                    {prdData.needsReview && (
                      <div className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-500 text-xs font-semibold border border-yellow-500/20 flex items-center gap-1.5 w-fit">
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                        Requires Review
                      </div>
                    )}
                  </div>

                  {/* Title & Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    <div className="md:col-span-1">
                      <h4 className="text-sm font-semibold text-white">Identity & Overview</h4>
                      <p className="text-xs text-gh-text-secondary mt-1">General product details synthesized from repository data.</p>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <label className="block text-xs text-gh-text-secondary mb-1">Product Title</label>
                        <input
                          type="text"
                          value={prdData.prdTitle}
                          onChange={(e) => handleFieldChange("prdTitle", e.target.value)}
                          className={`w-full bg-gh-bg border text-sm text-white rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-gh-blue ${
                            prdData.prdTitle.includes("[NEEDS REVIEW]") ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-gh-border'
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gh-text-secondary mb-1">Overview Description</label>
                        <textarea
                          rows={3}
                          value={prdData.overview}
                          onChange={(e) => handleFieldChange("overview", e.target.value)}
                          className={`w-full bg-gh-bg border text-sm text-white rounded-lg p-3 outline-none focus:ring-1 focus:ring-gh-blue resize-none ${
                            prdData.overview.includes("[NEEDS REVIEW]") ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-gh-border'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="border-gh-border" />

                  {/* Persona & Goals */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Target Personas & Goals</h4>
                      <p className="text-xs text-gh-text-secondary mt-1">Stated focus and users parsed from signals.</p>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      {/* Target Users */}
                      <div>
                        <label className="block text-xs text-gh-text-secondary mb-1.5 flex items-center justify-between">
                          <span>Target User Personas</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">🤖 Inferred</span>
                        </label>
                        <div className="space-y-2">
                          {prdData.targetUsers.map((user, i) => (
                            <input
                              key={i}
                              type="text"
                              value={user}
                              onChange={(e) => handleArrayChange("targetUsers", i, e.target.value)}
                              className={`w-full bg-gh-bg border text-sm text-white rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-gh-blue ${
                                user.includes("[NEEDS REVIEW]") ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-gh-border'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Core Goals */}
                      <div>
                        <label className="block text-xs text-gh-text-secondary mb-1.5 flex items-center justify-between">
                          <span>Core Goals</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">🤖 Inferred</span>
                        </label>
                        <div className="space-y-2">
                          {prdData.coreGoals.map((goal, i) => (
                            <input
                              key={i}
                              type="text"
                              value={goal}
                              onChange={(e) => handleArrayChange("coreGoals", i, e.target.value)}
                              className={`w-full bg-gh-bg border text-sm text-white rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-gh-blue ${
                                goal.includes("[NEEDS REVIEW]") ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-gh-border'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gh-border" />

                  {/* Scope & Anti-Patterns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Out of Scope & Anti-patterns</h4>
                      <p className="text-xs text-gh-text-secondary mt-1">Delineating boundaries based on what was rejected or marked out of scope in issues/PRs.</p>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      {/* Out of Scope */}
                      <div>
                        <label className="block text-xs text-gh-text-secondary mb-1.5">Out of Scope Items</label>
                        <div className="space-y-2">
                          {prdData.outOfScope.map((item, i) => (
                            <input
                              key={i}
                              type="text"
                              value={item}
                              onChange={(e) => handleArrayChange("outOfScope", i, e.target.value)}
                              className={`w-full bg-gh-bg border text-sm text-white rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-gh-blue ${
                                item.includes("[NEEDS REVIEW]") ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-gh-border'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Anti-Patterns */}
                      <div>
                        <label className="block text-xs text-gh-text-secondary mb-1.5">Anti-patterns to Avoid</label>
                        <div className="space-y-2">
                          {prdData.antiPatterns.map((pattern, i) => (
                            <input
                              key={i}
                              type="text"
                              value={pattern}
                              onChange={(e) => handleArrayChange("antiPatterns", i, e.target.value)}
                              className={`w-full bg-gh-bg border text-sm text-white rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-gh-blue ${
                                pattern.includes("[NEEDS REVIEW]") ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-gh-border'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gh-border" />

                  {/* Explicit Rules */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Explicit Enforcement Rules</h4>
                      <p className="text-xs text-gh-text-secondary mt-1">Specific criteria extracted from code guidelines, workflow labels, and templates.</p>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      {prdData.explicitRules.length === 0 ? (
                        <p className="text-sm text-gh-text-secondary italic">No explicit rules identified.</p>
                      ) : (
                        <div className="space-y-4">
                          {prdData.explicitRules.map((ruleObj, i) => (
                            <div key={i} className="flex flex-col gap-1.5 p-3 rounded-lg bg-surface-variant/30 border border-gh-border">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] text-gh-text-secondary font-mono">Rule #{i + 1}</span>
                                {getSourceBadge(ruleObj.source)}
                              </div>
                              <input
                                type="text"
                                value={ruleObj.rule}
                                onChange={(e) => handleRuleChange(i, e.target.value)}
                                className={`w-full bg-gh-bg border text-sm text-white rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-gh-blue ${
                                  ruleObj.rule.includes("[NEEDS REVIEW]") ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-gh-border'
                                }`}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <hr className="border-gh-border" />

                  {/* Roadmap & Tech Stack */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Roadmap & Tech Stack</h4>
                      <p className="text-xs text-gh-text-secondary mt-1">Technical baseline and roadmap objectives identified.</p>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      {/* Roadmap Objectives */}
                      <div>
                        <label className="block text-xs text-gh-text-secondary mb-1.5">Roadmap Objectives</label>
                        <div className="space-y-2">
                          {prdData.roadmapObjectives.map((obj, i) => (
                            <input
                              key={i}
                              type="text"
                              value={obj}
                              onChange={(e) => handleArrayChange("roadmapObjectives", i, e.target.value)}
                              className={`w-full bg-gh-bg border text-sm text-white rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-gh-blue ${
                                obj.includes("[NEEDS REVIEW]") ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-gh-border'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Tech Stack */}
                      <div>
                        <label className="block text-xs text-gh-text-secondary mb-1.5">Identified Tech Stack</label>
                        <div className="flex flex-wrap gap-2">
                          {prdData.techStack.map((tech, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded bg-gh-border text-xs text-white border border-white/5"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-gh-border flex justify-between items-center bg-gh-header flex-none">
              <div>
                {status === "ready" && prdData && prdData.needsReview && (
                  <span className="text-xs text-yellow-500 font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Clear [NEEDS REVIEW] flags before saving for full confidence.
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={status === "loading" || status === "saving"}
                  className="px-4 py-2 text-sm font-medium text-gh-text-main bg-transparent border border-transparent hover:bg-surface-variant rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                {status === "ready" && (
                  <button
                    onClick={handleSave}
                    disabled={status === "saving"}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gh-blue hover:bg-gh-blue/90 rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-gh-blue/20"
                  >
                    {status === "saving" ? (
                      <>
                        <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                        Activating PRD...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">publish</span>
                        Use This PRD
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
