-- AlterTable
ALTER TABLE "AgentAction" ADD COLUMN     "aiFindings" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "aiMissing" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "aiReviewStatus" TEXT NOT NULL DEFAULT 'compliant',
ADD COLUMN     "alignmentScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "driftReason" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "driftScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "driftStatus" TEXT NOT NULL DEFAULT 'compliant',
ADD COLUMN     "driftSuggestedAlt" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "driftType" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "ruleEnforcementStatus" TEXT NOT NULL DEFAULT 'compliant',
ADD COLUMN     "suggestedRewrite" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Prd" ADD COLUMN     "prdMeta" JSONB NOT NULL DEFAULT '{}';
