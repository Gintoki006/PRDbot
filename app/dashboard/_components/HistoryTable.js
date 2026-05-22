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
  warning: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    label: "Warning",
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

function ScoreBadge({ score }) {
  if (score === null || score === undefined) return <span className="text-gh-text-secondary">—</span>;
  
  let color = "text-green-400 border-green-500/30 bg-green-500/10";
  if (score < 60) color = "text-red-400 border-red-500/30 bg-red-500/10";
  else if (score < 90) color = "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";

  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {score}/100
    </span>
  );
}

function RulesBadge({ rulesString }) {
  const count = rulesString ? rulesString.split('\n').filter(Boolean).length : 0;
  if (count === 0) {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border text-green-400 border-green-500/30 bg-green-500/10">0</span>;
  }
  return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium border text-red-400 border-red-500/30 bg-red-500/10">{count}</span>;
}

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

  const parseJsonSafe = (jsonStr, fallback = []) => {
    if (!jsonStr) return fallback;
    if (typeof jsonStr !== 'string') return Array.isArray(jsonStr) ? jsonStr : fallback;
    try {
      const parsed = JSON.parse(jsonStr);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  };

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
                <th className="px-4 py-3 text-left text-xs font-medium text-gh-text-secondary uppercase tracking-wider hidden lg:table-cell">
                  Drift
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gh-text-secondary uppercase tracking-wider hidden lg:table-cell">
                  Alignment
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gh-text-secondary uppercase tracking-wider hidden lg:table-cell">
                  Rules
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gh-text-secondary uppercase tracking-wider hidden md:table-cell">
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
                    <td colSpan={6} className="p-0">
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
                          <div className="px-4 py-3 w-32 flex-none">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.border} ${style.text}`}
                            >
                              {style.label}
                            </span>
                          </div>
                          <div className="px-4 py-3 w-24 flex-none hidden lg:block">
                            <ScoreBadge score={action.driftScore} />
                          </div>
                          <div className="px-4 py-3 w-24 flex-none hidden lg:block">
                            <ScoreBadge score={action.alignmentScore} />
                          </div>
                          <div className="px-4 py-3 w-20 flex-none hidden lg:block">
                            <RulesBadge rulesString={action.ruleQuoted} />
                          </div>
                          <div className="px-4 py-3 w-40 flex-none hidden md:block text-gh-text-secondary text-xs">
                            {new Date(action.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-6 pb-6 pt-2 bg-surface-variant/30 border-t border-gh-border space-y-6">
                          
                          {/* Drift Detection Section */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="col-span-1 md:col-span-1 bg-gh-card-bg border border-gh-border p-4 rounded-xl">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                  <span className="material-symbols-outlined text-cyan-400 text-[18px]">explore</span>
                                  Drift Assessment
                                </h4>
                                <span className={`text-xs px-2 py-0.5 rounded uppercase tracking-wider font-medium ${STATUS_STYLES[action.driftStatus || 'compliant']?.bg} ${STATUS_STYLES[action.driftStatus || 'compliant']?.text}`}>
                                  {action.driftStatus || 'compliant'}
                                </span>
                              </div>
                              <p className="text-xs text-gh-text-secondary mb-2">
                                <strong className="text-gh-text-main">Score:</strong> {action.driftScore || 0}/100
                              </p>
                              {action.driftStatus !== 'compliant' && action.driftType !== 'none' && (
                                <p className="text-xs text-gh-text-secondary mb-2">
                                  <strong className="text-gh-text-main">Type:</strong> {action.driftType}
                                </p>
                              )}
                              <p className="text-sm text-gh-text-main leading-relaxed">
                                {action.driftReason || 'No significant drift detected.'}
                              </p>
                              {action.driftSuggestedAlt && (
                                <div className="mt-3 bg-cyan-500/10 border border-cyan-500/20 p-2 rounded text-xs text-cyan-300">
                                  <strong>Alternative:</strong> {action.driftSuggestedAlt}
                                </div>
                              )}
                            </div>

                            {/* AI Issue Review Section */}
                            <div className="col-span-1 md:col-span-1 bg-gh-card-bg border border-gh-border p-4 rounded-xl">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                  <span className="material-symbols-outlined text-indigo-400 text-[18px]">assignment</span>
                                  Quality Review
                                </h4>
                                <span className={`text-xs px-2 py-0.5 rounded uppercase tracking-wider font-medium ${STATUS_STYLES[action.aiReviewStatus || 'compliant']?.bg} ${STATUS_STYLES[action.aiReviewStatus || 'compliant']?.text}`}>
                                  {action.aiReviewStatus || 'compliant'}
                                </span>
                              </div>
                              <p className="text-xs text-gh-text-secondary mb-3">
                                <strong className="text-gh-text-main">Alignment:</strong> {action.alignmentScore || 0}/100
                              </p>
                              
                              {parseJsonSafe(action.aiFindings).length > 0 && (
                                <div className="mb-3">
                                  <strong className="text-xs text-gh-text-main block mb-1">Findings:</strong>
                                  <ul className="list-disc pl-4 text-xs text-gh-text-secondary space-y-1">
                                    {parseJsonSafe(action.aiFindings).map((finding, idx) => (
                                      <li key={idx}>{finding}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {parseJsonSafe(action.aiMissing).length > 0 && (
                                <div>
                                  <strong className="text-xs text-gh-text-main block mb-1">Missing Info:</strong>
                                  <ul className="list-disc pl-4 text-xs text-gh-text-secondary space-y-1">
                                    {parseJsonSafe(action.aiMissing).map((missing, idx) => (
                                      <li key={idx}>{missing}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {/* Rule Enforcement Section */}
                            <div className="col-span-1 md:col-span-1 bg-gh-card-bg border border-gh-border p-4 rounded-xl">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                  <span className="material-symbols-outlined text-emerald-400 text-[18px]">fact_check</span>
                                  Rule Enforcement
                                </h4>
                                <span className={`text-xs px-2 py-0.5 rounded uppercase tracking-wider font-medium ${STATUS_STYLES[action.ruleEnforcementStatus || 'compliant']?.bg} ${STATUS_STYLES[action.ruleEnforcementStatus || 'compliant']?.text}`}>
                                  {action.ruleEnforcementStatus || 'compliant'}
                                </span>
                              </div>
                              
                              {action.ruleQuoted ? (
                                <div className="mb-3">
                                  <strong className="text-xs text-gh-text-main block mb-1">Rules Violated:</strong>
                                  <div className="space-y-2">
                                    {action.ruleQuoted.split('\n').filter(Boolean).map((rule, idx) => (
                                      <blockquote key={idx} className="border-l-2 border-emerald-500 pl-2 text-xs text-gh-text-secondary italic">
                                        {rule}
                                      </blockquote>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-gh-text-main leading-relaxed">
                                  All PRD rules satisfied.
                                </p>
                              )}

                              {action.suggestedRewrite && (
                                <div className="mt-3">
                                  <strong className="text-xs text-gh-text-main block mb-1">Suggested Rewrite:</strong>
                                  <div className="bg-surface-variant p-2 rounded text-xs text-gh-text-secondary whitespace-pre-wrap">
                                    {action.suggestedRewrite}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-gh-text-secondary border-t border-gh-border pt-3">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">bolt</span>
                              Iterations: {action.iterationCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">folder</span>
                              Repo: {action.repoFullName}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">chat</span>
                              Action Taken: {action.toolCalled || 'None'}
                            </span>
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
