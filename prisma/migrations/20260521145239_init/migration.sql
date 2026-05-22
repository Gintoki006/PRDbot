-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repoFullName" TEXT NOT NULL,
    "webhookId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prd" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repoFullName" TEXT NOT NULL,
    "prdText" TEXT NOT NULL,
    "ruleCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentAction" (
    "id" TEXT NOT NULL,
    "repoFullName" TEXT NOT NULL,
    "issueNumber" INTEGER NOT NULL,
    "issueTitle" TEXT NOT NULL DEFAULT '',
    "toolCalled" TEXT NOT NULL DEFAULT 'none',
    "ruleQuoted" TEXT NOT NULL DEFAULT '',
    "confidence" INTEGER NOT NULL DEFAULT 0,
    "result" TEXT NOT NULL DEFAULT '',
    "iterationCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'compliant',
    "simulated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repository_repoFullName_key" ON "Repository"("repoFullName");

-- CreateIndex
CREATE UNIQUE INDEX "Prd_repoFullName_key" ON "Prd"("repoFullName");

-- CreateIndex
CREATE INDEX "AgentAction_repoFullName_idx" ON "AgentAction"("repoFullName");

-- AddForeignKey
ALTER TABLE "Prd" ADD CONSTRAINT "Prd_repoFullName_fkey" FOREIGN KEY ("repoFullName") REFERENCES "Repository"("repoFullName") ON DELETE CASCADE ON UPDATE CASCADE;
