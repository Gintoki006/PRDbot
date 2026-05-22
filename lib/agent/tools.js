/**
 * Gemini function declarations for the PRDBot agent.
 * These are tools the AI can call during its evaluation loop.
 */

export const agentTools = [
  {
    functionDeclarations: [
      {
        name: "comment_on_issue",
        description:
          "Post a comment on the GitHub issue explaining which PRD rule was violated, with a suggested rewrite. Only call this when you are confident (>= 70%) that a specific rule is violated.",
        parameters: {
          type: "object",
          properties: {
            ruleQuoted: {
              type: "string",
              description:
                "The EXACT text of the PRD rule that was violated. Must be a direct quote — never paraphrase.",
            },
            explanation: {
              type: "string",
              description:
                "A clear explanation of how the issue violates the quoted rule.",
            },
            suggestedRewrite: {
              type: "string",
              description:
                "A suggested rewrite of the issue title/body that would make it compliant with the PRD rule.",
            },
            confidence: {
              type: "number",
              description:
                "Your confidence level (0-100) that the rule is actually violated.",
            },
          },
          required: ["ruleQuoted", "explanation", "suggestedRewrite", "confidence"],
        },
      },
      {
        name: "flag_for_review",
        description:
          "Flag the issue for human review by adding a label. Use this when the issue is ambiguous or potentially violates a rule but you are not confident enough to comment.",
        parameters: {
          type: "object",
          properties: {
            reason: {
              type: "string",
              description:
                "Why this issue needs human review — what makes it ambiguous.",
            },
            confidence: {
              type: "number",
              description:
                "Your confidence level (0-100) that the issue needs review.",
            },
          },
          required: ["reason", "confidence"],
        },
      },
    ],
  },
];
