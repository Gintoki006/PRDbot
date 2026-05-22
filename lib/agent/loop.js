import { GoogleGenerativeAI } from "@google/generative-ai";
import { agentTools } from "./tools";
import { buildSystemPrompt } from "./prompt";
import { executeTool } from "./executeTool";

const MAX_ITERATIONS = 5;

/**
 * Run the PRDBot agent loop using Gemini with function calling.
 *
 * @param {object} params
 * @param {string} params.prdText - The PRD rules text
 * @param {string} params.issueTitle - GitHub issue title
 * @param {string} params.issueBody - GitHub issue body
 * @param {string} params.repoFullName - e.g. "owner/repo"
 * @param {number} params.issueNumber - GitHub issue number
 * @param {boolean} params.simulated - Whether this is a simulation
 * @param {string|null} params.githubToken - GitHub OAuth token
 * @param {function} params.broadcast - Broadcast function for live updates
 * @returns {object} Agent result
 */
export async function runAgentLoop({
  prdText,
  issueTitle,
  issueBody,
  repoFullName,
  issueNumber,
  simulated,
  githubToken,
  broadcast,
}) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: buildSystemPrompt(prdText),
    tools: agentTools,
  });

  const userMessage = `Please evaluate the following GitHub issue for PRD compliance:

**Issue Title:** ${issueTitle}

**Issue Body:**
${issueBody || "(no body provided)"}`;

  // Build conversation history
  const history = [
    {
      role: "user",
      parts: [{ text: userMessage }],
    },
  ];

  let iterationCount = 0;
  let lastToolCalled = "none";
  let lastRuleQuoted = "";
  let lastConfidence = 0;
  let lastResult = "";
  let status = "compliant";

  const toolContext = {
    simulated,
    githubToken,
    repoFullName,
    issueNumber,
    broadcast,
  };

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    iterationCount = i + 1;

    await broadcast?.({
      type: "info",
      message: `Agent iteration ${iterationCount}/${MAX_ITERATIONS}`,
    });

    try {
      const chatSession = model.startChat({ history: history.slice(0, -1) });
      const lastMessage = history[history.length - 1];
      const response = await chatSession.sendMessage(lastMessage.parts);

      const candidate = response.response.candidates?.[0];
      if (!candidate) {
        status = "error";
        lastResult = "No response from Gemini";
        break;
      }

      const parts = candidate.content?.parts || [];

      // Check for function calls
      const functionCalls = parts.filter((p) => p.functionCall);

      if (functionCalls.length === 0) {
        // Text-only response = end of evaluation
        const textParts = parts.filter((p) => p.text);
        const finalAgentText = textParts.map((p) => p.text).join("\n") || "Evaluation complete";
        
        // Only set status to compliant if it hasn't already been marked as violated/flagged
        if (status !== "violated" && status !== "flagged") {
          status = "compliant";
          lastResult = finalAgentText;
        }

        await broadcast?.({
          type: status === "compliant" ? "success" : "info",
          message: status === "compliant" 
            ? `Issue is compliant: ${finalAgentText.substring(0, 100)}`
            : `Agent evaluation finished: ${finalAgentText.substring(0, 100)}`,
        });

        break;
      }

      // Process function calls
      for (const fc of functionCalls) {
        const toolName = fc.functionCall.name;
        const toolArgs = fc.functionCall.args;

        lastToolCalled = toolName;
        lastConfidence = toolArgs.confidence || 0;
        lastRuleQuoted = toolArgs.ruleQuoted || toolArgs.reason || "";

        // Execute the tool
        const toolResult = await executeTool(toolName, toolArgs, toolContext);
        lastResult = toolResult.message || JSON.stringify(toolResult);

        if (toolName === "comment_on_issue") {
          status = "violated";
        } else if (toolName === "flag_for_review") {
          status = "flagged";
        }

        // Append the model's response and tool result to history for multi-turn
        history.push({
          role: "model",
          parts: [{ functionCall: fc.functionCall }],
        });

        history.push({
          role: "function",
          parts: [
            {
              functionResponse: {
                name: toolName,
                response: toolResult,
              },
            },
          ],
        });
      }
    } catch (err) {
      console.error("[AGENT_LOOP_ERROR]", err);
      status = "error";
      lastResult = err.message || "Agent loop error";

      await broadcast?.({
        type: "error",
        message: `Agent error: ${lastResult}`,
      });

      break;
    }
  }

  if (iterationCount >= MAX_ITERATIONS && status !== "error") {
    await broadcast?.({
      type: "warning",
      message: `Agent reached maximum iterations (${MAX_ITERATIONS})`,
    });
  }

  return {
    toolCalled: lastToolCalled,
    ruleQuoted: lastRuleQuoted,
    confidence: lastConfidence,
    result: lastResult,
    iterationCount,
    status,
  };
}
