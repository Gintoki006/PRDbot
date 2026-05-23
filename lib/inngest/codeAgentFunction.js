import { inngest } from "./client";
import { NonRetriableError } from "inngest";
import prisma from "../prisma";
import supabaseServer from "../supabase/server";
import { createOctokit } from "../octokit";
import { fetchRelevantFiles } from "../github/fetchRelevantFiles";
import { generateCodeChanges } from "../agent/generateCode";
import { createPullRequest } from "../github/createPullRequest";

/**
 * Inngest function that generates code and opens a PR for compliant issues.
 *
 * Triggered when the evaluation agent determines an issue is compliant
 * and well-formed enough for automatic code generation.
 *
 * Event: agent/issue.codegenerate
 * Payload: { repoFullName, issueNumber, issueTitle, issueBody }
 */
export const codeAgentFunction = inngest.createFunction(
  {
    id: "code-agent-generate-pr",
    retries: 1,
    triggers: [{ event: "agent/issue.codegenerate" }],
  },
  async ({ event, step }) => {
    const { repoFullName, issueNumber, issueTitle, issueBody } = event.data;
    const [owner, repo] = repoFullName.split("/");

    const broadcast = async (stepData) => {
      try {
        await supabaseServer.channel(`agent:${repoFullName}`).send({
          type: "broadcast",
          event: "agent-step",
          payload: { ...stepData, timestamp: new Date().toISOString() },
        });
      } catch (err) {
        console.error("[CODE_AGENT_BROADCAST_ERROR]", err);
      }
    };

    // Step 1: Fetch the repository owner's GitHub token from Clerk
    const githubToken = await step.run("fetch-github-token", async () => {
      await broadcast({
        type: "code_agent",
        message: "Fetching GitHub credentials...",
        status: "running",
      });

      const prdRecord = await prisma.prd.findUnique({
        where: { repoFullName },
      });

      if (!prdRecord) {
        throw new NonRetriableError(`No PRD found for ${repoFullName}`);
      }

      const { clerkClient } = await import("@clerk/nextjs/server");
      const client = await clerkClient();
      const response = await client.users.getUserOauthAccessToken(
        prdRecord.userId,
        "oauth_github"
      );

      const token = response.data?.[0]?.token || response[0]?.token;
      if (!token) {
        throw new NonRetriableError("No GitHub token available for code generation");
      }

      return token;
    });

    // Step 2: Fetch relevant files from the repository
    const fileContents = await step.run("fetch-relevant-files", async () => {
      await broadcast({
        type: "code_agent",
        message: "Analysing repository structure and fetching relevant files...",
        status: "running",
      });

      const octokit = createOctokit(githubToken);
      const files = await fetchRelevantFiles({
        octokit,
        owner,
        repo,
        issueTitle,
        issueBody,
      });

      await broadcast({
        type: "code_agent",
        message: `Fetched ${files.length} relevant files from repository.`,
        status: "running",
      });

      return files;
    });

    // Step 3: Generate code changes via Gemini
    const generatedFiles = await step.run("generate-code", async () => {
      await broadcast({
        type: "code_agent",
        message: "Generating production-ready code changes...",
        status: "running",
      });

      const files = await generateCodeChanges({
        issueTitle,
        issueBody,
        fileContents,
      });

      await broadcast({
        type: "code_agent",
        message: `Generated ${files.length} file(s): ${files.map(f => f.path).join(", ")}`,
        status: "running",
      });

      return files;
    });

    // Step 4: Create a pull request on GitHub
    const prResult = await step.run("create-pull-request", async () => {
      await broadcast({
        type: "code_agent",
        message: "Creating branch and opening pull request...",
        status: "running",
      });

      const result = await createPullRequest({
        githubToken,
        owner,
        repo,
        issueNumber,
        issueTitle,
        files: generatedFiles,
      });

      if (!result.success) {
        await broadcast({
          type: "code_agent",
          message: `Failed to create PR: ${result.error}`,
          status: "error",
        });
        throw new Error(`PR creation failed: ${result.error}`);
      }

      await broadcast({
        type: "code_agent",
        message: `Pull request opened: ${result.prUrl}`,
        status: "pr_opened",
        prUrl: result.prUrl,
      });

      return result;
    });

    // Step 5: Post a comment on the original issue linking to the PR
    await step.run("comment-on-issue", async () => {
      const octokit = createOctokit(githubToken);

      const commentBody = `## 💻 PRDBot Code Agent

A pull request has been automatically generated to implement this issue.

**PR:** ${prResult.prUrl}

### Files Changed
${generatedFiles.map(f => `- \`${f.path}\` (${f.action})`).join("\n")}

---
*Auto-generated by PRDBot Code Agent. Please review the changes before merging.*`;

      try {
        await octokit.issues.createComment({
          owner,
          repo,
          issue_number: issueNumber,
          body: commentBody,
        });
      } catch (commentErr) {
        console.error("[CODE_AGENT_COMMENT_ERROR]", commentErr.message);
        // Non-critical — PR was already created, don't fail the whole function
      }
    });

    // Step 6: Save the code agent result to the database
    await step.run("save-code-agent-result", async () => {
      await prisma.agentAction.updateMany({
        where: {
          repoFullName,
          issueNumber,
        },
        data: {
          codeAgentStatus: "pr_opened",
          prUrl: prResult.prUrl,
        },
      });

      await broadcast({
        type: "code_agent",
        message: "Code generation complete.",
        status: "done",
        prUrl: prResult.prUrl,
      });
    });

    return { success: true, prUrl: prResult.prUrl };
  }
);
