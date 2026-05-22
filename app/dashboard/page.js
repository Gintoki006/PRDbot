"use client";

import { useState, useEffect, useCallback } from "react";
import AddRepoModal from "./_components/AddRepoModal";
import RepoCard from "./_components/RepoCard";
import PrdUploadModal from "./_components/PrdUploadModal";
import SimulatePanel from "./_components/SimulatePanel";
import AgentLogPanel from "./_components/AgentLogPanel";
import AgentCardGrid from "./_components/AgentCardGrid";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function DashboardPage() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [latestAction, setLatestAction] = useState(null);
  
  // Modals state
  const [isAddRepoOpen, setIsAddRepoOpen] = useState(false);
  const [isPrdModalOpen, setIsPrdModalOpen] = useState(false);
  const [selectedRepoForPrd, setSelectedRepoForPrd] = useState(null);

  // Simulate state
  const [isSimulateOpen, setIsSimulateOpen] = useState(false);
  const [selectedRepoForSim, setSelectedRepoForSim] = useState(null);

  // Agent log state
  const [isAgentLogOpen, setIsAgentLogOpen] = useState(false);
  const [agentLogRepo, setAgentLogRepo] = useState(null);

  const fetchRepos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/repos");
      if (res.ok) {
        const data = await res.json();
        setRepos(data);
      } else {
        console.error("Failed to fetch repos", await res.text());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLatestAction = useCallback(async () => {
    try {
      const res = await fetch("/api/history?limit=1");
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setLatestAction(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchRepos();
    fetchLatestAction();
  }, [fetchRepos, fetchLatestAction]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 md:p-8 max-w-[1440px] mx-auto h-full flex flex-col"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Repositories</h1>
          <p className="text-sm text-gh-text-secondary mt-1">
            Manage your connected GitHub repositories and their PRD rules.
          </p>
        </div>
        
        <button
          onClick={() => setIsAddRepoOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gh-green hover:bg-gh-green-hover rounded-lg transition-colors border border-white/10"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Connect Repository
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gh-card-bg border border-gh-border rounded-xl p-5 h-[160px] animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 bg-surface-variant rounded-lg"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-surface-variant rounded w-3/4"></div>
                    <div className="h-3 bg-surface-variant rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : repos.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center h-full min-h-[400px] border border-dashed border-gh-border rounded-xl bg-gh-card-bg/50"
          >
            <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center mb-4 border border-gh-border">
              <span className="material-symbols-outlined text-gh-text-secondary text-3xl">hub</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No repositories connected</h3>
            <p className="text-gh-text-secondary text-center max-w-sm mb-6">
              Connect your first GitHub repository to start enforcing your Product Requirements Document rules.
            </p>
            <button
              onClick={() => setIsAddRepoOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-gh-green hover:bg-gh-green-hover rounded-lg transition-colors border border-white/10"
            >
              Connect your first repository
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12"
            >
              {repos.map((repo) => (
                <motion.div key={repo.id} variants={itemVariants} layout>
                  <RepoCard
                    repo={repo}
                    onRemove={fetchRepos}
                    onUploadPrd={(r) => {
                      setSelectedRepoForPrd(r);
                      setIsPrdModalOpen(true);
                    }}
                    onSimulate={(r) => {
                      setSelectedRepoForSim(r);
                      setIsSimulateOpen(true);
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            <div className="mt-8 border-t border-gh-border pt-8">
              <h2 className="text-xl font-semibold text-white tracking-tight mb-6">Latest Agent Activity</h2>
              {latestAction ? (
                <div className="max-w-4xl">
                  <div className="mb-4">
                    <p className="text-sm text-gh-text-secondary">
                      Showing most recent evaluation for <span className="font-medium text-white">{latestAction.repoFullName}</span> (Issue #{latestAction.issueNumber})
                    </p>
                  </div>
                  <AgentCardGrid action={latestAction} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gh-border rounded-xl bg-gh-card-bg/50">
                  <span className="material-symbols-outlined text-gh-text-secondary text-3xl mb-3">
                    query_stats
                  </span>
                  <p className="text-sm text-gh-text-secondary">
                    Run a simulation or wait for a webhook to see agent results
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <AddRepoModal
        isOpen={isAddRepoOpen}
        onClose={() => setIsAddRepoOpen(false)}
        onSuccess={fetchRepos}
      />

      <PrdUploadModal
        isOpen={isPrdModalOpen}
        onClose={() => {
          setIsPrdModalOpen(false);
          setSelectedRepoForPrd(null);
        }}
        repo={selectedRepoForPrd}
        onSuccess={fetchRepos}
      />

      <SimulatePanel
        isOpen={isSimulateOpen}
        onClose={() => {
          setIsSimulateOpen(false);
          setSelectedRepoForSim(null);
        }}
        repo={selectedRepoForSim}
        onStarted={() => {
          setAgentLogRepo(selectedRepoForSim?.repoFullName);
          setIsAgentLogOpen(true);
        }}
      />

      <AgentLogPanel
        repoFullName={agentLogRepo}
        isOpen={isAgentLogOpen}
        onClose={() => {
          setIsAgentLogOpen(false);
          setAgentLogRepo(null);
        }}
      />
    </motion.div>
  );
}
