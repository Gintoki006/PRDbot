"use client";

import { useState } from "react";

export default function SimulatePanel({ repo, isOpen, onClose, onStarted }) {
  const [issueTitle, setIssueTitle] = useState("");
  const [issueBody, setIssueBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !repo) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoFullName: repo.repoFullName,
          issueTitle,
          issueBody,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to start simulation");
      }

      // Simulation started — open the agent log panel
      onStarted?.();
      setIssueTitle("");
      setIssueBody("");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gh-card-bg border border-gh-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-4 border-b border-gh-border flex items-center justify-between bg-gh-header">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-gh-blue text-lg">
                science
              </span>
              Simulate Issue
            </h2>
            <p className="text-sm text-gh-text-secondary mt-0.5">
              {repo.repoFullName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gh-text-secondary hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Issue Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              placeholder='e.g. "Add dark mode toggle to settings page"'
              disabled={loading}
              className="w-full bg-gh-bg border border-gh-border text-white rounded-lg px-4 py-2 focus:ring-1 focus:ring-gh-blue focus:border-gh-blue outline-none transition-all placeholder-gh-text-secondary disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Issue Body{" "}
              <span className="text-gh-text-secondary font-normal">
                (optional)
              </span>
            </label>
            <textarea
              value={issueBody}
              onChange={(e) => setIssueBody(e.target.value)}
              placeholder="Describe the issue in detail..."
              disabled={loading}
              rows={5}
              className="w-full bg-gh-bg border border-gh-border text-white rounded-lg px-4 py-2 focus:ring-1 focus:ring-gh-blue focus:border-gh-blue outline-none transition-all placeholder-gh-text-secondary disabled:opacity-50 resize-none"
            />
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-start gap-2">
            <span className="material-symbols-outlined text-blue-400 text-sm mt-0.5">
              info
            </span>
            <p className="text-xs text-blue-400">
              Simulation mode evaluates the issue against your PRD without
              posting anything on GitHub.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start gap-2">
              <span className="material-symbols-outlined text-red-400 text-sm mt-0.5">
                error
              </span>
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
              disabled={loading || !issueTitle.trim()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gh-blue hover:bg-gh-blue/90 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                  Starting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">
                    play_arrow
                  </span>
                  Run Simulation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
