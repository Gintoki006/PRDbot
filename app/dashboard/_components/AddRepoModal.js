"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "./Toast";

export default function AddRepoModal({ isOpen, onClose, onSuccess }) {
  const toast = useToast();
  const [repoFullName, setRepoFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!repoFullName.includes("/")) {
      setError("Format must be owner/repo (e.g., vercel/next.js)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoFullName: repoFullName.trim() }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to connect repository");
      }

      await onSuccess();
      toast.success("Repository connected successfully!");
      setRepoFullName("");
      onClose();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

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
            className="bg-gh-card-bg border border-gh-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative z-10"
          >
            <div className="p-4 border-b border-gh-border flex items-center justify-between bg-gh-header">
              <h2 className="text-lg font-semibold text-white">Connect Repository</h2>
              <button
                onClick={onClose}
                className="text-gh-text-secondary hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Repository Name
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 material-symbols-outlined text-gh-text-secondary text-lg">
                    bookmark
                  </span>
                  <input
                    type="text"
                    value={repoFullName}
                    onChange={(e) => setRepoFullName(e.target.value)}
                    placeholder="owner/repo"
                    disabled={loading}
                    className="w-full bg-gh-bg border border-gh-border text-white rounded-lg pl-10 pr-4 py-2 focus:ring-1 focus:ring-gh-blue focus:border-gh-blue outline-none transition-all placeholder-gh-text-secondary disabled:opacity-50"
                  />
                </div>
                <p className="text-xs text-gh-text-secondary mt-2">
                  Make sure you have access to this repository via your connected GitHub account.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start gap-2">
                  <span className="material-symbols-outlined text-red-400 text-sm mt-0.5">error</span>
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gh-text-main bg-transparent border border-transparent hover:bg-surface-variant rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !repoFullName}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gh-green hover:bg-gh-green-hover rounded-lg transition-colors disabled:opacity-50 border border-white/10"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      Connecting...
                    </>
                  ) : (
                    "Connect"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
