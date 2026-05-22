"use client";

import { useState, useEffect } from "react";
import { useToast } from "./Toast";

export default function PrdUploadModal({ isOpen, onClose, repo, onSuccess }) {
  const toast = useToast();
  const [prdText, setPrdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && repo) {
      setPrdText(repo.prd?.prdText || "");
      setError("");
    }
  }, [isOpen, repo]);

  if (!isOpen || !repo) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          repoFullName: repo.repoFullName,
          prdText 
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to save PRD");
      }

      await onSuccess();
      toast.success("PRD saved successfully!");
      onClose();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to delete this PRD?")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/prd?repoFullName=${encodeURIComponent(repo.repoFullName)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete PRD");
      
      await onSuccess();
      toast.info("PRD deleted.");
      onClose();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      setLoading(false);
    }
  };

  // Live heuristic preview
  const ruleCountPreview = (prdText || "").split("\n").filter(line => /^\s*[-*\d]\.?\s+/.test(line)).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gh-card-bg border border-gh-border rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gh-border flex items-center justify-between bg-gh-header flex-none">
          <div>
            <h2 className="text-lg font-semibold text-white">Product Requirements Document</h2>
            <p className="text-sm text-gh-text-secondary mt-0.5">{repo.repoFullName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gh-text-secondary hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 flex-1 overflow-y-auto min-h-[300px]">
            <label className="block text-sm font-medium text-white mb-2">
              Paste your PRD Rules (Markdown supported)
            </label>
            <textarea
              value={prdText}
              onChange={(e) => setPrdText(e.target.value)}
              placeholder="1. All new API routes must have basic rate limiting...&#10;2. Forms must display loading spinners during submission...&#10;..."
              disabled={loading}
              className="w-full h-[300px] md:h-[400px] bg-gh-bg border border-gh-border text-white rounded-lg p-4 focus:ring-1 focus:ring-gh-blue focus:border-gh-blue outline-none transition-all placeholder-gh-text-secondary disabled:opacity-50 font-mono text-sm resize-none"
            />
            
            <div className="flex justify-between items-center mt-3 text-xs text-gh-text-secondary px-1">
              <span>{prdText.length} characters</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">format_list_bulleted</span>
                ~{ruleCountPreview} rules detected
              </span>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start gap-2">
                <span className="material-symbols-outlined text-red-400 text-sm mt-0.5">error</span>
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gh-border flex justify-between items-center bg-gh-header flex-none">
            {repo.prd ? (
              <button
                type="button"
                onClick={handleRemove}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Delete PRD
              </button>
            ) : (
              <div></div> // Spacer
            )}

            <div className="flex gap-3">
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
                disabled={loading || !prdText.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gh-blue hover:bg-gh-blue/90 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    Saving...
                  </>
                ) : (
                  "Save PRD"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
