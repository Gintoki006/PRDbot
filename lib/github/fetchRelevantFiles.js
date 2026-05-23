import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Fetches the relevant codebase files from a GitHub repository for a given issue.
 * Uses a two-step approach:
 *   1. Fetch the repo's file tree from GitHub.
 *   2. Ask Gemini to pick the most relevant files based on the issue.
 *   3. Fetch the contents of those files via Octokit.
 *
 * @param {object} params
 * @param {import("@octokit/rest").Octokit} params.octokit - Authenticated Octokit instance
 * @param {string} params.owner - Repository owner
 * @param {string} params.repo - Repository name
 * @param {string} params.issueTitle - GitHub issue title
 * @param {string} params.issueBody - GitHub issue body
 * @returns {Promise<Array<{path: string, content: string}>>} Relevant file contents
 */
export async function fetchRelevantFiles({ octokit, owner, repo, issueTitle, issueBody }) {
  const MAX_FILES = 10;

  // Step 1: Get the repository file tree (recursive, default branch)
  let tree = [];
  try {
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: "heads/main",
    });
    const commitSha = refData.object.sha;

    const { data: treeData } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: commitSha,
      recursive: "true",
    });

    tree = treeData.tree
      .filter(item => item.type === "blob")
      .filter(item => !isIgnoredPath(item.path))
      .map(item => item.path);
  } catch (treeError) {
    console.error("[FILE_FETCH_TREE_ERROR]", treeError.message);
    throw new Error(`Failed to fetch repository tree: ${treeError.message}`);
  }

  if (tree.length === 0) {
    return [];
  }

  // Step 2: Ask Gemini which files are relevant
  let selectedPaths = [];
  try {
    selectedPaths = await pickRelevantPaths(tree, issueTitle, issueBody, MAX_FILES);
  } catch (pickError) {
    console.error("[FILE_PICK_ERROR]", pickError.message);
    // Fallback: pick common structural files
    selectedPaths = tree
      .filter(p =>
        p === "prisma/schema.prisma" ||
        p === "package.json" ||
        p.startsWith("app/api/") ||
        p.startsWith("lib/")
      )
      .slice(0, MAX_FILES);
  }

  // Step 3: Fetch the content of each selected file
  const fileContents = [];

  for (const filePath of selectedPaths) {
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
      });

      if (data && data.content) {
        const content = Buffer.from(data.content, "base64").toString("utf-8");
        fileContents.push({ path: filePath, content });
      }
    } catch (fileError) {
      // Skip files that can't be fetched (deleted, too large, etc.)
      console.error(`[FILE_FETCH_SKIP] Could not fetch ${filePath}: ${fileError.message}`);
    }
  }

  return fileContents;
}

/**
 * Uses Gemini to determine which file paths from the repo tree
 * are most relevant to implementing the given issue.
 *
 * @param {string[]} allPaths - All file paths in the repo
 * @param {string} issueTitle - Issue title
 * @param {string} issueBody - Issue body
 * @param {number} maxFiles - Maximum number of files to return
 * @returns {Promise<string[]>} Selected file paths
 */
async function pickRelevantPaths(allPaths, issueTitle, issueBody, maxFiles) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `You are a senior software engineer. Given a repository file tree and a GitHub issue, select the files most relevant to implementing the issue.

RULES:
- Always include prisma/schema.prisma if database changes are mentioned.
- Always include package.json for dependency context.
- Prioritise API route files, lib/ utilities, and components directly related to the issue.
- Do NOT include test files, config files, lock files, .env files, or README unless directly relevant.
- Return at most ${maxFiles} file paths.
- Return ONLY a valid JSON array of strings. No markdown, no explanation.

Example output:
["app/api/matches/route.js", "lib/prisma.js", "prisma/schema.prisma"]`,
  });

  const prompt = `REPOSITORY FILE TREE:
${allPaths.join("\n")}

ISSUE TO IMPLEMENT:
Title: ${issueTitle}
Body: ${issueBody}

Select the most relevant files to implement this issue. Return ONLY a JSON array of file path strings.`;

  const result = await model.generateContent(prompt);
  const rawText = result.response.text();
  const cleanJson = rawText.replace(/```json|```/gi, "").trim();
  const parsed = JSON.parse(cleanJson);

  if (!Array.isArray(parsed)) {
    throw new Error("Gemini file picker did not return an array");
  }

  // Only keep paths that actually exist in the tree
  return parsed
    .filter(p => typeof p === "string" && allPaths.includes(p))
    .slice(0, maxFiles);
}

/**
 * Returns true if the file path should be excluded from consideration.
 */
function isIgnoredPath(filePath) {
  const ignoredPrefixes = [
    "node_modules/",
    ".git/",
    ".next/",
    ".vercel/",
    ".env",
  ];

  const ignoredExtensions = [
    ".lock",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".ico",
    ".woff",
    ".woff2",
    ".ttf",
    ".eot",
    ".mp4",
    ".webm",
    ".pdf",
  ];

  const ignoredFiles = [
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
  ];

  if (ignoredPrefixes.some(prefix => filePath.startsWith(prefix))) return true;
  if (ignoredExtensions.some(ext => filePath.endsWith(ext))) return true;
  if (ignoredFiles.includes(filePath)) return true;

  return false;
}
