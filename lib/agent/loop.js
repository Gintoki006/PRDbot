import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildSystemPrompt } from "./prompt";
import { executeTool } from "./executeTool";

/**
 * Executes a single-pass PRD evaluation using Gemini 2.5 Flash.
 *
 * @param {object} params
 * @param {string} params.prdText - The PRD rules text
 * @param {object|null} params.prdMeta - Structured product metadata
 * @param {string} params.issueTitle - GitHub issue title
 * @param {string} params.issueBody - GitHub issue body
 * @param {string} params.repoFullName - GitHub repository full name
 * @param {number} params.issueNumber - GitHub issue number
 * @param {boolean} params.simulated - Indicates if this is a simulation run
 * @param {string|null} params.githubToken - GitHub authentication token
 * @param {function} params.broadcast - Realtime event broadcasting function
 * @returns {object} Parsed agent evaluation result
 */
export async function runAgentLoop({
  prdText,
  prdMeta,
  prdSource = "manual",
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
    systemInstruction: buildSystemPrompt(prdText, prdMeta, prdSource),
  });

  const userMessage = `Issue Title: ${issueTitle}\nIssue Body: ${issueBody || "(no body provided)"}`;

  await broadcast?.({
    type: "info",
    message: "Initiating structured PRD evaluation.",
  });

  let parsedResponse = null;

  try {
    const result = await model.generateContent(userMessage);
    const rawText = result.response.text();
    const cleanJson = rawText.replace(/```json|```/gi, "").trim();

    try {
      parsedResponse = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("[AGENT_PARSE_ERROR]", parseError, "Raw output:", rawText);
      await broadcast?.({
        type: "error",
        message: "Failed to parse model output into structured JSON.",
      });

      // Attempt regex extraction of any rule violations from raw text as fallback
      const ruleViolations = [];
      const ruleRegex = /rule[s]?\s+violated:?\s*([^\n]+)/gi;
      let match;
      while ((match = ruleRegex.exec(rawText)) !== null) {
        ruleViolations.push(match[1].trim());
      }

      const snippet = rawText.substring(0, 150).replace(/\n/g, ' ') + "...";
      await broadcast?.({
        type: "error",
        message: `Raw response snippet: ${snippet}`,
      });

      parsedResponse = {
        drift: { status: "error", score: 0, type: "none", reason: "JSON parsing failed", conflicts_with: "", suggested_alternative: "" },
        ai_review: { status: "error", alignment_score: 0, findings: ["JSON parsing failed"], missing: [] },
        rule_enforcement: { 
          status: ruleViolations.length > 0 ? "violation" : "error", 
          rules_violated: ruleViolations.length > 0 ? ruleViolations : ["Failed to process rules correctly due to JSON parse error."], 
          suggested_rewrite: "Please review the issue manually." 
        },
        overall: { status: "error", summary: "JSON parsing failure.", action: "none" }
      };
    }

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const isPrdMetaEmpty = !prdMeta || Object.keys(prdMeta).length === 0;

    // Pass 1: Drift
    if (isPrdMetaEmpty) {
      console.warn(`[PRD_META_MISSING] Drift detection skipped for ${repoFullName}`);
      parsedResponse.drift = { status: "compliant", score: 0, type: "none", reason: "PRD Meta missing, skipped.", conflicts_with: "", suggested_alternative: "" };
      await broadcast?.({ type: "drift", message: "Drift detection skipped (missing PRD metadata).", status: "compliant" });
    } else {
      await broadcast?.({ type: "drift", message: "Evaluating vision alignment...", status: "running" });
      await delay(300);
      await broadcast?.({ 
        type: "drift", 
        message: `Drift assessment complete. Score: ${parsedResponse.drift?.score || 0}/100`, 
        status: parsedResponse.drift?.status || "compliant", 
        score: parsedResponse.drift?.score || 0 
      });
    }

    // Pass 2: AI Review
    await delay(300);
    await broadcast?.({ type: "ai_review", message: "Evaluating strategic alignment...", status: "running" });
    await delay(300);
    await broadcast?.({ 
      type: "ai_review", 
      message: `Alignment score: ${parsedResponse.ai_review?.alignment_score || 0}%`, 
      status: parsedResponse.ai_review?.status || "compliant", 
      score: parsedResponse.ai_review?.alignment_score || 0 
    });

    // Pass 3: Rule Enforcement
    await delay(300);
    await broadcast?.({ type: "rule_enforcement", message: "Checking formatting rules...", status: "running" });
    await delay(300);
    await broadcast?.({ 
      type: "rule_enforcement", 
      message: `Rule verification complete.`, 
      status: parsedResponse.rule_enforcement?.status || "compliant" 
    });

    // Verdict
    await delay(300);
    await broadcast?.({ type: "verdict", message: simulated ? "Dry run complete." : "Applying GitHub actions...", status: "running" });

    const toolContext = { simulated, githubToken, repoFullName, issueNumber, broadcast, prdSource, prdMeta };
    
    await executeTool(parsedResponse, toolContext);

    await broadcast?.({ type: "verdict", message: "Evaluation finalized.", status: "done" });

    // Defensive defaults for saving to DB
    const finalAction = parsedResponse.overall?.action || "none";
    const rulesQuoted = parsedResponse.rule_enforcement?.rules_violated || [];
    const firstRule = Array.isArray(rulesQuoted) ? rulesQuoted[0] : (typeof rulesQuoted === 'string' ? rulesQuoted : "");
    const finalScore = parsedResponse.ai_review?.alignment_score || 0;
    const finalSummary = parsedResponse.overall?.summary || "Completed with warnings";
    const finalStatus = parsedResponse.overall?.status === "violation" ? "violated" : (parsedResponse.overall?.status === "warning" ? "flagged" : (parsedResponse.overall?.status === "error" ? "error" : "compliant"));

    return {
      ...parsedResponse,
      toolCalled: finalAction,
      ruleQuoted: firstRule || "",
      confidence: finalScore,
      result: finalSummary,
      iterationCount: 1,
      status: finalStatus,
    };
  } catch (error) {
    console.error("[AGENT_EXECUTION_ERROR]", error);
    await broadcast?.({
      type: "error",
      message: `Execution error: ${error.message}`,
    });
    
    return {
      toolCalled: "none",
      ruleQuoted: "",
      confidence: 0,
      result: error.message,
      iterationCount: 1,
      status: "error",
    };
  }
}
