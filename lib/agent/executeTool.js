import { createOctokit } from "../octokit";

/**
 * Execute a tool call from the Gemini agent.
 *
 * @param {string} toolName - The name of the tool to execute
 * @param {object} toolArgs - The arguments passed by the model
 * @param {object} context - Execution context
 * @param {boolean} context.simulated - Whether this is a simulation
 * @param {string|null} context.githubToken - GitHub OAuth token
 * @param {string} context.repoFullName - e.g. "owner/repo"
 * @param {number} context.issueNumber - The GitHub issue number
 * @param {function} context.broadcast - Broadcast function for live updates
 * @returns {object} Tool execution result
 */
export async function executeTool(toolName, toolArgs, context) {
  const { simulated, githubToken, repoFullName, issueNumber, broadcast } =
    context;

  switch (toolName) {
    case "comment_on_issue":
      return await handleCommentOnIssue(toolArgs, {
        simulated,
        githubToken,
        repoFullName,
        issueNumber,
        broadcast,
      });

    case "flag_for_review":
      return await handleFlagForReview(toolArgs, {
        simulated,
        githubToken,
        repoFullName,
        issueNumber,
        broadcast,
      });

    default:
      return { success: false, error: `Unknown tool: ${toolName}` };
  }
}

/**
 * Post a formatted PRDBot comment on the GitHub issue.
 */
async function handleCommentOnIssue(args, ctx) {
  const { ruleQuoted, explanation, suggestedRewrite, confidence } = args;

  await ctx.broadcast?.({
    type: "tool_call",
    message: `Calling comment_on_issue (confidence: ${confidence}%)`,
    tool: "comment_on_issue",
    args: { ruleQuoted, confidence },
  });

  const commentBody = formatComment(ruleQuoted, explanation, suggestedRewrite, confidence);

  if (ctx.simulated) {
    return {
      success: true,
      simulated: true,
      message: "Comment would have been posted (simulation mode)",
      commentBody,
    };
  }

  if (!ctx.githubToken) {
    return {
      success: false,
      error: "No GitHub token available to post comment",
    };
  }

  try {
    const [owner, repo] = ctx.repoFullName.split("/");
    const octokit = createOctokit(ctx.githubToken);

    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: ctx.issueNumber,
      body: commentBody,
    });

    return { success: true, message: "Comment posted successfully" };
  } catch (err) {
    console.error("[COMMENT_ERROR]", err);
    return { success: false, error: err.message };
  }
}

/**
 * Add a 'prdbot-review' label to the issue for human review.
 */
async function handleFlagForReview(args, ctx) {
  const { reason, confidence } = args;

  await ctx.broadcast?.({
    type: "tool_call",
    message: `Calling flag_for_review (confidence: ${confidence}%)`,
    tool: "flag_for_review",
    args: { reason, confidence },
  });

  if (ctx.simulated) {
    return {
      success: true,
      simulated: true,
      message: "Label would have been added (simulation mode)",
    };
  }

  if (!ctx.githubToken) {
    return {
      success: false,
      error: "No GitHub token available to add label",
    };
  }

  try {
    const [owner, repo] = ctx.repoFullName.split("/");
    const octokit = createOctokit(ctx.githubToken);

    try {
      await octokit.issues.addLabels({
        owner,
        repo,
        issue_number: ctx.issueNumber,
        labels: ["prdbot-review"],
      });
    } catch (labelErr) {
      // If label doesn't exist yet (422), create it first then retry
      if (labelErr.status === 422) {
        await octokit.issues.createLabel({
          owner,
          repo,
          name: "prdbot-review",
          color: "FBCA04",
          description: "Flagged by PRDBot for human review",
        });

        await octokit.issues.addLabels({
          owner,
          repo,
          issue_number: ctx.issueNumber,
          labels: ["prdbot-review"],
        });
      } else {
        throw labelErr;
      }
    }

    return { success: true, message: "Label 'prdbot-review' added" };
  } catch (err) {
    console.error("[FLAG_ERROR]", err);
    return { success: false, error: err.message };
  }
}

/**
 * Format the PRDBot comment body using a consistent markdown template.
 */
function formatComment(ruleQuoted, explanation, suggestedRewrite, confidence) {
  return `## PRDBot — Rule Violation Detected

**Confidence:** ${confidence}%

---

### Rule Violated

> ${ruleQuoted}

### Explanation

${explanation}

### Suggested Rewrite

\`\`\`
${suggestedRewrite}
\`\`\`

---

<sub>This comment was posted automatically by <b>PRDBot</b>. It checks this issue against the product requirements document linked to this repository. If you believe this flag is incorrect, dismiss this review and proceed.</sub>`;
}
