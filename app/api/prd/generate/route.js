import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { createOctokit } from "../../../../lib/octokit";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

function getFallbackPrd(repoFullName) {
  return {
    prdTitle: repoFullName.split("/")[1] || "PRD",
    overview: "[NEEDS REVIEW] Please write a brief overview of the product.",
    targetUsers: ["[NEEDS REVIEW] Please specify target user personas."],
    coreGoals: ["[NEEDS REVIEW] Please specify the main goals of the product."],
    outOfScope: ["[NEEDS REVIEW] Please specify what is out of scope."],
    antiPatterns: ["[NEEDS REVIEW] Please specify anti-patterns to avoid."],
    explicitRules: [
      { rule: "[NEEDS REVIEW] All new API routes must have basic rate limiting.", source: "inferred" }
    ],
    roadmapObjectives: ["[NEEDS REVIEW] Please specify roadmap objectives."],
    techStack: [],
    confidence: {
      overall: 10,
      notes: "Failed to generate PRD automatically from repository signals. Fallback structure loaded."
    }
  };
}

async function callModel(promptText) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });
  const result = await model.generateContent(promptText);
  return result.response.text();
}

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { repoFullName } = body;

    if (!repoFullName || typeof repoFullName !== "string" || !repoFullName.includes("/")) {
      return new NextResponse("Invalid repository format. Must be 'owner/repo'", { status: 400 });
    }

    const [owner, repo] = repoFullName.split("/");

    // Verify user owns this repository record in database
    const repository = await prisma.repository.findUnique({
      where: { repoFullName },
    });

    if (!repository || repository.userId !== userId) {
      return new NextResponse("Unauthorized or repository not found", { status: 404 });
    }

    // Get GitHub Token from Clerk
    const client = await clerkClient();
    let oauthResponse;
    try {
      oauthResponse = await client.users.getUserOauthAccessToken(
        userId,
        "oauth_github"
      );
    } catch (clerkErr) {
      console.error("[CLERK_TOKEN_ERROR]", clerkErr);
      return new NextResponse("Failed to fetch Clerk OAuth credentials.", { status: 500 });
    }

    const token = oauthResponse.data?.[0]?.token || oauthResponse[0]?.token;
    if (!token) {
      return new NextResponse("No GitHub account linked. Please connect your GitHub account in your profile.", { status: 400 });
    }

    const octokit = createOctokit(token);

    // 1. Verify access and fetch repo metadata
    let repoInfo;
    try {
      const { data } = await octokit.repos.get({ owner, repo });
      repoInfo = data;
    } catch (err) {
      console.error("[OCTOKIT_REPO_GET_ERROR]", err);
      if (err.status === 404 || err.status === 403 || err.status === 401) {
        return new NextResponse("PRDBot needs read access to this repository. Check your GitHub token permissions.", { status: 403 });
      }
      if (err.status === 403 && err.headers?.['x-ratelimit-remaining'] === '0') {
        return new NextResponse("GitHub API rate limit exceeded. Please try again later.", { status: 429 });
      }
      throw err;
    }

    // 2. Fetch README.md
    let readmeContent = "";
    try {
      const { data } = await octokit.repos.getContent({ owner, repo, path: "README.md" });
      readmeContent = Buffer.from(data.content, "base64").toString("utf-8");
    } catch (err) {
      if (err.status !== 404) {
        console.error("[OCTOKIT_README_ERROR]", err);
      }
    }

    // 3. Fetch CONTRIBUTING.md
    let contributingContent = "";
    try {
      const { data } = await octokit.repos.getContent({ owner, repo, path: "CONTRIBUTING.md" });
      contributingContent = Buffer.from(data.content, "base64").toString("utf-8");
    } catch (err) {
      if (err.status !== 404) {
        console.error("[OCTOKIT_CONTRIBUTING_ERROR]", err);
      }
    }

    // 4. Fetch Open Issues (up to 50)
    let openIssues = [];
    try {
      const { data } = await octokit.issues.listForRepo({
        owner,
        repo,
        state: "open",
        per_page: 50,
        sort: "created",
        direction: "desc",
      });
      openIssues = data.filter(issue => !issue.pull_request);
    } catch (err) {
      console.error("[OCTOKIT_ISSUES_ERROR]", err);
      if (err.status === 403 && err.headers?.['x-ratelimit-remaining'] === '0') {
        return new NextResponse("GitHub API rate limit exceeded. Please try again later.", { status: 429 });
      }
    }

    // 5. Fetch Merged PRs (up to 30)
    let mergedPrs = [];
    try {
      const { data } = await octokit.pulls.list({
        owner,
        repo,
        state: "closed",
        per_page: 30,
        sort: "updated",
        direction: "desc",
      });
      mergedPrs = data.filter(pr => pr.merged_at);
    } catch (err) {
      console.error("[OCTOKIT_PRS_ERROR]", err);
    }

    // 6. Fetch Labels
    let labelsList = [];
    try {
      const { data } = await octokit.issues.listLabelsForRepo({ owner, repo });
      labelsList = data;
    } catch (err) {
      console.error("[OCTOKIT_LABELS_ERROR]", err);
    }

    // Signal validation
    const hasReadme = readmeContent.trim().length > 0;
    const issueCount = openIssues.length;
    const prCount = mergedPrs.length;

    if (!hasReadme && issueCount === 0 && prCount === 0) {
      return new NextResponse("Not enough signal to generate a PRD. Add a README or open some issues first.", { status: 400 });
    }

    // Build prompt & extra instructions
    let extraInstructions = "";
    if (!hasReadme) {
      extraInstructions += `- The repository has NO README or the README is empty. You MUST flag the "overview" and "targetUsers" fields with "[NEEDS REVIEW]" (e.g. "[NEEDS REVIEW] brief text...").\n`;
    }
    if (issueCount < 5) {
      extraInstructions += `- The repository has fewer than 5 open issues (${issueCount} found). You MUST generate the PRD with a low overall confidence score (below 40) and prepend "[NEEDS REVIEW]" to all main sections.\n`;
    }

    const issuesText = openIssues.map(i => `Title: ${i.title}\nBody: ${i.body || ""}`).join("\n---\n");
    const prTextSignal = mergedPrs.map(p => `Title: ${p.title}\nBody: ${p.body || ""}`).join("\n---\n");
    const labelsText = labelsList.map(l => l.name).join(", ");
    const primaryLanguage = repoInfo.language || "Not specified";

    const systemPrompt = `SYSTEM:
You are an expert product manager. You will be given raw signals extracted from a GitHub repository: the README, open issues, and PR descriptions. Your task is to produce a complete, structured PRD in the exact format below.

Rules:
- Only use information present in the provided signals. Do not invent features or goals.
- Where signals are ambiguous, write the PRD section with a [NEEDS REVIEW] flag so the user can complete it.
- Be opinionated about product focus, target users, and out-of-scope items — infer them from patterns in the data.
- Use plain, direct language. Avoid marketing fluff.
- Output ONLY valid JSON. No preamble, no markdown fences.
${extraInstructions}
Output format:
{
  "prdTitle": "string — short product name",
  "overview": "string — 2–3 sentence product description",
  "targetUsers": ["string", ...],
  "coreGoals": ["string", ...],
  "outOfScope": ["string", ...],
  "antiPatterns": ["string", ...],
  "explicitRules": [
    { "rule": "string — enforceable issue requirement", "source": "inferred | readme | issue | pr" }
  ],
  "roadmapObjectives": ["string", ...],
  "techStack": ["string", ...],
  "confidence": {
    "overall": 0–100,
    "notes": "string — what was uncertain or missing"
  }
}`;

    const userPrompt = `USER:
README content:
${readmeContent || "(no README found)"}

CONTRIBUTING guidelines:
${contributingContent || "(no CONTRIBUTING file found)"}

Open issues (title + body, last 50):
${issuesText || "(no open issues found)"}

Merged PR descriptions (last 30):
${prTextSignal || "(no merged PRs found)"}

Labels:
${labelsText || "(no labels found)"}

Primary Language / Stack:
${primaryLanguage}

Generate the PRD now.`;

    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    let responseText = "";
    let parsedJson = null;

    try {
      responseText = await callModel(fullPrompt);
      parsedJson = JSON.parse(responseText.replace(/```json|```/gi, "").trim());
    } catch (err) {
      console.warn("[MODEL_GENERATION_ERROR] First model call failed, retrying once...", err);
      try {
        responseText = await callModel(fullPrompt + "\n\nCRITICAL: The output must be strictly valid JSON matching the schema format. Do not wrap in markdown or add commentary.");
        parsedJson = JSON.parse(responseText.replace(/```json|```/gi, "").trim());
      } catch (retryErr) {
        console.error("[MODEL_GENERATION_ERROR] Second model call also failed. Falling back.", retryErr);
        parsedJson = getFallbackPrd(repoFullName);
      }
    }

    // Return the JSON data along with the meta details
    const result = {
      prdTitle: parsedJson.prdTitle || repoFullName.split("/")[1] || "PRD",
      overview: parsedJson.overview || "[NEEDS REVIEW] Overview missing.",
      targetUsers: parsedJson.targetUsers || [],
      coreGoals: parsedJson.coreGoals || [],
      outOfScope: parsedJson.outOfScope || [],
      antiPatterns: parsedJson.antiPatterns || [],
      explicitRules: parsedJson.explicitRules || [],
      roadmapObjectives: parsedJson.roadmapObjectives || [],
      techStack: parsedJson.techStack || [primaryLanguage],
      confidence: parsedJson.confidence || { overall: 50, notes: "No confidence data generated" },
      autoGenMeta: {
        readmeLength: readmeContent.length,
        issueCount,
        prCount,
        confidence: parsedJson.confidence?.overall || 50
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GENERATE_PRD_POST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
