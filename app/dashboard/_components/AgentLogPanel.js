"use client";

import { useState, useEffect, useRef } from "react";
import supabaseClient from "../../../lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

import AgentCardGrid from "./AgentCardGrid";

const TYPE_STYLES = {
  info: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    icon: "info",
  },
  warning: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    icon: "warning",
  },
  tool_call: {
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    text: "text-purple-400",
    icon: "build",
  },
  success: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
    icon: "check_circle",
  },
  error: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    icon: "error",
  },
  drift: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    icon: "explore",
    label: "Drift Assessment",
  },
  ai_review: {
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/30",
    text: "text-indigo-400",
    icon: "assignment",
    label: "Quality Review",
  },
  rule_enforcement: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    icon: "fact_check",
    label: "Rule Enforcement",
  },
  verdict: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
    icon: "gavel",
    label: "Verdict",
  },
};

export default function AgentLogPanel({ repoFullName, isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [latestAction, setLatestAction] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!repoFullName || !isOpen) return;

    setLogs([]);
    setLatestAction(null);

    const channel = supabaseClient
      .channel(`agent:${repoFullName}`)
      .on("broadcast", { event: "agent-step" }, (message) => {
        const payload = message.payload;
        setLogs((prev) => [...prev, payload]);
        
        if (payload.type === 'verdict' && payload.status === 'done') {
          fetch(`/api/history?repoFullName=${encodeURIComponent(repoFullName)}&limit=1`)
            .then(r => r.json())
            .then(data => {
              if (data && data.length > 0) {
                setLatestAction(data[0]);
              }
            })
            .catch(console.error);
        }
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [repoFullName, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, latestAction]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="bg-gh-card-bg border border-gh-border rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden relative z-10"
          >
            <div className="p-4 border-b border-gh-border flex items-center justify-between bg-gh-header flex-none">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gh-blue text-lg">
                  terminal
                </span>
                <h2 className="text-lg font-semibold text-white">Agent Live Feed</h2>
                <span className="text-xs text-gh-text-secondary">
                  {repoFullName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {logs.length > 0 && (
                  <button
                    onClick={() => setLogs([])}
                    className="text-xs text-gh-text-secondary hover:text-white transition-colors px-2 py-1 rounded"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gh-text-secondary hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]"
            >
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gh-text-secondary py-12">
                  <span className="material-symbols-outlined text-4xl mb-3 animate-pulse">
                    radio_button_checked
                  </span>
                  <p className="text-sm">Waiting for agent activity...</p>
                  <p className="text-xs mt-1">
                    Logs will appear here in real-time
                  </p>
                </div>
              ) : (
                <div className="space-y-2 mb-6">
                  <AnimatePresence>
                    {logs.map((log, i) => {
                      const style = TYPE_STYLES[log.type] || TYPE_STYLES.info;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`flex items-start gap-2.5 p-3 rounded-lg border ${style.bg} ${style.border} transition-all`}
                        >
                          <span
                            className={`material-symbols-outlined text-[16px] mt-0.5 flex-none ${style.text}`}
                          >
                            {style.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-4">
                              <p className={`text-sm ${style.text}`}>
                                {style.label && <span className="font-semibold opacity-90 mr-1.5">[{style.label}]</span>}
                                {log.message}
                              </p>
                              {log.score !== undefined && (
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${style.border} ${style.text} ${style.bg}`}>
                                  {log.score}/100
                                </span>
                              )}
                            </div>
                            {log.timestamp && (
                              <p className="text-[10px] text-gh-text-secondary mt-1">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
              
              {latestAction && (
                <div className="border-t border-gh-border pt-6 mt-4">
                  <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Final Assessment Report</h3>
                  <AgentCardGrid action={latestAction} />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
