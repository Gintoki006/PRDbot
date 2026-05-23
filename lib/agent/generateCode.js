import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildCodeAgentSystemPrompt } from "../prompts/codeAgentSystemPrompt";

/**
 * Calls Gemini to generate production-ready code changes for a GitHub issue.
 * Returns an array of file objects ready to be committed via Octokit.
 *
 * @param {object} params
 * @param {string} params.issueTitle - GitHub issue title
 * @param {string} params.issueBody - GitHub issue body
 * @param {Array<{path: string, content: string}>} params.fileContents - Relevant codebase files
 * @returns {Promise<Array<{path: string, action: string, content: string}>>} Generated file changes
 * @throws {Error} If Gemini returns invalid JSON or the API call fails
 */
export async function generateCodeChanges({ issueTitle, issueBody, fileContents }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const systemPrompt = buildCodeAgentSystemPrompt({
    fileContents,
    issueTitle,
    issueBody,
  });

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(
    "Generate the code changes for the issue described above. Return ONLY valid JSON."
  );

  const rawText = result.response.text();
  const cleanJson = rawText.replace(/```json|```/gi, "").trim();

  try {
    const parsed = JSON.parse(cleanJson);

    if (!Array.isArray(parsed)) {
      throw new Error("Code agent response is not an array");
    }

    // Validate each file object has the required fields
    for (const file of parsed) {
      if (!file.path || typeof file.path !== "string") {
        throw new Error(`Invalid file entry: missing or invalid "path"`);
      }
      if (!file.action || !["create", "update"].includes(file.action)) {
        throw new Error(`Invalid file entry: "action" must be "create" or "update" (got "${file.action}")`);
      }
      if (!file.content || typeof file.content !== "string") {
        throw new Error(`Invalid file entry: missing or invalid "content" for ${file.path}`);
      }
    }

    return parsed;
  } catch (parseError) {
    console.error("[CODE_AGENT_PARSE_ERROR]", parseError.message);
    console.error("[CODE_AGENT_RAW_OUTPUT]", rawText.substring(0, 500));
    throw new Error(`Code agent returned invalid JSON: ${parseError.message}`);
  }
}
