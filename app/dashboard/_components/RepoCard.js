import { useState } from "react";
import { useToast } from "./Toast";
import { GlowCard } from "../../_components/ui/spotlight-card";

export default function RepoCard({ repo, onRemove, onUploadPrd, onGeneratePrd, onSimulate }) {
  const toast = useToast();
  const [isRemoving, setIsRemoving] = useState(false);
  const hasPrd = !!repo.prd;

  const prdSource = repo.prd?.source || "manual";
  const glowColor = hasPrd ? (prdSource === "auto_generated" ? "purple" : "green") : "blue";
  const borderColor = hasPrd ? (prdSource === "auto_generated" ? "rgba(191, 135, 255, 0.25)" : "rgba(35, 134, 54, 0.25)") : "rgba(56, 139, 253, 0.15)";

  const handleRemove = async () => {
    if (!confirm(`Are you sure you want to disconnect ${repo.repoFullName}? This will also delete its PRD and action history.`)) {
      return;
    }

    setIsRemoving(true);
    try {
      const res = await fetch(`/api/repos?repoFullName=${encodeURIComponent(repo.repoFullName)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove");
      await onRemove();
      toast.info("Repository disconnected.");
    } catch (err) {
      console.error(err);
      toast.error("Error removing repository.");
      setIsRemoving(false);
    }
  };

  return (
    <GlowCard
      customSize={true}
      glowColor={glowColor}
      radius={16}
      style={{
        '--backup-border': borderColor,
        '--backdrop': 'rgba(13, 17, 23, 0.75)'
      }}
      className="p-5 flex flex-col hover:border-gh-text-secondary transition-colors group relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center border border-gh-border">
            <span className="material-symbols-outlined text-gh-text-main text-xl">folder</span>
          </div>
          <div>
            <h3 className="font-semibold text-white truncate max-w-[200px]" title={repo.repoFullName}>
              {repo.repoFullName}
            </h3>
            <p className="text-xs text-gh-text-secondary mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">schedule</span>
              Connected {new Date(repo.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={handleRemove}
          disabled={isRemoving}
          className="text-gh-text-secondary hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50 relative z-20 cursor-pointer"
          title="Remove Repository"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>

      <div className="flex-1 relative z-10">
        <div className="flex items-center gap-2 mb-4">
          {hasPrd ? (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium animate-fade-in ${prdSource === "auto_generated"
              ? "border-purple-500/30 bg-purple-500/10 text-purple-300"
              : "border-gh-green/30 bg-gh-green/10 text-gh-green"
              }`}>
              <span className="material-symbols-outlined text-[14px]">
                {prdSource === "auto_generated" ? "auto_awesome" : "check_circle"}
              </span>
              PRD Active{prdSource === "auto_generated" ? " — Auto-Generated" : ""}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-xs font-medium">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              No PRD
            </div>
          )}

          {hasPrd && (
            <span className="text-xs text-gh-text-secondary">
              {repo.prd.ruleCount} rules
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-gh-border relative z-10">
        {hasPrd ? (
          <div className="flex gap-2 w-full">
            <button
              onClick={() => onUploadPrd(repo)}
              className="flex-1 bg-surface-variant hover:bg-gh-border text-white border border-gh-border py-1.5 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">edit_document</span>
              Update PRD
            </button>
            <button
              onClick={() => onSimulate?.(repo)}
              className="flex-none bg-gh-blue/10 hover:bg-gh-blue/20 text-gh-blue border border-gh-blue/30 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px] block">play_arrow</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => onUploadPrd(repo)}
              className="w-full bg-surface-variant hover:bg-gh-border text-white border border-gh-border py-1.5 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              Paste PRD manually
            </button>
            <button
              onClick={() => onGeneratePrd?.(repo)}
              className="w-full bg-surface-variant hover:bg-gh-border text-white border border-gh-border py-1.5 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center cursor-pointer"
            >
              Generate PRD from Repo
            </button>
          </div>
        )}
      </div>
    </GlowCard>
  );
}
