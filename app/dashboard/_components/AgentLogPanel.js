"use client";

import { useState, useEffect, useRef } from "react";
import supabaseClient from "../../../lib/supabase/client";

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
};

export default function AgentLogPanel({ repoFullName, isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!repoFullName || !isOpen) return;

    setLogs([]);

    const channel = supabaseClient
      .channel(`agent:${repoFullName}`)
      .on("broadcast", { event: "agent-step" }, (message) => {
        const payload = message.payload;
        setLogs((prev) => [...prev, payload]);
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [repoFullName, isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gh-card-bg border border-gh-border rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gh-border flex items-center justify-between bg-gh-header flex-none">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-gh-blue text-lg">
              terminal
            </span>
            <h2 className="text-lg font-semibold text-white">Agent Log</h2>
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
          className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[200px]"
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
            logs.map((log, i) => {
              const style = TYPE_STYLES[log.type] || TYPE_STYLES.info;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 p-3 rounded-lg border ${style.bg} ${style.border} transition-all animate-in fade-in slide-in-from-bottom-1 duration-200`}
                >
                  <span
                    className={`material-symbols-outlined text-[16px] mt-0.5 flex-none ${style.text}`}
                  >
                    {style.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${style.text}`}>{log.message}</p>
                    {log.timestamp && (
                      <p className="text-[10px] text-gh-text-secondary mt-1">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
