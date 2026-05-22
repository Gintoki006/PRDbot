"use client";

import { useState, useEffect, useCallback } from "react";

const STATUS_STYLES = {
  compliant: {
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    text: "text-green-400",
    label: "Compliant",
  },
  violated: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    label: "Violated",
  },
  flagged: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    label: "Flagged",
  },
  error: {
    bg: "bg-gray-500/10",
    border: "border-gray-500/30",
    text: "text-gray-400",
    label: "Error",
  },
};

export default function HistoryTable({ repoFullName }) {
  const [actions, setActions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const limit = 15;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (repoFullName) params.set("repoFullName", repoFullName);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/history?${params}`);
      if (res.ok) {
        const data = await res.json();
        setActions(data.data);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, repoFullName]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, repoFullName]);

  return (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-none">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gh-text-secondary">{total} actions</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gh-bg border border-gh-border text-white rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-gh-blue focus:border-gh-blue outline-none"
        >
          <option value="">All statuses</option>
          <option value="compliant">Compliant</option>
          <option value="violated">Violated</option>
          <option value="flagged">Flagged</option>
          <option value="error">Error</option>
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border border-gh-border rounded-xl">
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <span className="material-symbols-outlined text-gh-text-secondary animate-spin text-2xl">
              progress_activity
            </span>
          </div>
        ) : actions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gh-text-secondary">
            <span className="material-symbols-outlined text-4xl mb-3">
              inventory_2
            </span>
            <p className="text-sm">No agent actions yet</p>
            <p className="text-xs mt-1">
              Create an issue or run a simulation to see results here
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gh-header sticky top-0 z-10">
              <tr className="border-b border-gh-border">
                <th className="px-4 py-3 text-left text-xs font-medium text-gh-text-secondary uppercase tracking-wider">
                  Issue
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gh-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gh-text-secondary uppercase tracking-wider hidden md:table-cell">
                  Tool
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gh-text-secondary uppercase tracking-wider hidden md:table-cell">
                  Confidence
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gh-text-secondary uppercase tracking-wider hidden lg:table-cell">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gh-border">
              {actions.map((action) => {
                const style = STATUS_STYLES[action.status] || STATUS_STYLES.error;
                const isExpanded = expandedRow === action.id;

                return (
                  <tr key={action.id} className="group">
                    <td colSpan={5} className="p-0">
                      <button
                        onClick={() =>
                          setExpandedRow(isExpanded ? null : action.id)
                        }
                        className="w-full text-left hover:bg-surface-variant/50 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="px-4 py-3 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium truncate">
                                {action.issueNumber > 0
                                  ? `#${action.issueNumber}`
                                  : "SIM"}
                              </span>
                              <span className="text-gh-text-main truncate">
                                {action.issueTitle || "Untitled"}
                              </span>
                              {action.simulated && (
                                <span className="flex-none px-1.5 py-0.5 text-[10px] font-medium border border-purple-500/40 text-purple-400 rounded">
                                  SIM
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="px-4 py-3 flex-none">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.border} ${style.text}`}
                            >
                              {style.label}
                            </span>
                          </div>
                          <div className="px-4 py-3 flex-none hidden md:block text-gh-text-secondary">
                            {action.toolCalled !== "none"
                              ? action.toolCalled
                              : "—"}
                          </div>
                          <div className="px-4 py-3 flex-none hidden md:block text-gh-text-secondary">
                            {action.confidence > 0
                              ? `${action.confidence}%`
                              : "—"}
                          </div>
                          <div className="px-4 py-3 flex-none hidden lg:block text-gh-text-secondary text-xs">
                            {new Date(action.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 bg-surface-variant/30 border-t border-gh-border space-y-3">
                          {action.ruleQuoted && (
                            <div>
                              <p className="text-xs font-medium text-gh-text-secondary uppercase tracking-wider mb-1">
                                Rule Quoted
                              </p>
                              <blockquote className="border-l-2 border-gh-blue pl-3 text-sm text-gh-text-main italic">
                                {action.ruleQuoted}
                              </blockquote>
                            </div>
                          )}
                          {action.result && (
                            <div>
                              <p className="text-xs font-medium text-gh-text-secondary uppercase tracking-wider mb-1">
                                Result
                              </p>
                              <p className="text-sm text-gh-text-main whitespace-pre-wrap">
                                {action.result}
                              </p>
                            </div>
                          )}
                          <div className="flex gap-4 text-xs text-gh-text-secondary">
                            <span>
                              Iterations: {action.iterationCount}
                            </span>
                            <span>Repo: {action.repoFullName}</span>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 flex-none">
          <p className="text-xs text-gh-text-secondary">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 text-sm bg-surface-variant text-white border border-gh-border rounded-lg disabled:opacity-50 hover:bg-gh-border transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 text-sm bg-surface-variant text-white border border-gh-border rounded-lg disabled:opacity-50 hover:bg-gh-border transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
