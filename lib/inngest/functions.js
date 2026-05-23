import { inngest } from "./client";
import { NonRetriableError } from "inngest";
import prisma from "../prisma";
import { runAgentLoop } from "../agent/loop";
import supabaseServer from "../supabase/server";

function mapOverallStatus(overall) {
  if (!overall) return "error";
  if (overall.action === 'none') return 'compliant';
  if (overall.action === 'comment_on_issue') return 'violated';
  if (overall.action === 'flag_for_review') return 'flagged';
  return 'error';
}

export const agentFunction = inngest.createFunction(
  {
    id: "run-agent-loop",
    retries: 3,
    triggers: [{ event: "agent/issue.created" }],
  },
  async ({ event, step }) => {
    const { repoFullName, issueNumber, issueTitle, issueBody, simulated } =
      event.data;

    // Step 1: Fetch PRD text from the database
    const prd = await step.run("fetch-prd", async () => {
      const prdRecord = await prisma.prd.findUnique({
        where: { repoFullName },
      });

      if (!prdRecord) {
        await prisma.agentAction.create({
          data: {
            repoFullName,
            issueNumber,
            issueTitle,
            toolCalled: "none",
            status: "error",
            result: "No PRD found for this repository. Cannot validate issue.",
            simulated,
          },
        });
        throw new NonRetriableError(`No PRD found for ${repoFullName}`);
      }

      return { prdText: prdRecord.prdText, prdMeta: prdRecord.prdMeta || {}, userId: prdRecord.userId, source: prdRecord.source || "manual" };
    });

    // Step 2: Fetch the user's GitHub OAuth token from Clerk (needed for posting comments)
    const githubToken = await step.run("fetch-github-token", async () => {
      if (simulated) return null; // No GitHub actions needed for simulations

      const { clerkClient } = await import("@clerk/nextjs/server");
      const client = await clerkClient();
      const response = await client.users.getUserOauthAccessToken(
        prd.userId,
        "oauth_github"
      );

      const token = response.data?.[0]?.token || response[0]?.token;
      return token || null;
    });

    // Step 3: Run the AI agent loop
    const broadcast = async (stepData) => {
      try {
        await supabaseServer.channel(`agent:${repoFullName}`).send({
          type: "broadcast",
          event: "agent-step",
          payload: { ...stepData, timestamp: new Date().toISOString() },
        });
      } catch (err) {
        console.error("[BROADCAST_ERROR]", err);
      }
    };

    const result = await step.run("run-agent", async () => {
      await broadcast({
        type: "info",
        message: `Starting PRD evaluation for issue #${issueNumber}: "${issueTitle}"`,
      });

      const agentResult = await runAgentLoop({
        prdText: prd.prdText,
        prdMeta: prd.prdMeta,
        prdSource: prd.source,
        issueTitle,
        issueBody,
        repoFullName,
        issueNumber,
        simulated,
        githubToken,
        broadcast,
      });

      return agentResult;
    });

    // Step 4: Save the result to the database
    await step.run("save-result", async () => {
      if (result.drift) {
        await prisma.agentAction.create({
          data: {
            repoFullName,
            issueNumber,
            issueTitle,
            toolCalled: result.overall?.action || 'none',

            // Pass 1
            driftStatus: result.drift?.status || 'compliant',
            driftScore: result.drift?.score || 0,
            driftType: result.drift?.type || 'none',
            driftReason: result.drift?.reason || '',
            driftSuggestedAlt: result.drift?.suggested_alternative || '',

            // Pass 2
            aiReviewStatus: result.ai_review?.status || 'compliant',
            alignmentScore: result.ai_review?.alignment_score || 0,
            aiFindings: result.ai_review?.findings || [],
            aiMissing: result.ai_review?.missing || [],

            // Pass 3
            ruleEnforcementStatus: result.rule_enforcement?.status || 'compliant',
            ruleQuoted: result.rule_enforcement?.rules_violated?.join('\n') || '',
            suggestedRewrite: result.rule_enforcement?.suggested_rewrite || '',

            // Overall
            confidence: result.drift?.score || result.ai_review?.alignment_score || 0,
            result: result.overall?.summary || '',
            iterationCount: 1,
            status: mapOverallStatus(result.overall),
            simulated,
          },
        });
      } else {
        await prisma.agentAction.create({
          data: {
            repoFullName,
            issueNumber,
            issueTitle,
            toolCalled: result.toolCalled || "none",
            ruleQuoted: result.ruleQuoted || "",
            confidence: result.confidence || 0,
            result: result.result || "",
            iterationCount: result.iterationCount || 0,
            status: result.status || "compliant",
            simulated,
          },
        });
      }
    });

    // Step 5: Broadcast final status
    await step.run("broadcast-done", async () => {
      await broadcast({
        type: result.status === "compliant" ? "success" : "warning",
        message: `Agent finished: ${result.status}${
          result.toolCalled !== "none"
            ? ` — called ${result.toolCalled}`
            : ""
        }`,
        result,
      });
    });

    return { success: true, result };
  }
);
