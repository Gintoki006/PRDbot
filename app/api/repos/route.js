import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { createOctokit } from "../../../lib/octokit";
import { countRules } from "../../../lib/countRules";
import { extractPrdMeta } from "../../../lib/agent/extractPrdMeta";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const repos = await prisma.repository.findMany({
      where: {
        userId: userId,
      },
      include: {
        prd: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(repos);
  } catch (error) {
    console.error("[REPOS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
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

    // Verify repository doesn't already exist
    const existingRepo = await prisma.repository.findUnique({
      where: {
        repoFullName: repoFullName,
      },
    });

    if (existingRepo) {
      return new NextResponse("Repository already connected", { status: 400 });
    }

    let octokit;
    try {
      // Get GitHub token from Clerk
      const client = await clerkClient();
      const response = await client.users.getUserOauthAccessToken(
        userId,
        "oauth_github"
      );
      
      const token = response.data?.[0]?.token || response[0]?.token;

      if (!token) {
        return new NextResponse("No GitHub account linked. Please connect your GitHub account in your profile.", { status: 400 });
      }

      // Verify access to the repository
      octokit = createOctokit(token);
      await octokit.repos.get({
        owner,
        repo,
      });
      
    } catch (githubError) {
      console.error("[GITHUB_VERIFICATION_ERROR]", githubError);
      return new NextResponse("Cannot access repository. Ensure it exists and you have access to it.", { status: 404 });
    }

    // Try to auto-fetch PRD
    let prdText = null;
    const prdPaths = ["prd.md", "PRD.md"];
    
    for (const path of prdPaths) {
      try {
        const { data } = await octokit.repos.getContent({
          owner,
          repo,
          path,
        });
        
        if (data && data.content) {
          prdText = Buffer.from(data.content, "base64").toString("utf-8");
          console.log(`[PRD_FETCH] Successfully fetched ${path} for ${repoFullName}`);
          break; // Stop looking once we find one
        }
      } catch (err) {
        // File not found at this path, continue to the next one
      }
    }

    if (!prdText) {
      console.log(`[PRD_FETCH] No PRD file found for ${repoFullName}`);
    }

    let prdMeta = {};
    if (prdText) {
      try {
        prdMeta = await extractPrdMeta(prdText);
        console.log("[PRD_META]", prdMeta);
      } catch (metaError) {
        console.error("[PRD_META_ERROR] Failed to extract PRD meta.", metaError);
      }
    }

    // Create repository record
    const repository = await prisma.repository.create({
      data: {
        userId,
        repoFullName,
        ...(prdText ? {
          prd: {
            create: {
              userId,
              prdText,
              ruleCount: countRules(prdText),
              prdMeta: prdMeta,
            }
          }
        } : {})
      },
      include: {
        prd: true,
      }
    });

    return NextResponse.json(repository, { status: 201 });
  } catch (error) {
    console.error("[REPOS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const repoFullName = searchParams.get("repoFullName");

    if (!repoFullName) {
      return new NextResponse("Repository name required", { status: 400 });
    }

    const repository = await prisma.repository.findUnique({
      where: {
        repoFullName: repoFullName,
      },
    });

    if (!repository || repository.userId !== userId) {
      return new NextResponse("Not found or unauthorized", { status: 404 });
    }

    // AgentAction does not have a relation to Repository in the schema, just an indexed repoFullName string.
    // So we manually delete associated AgentActions first.
    await prisma.agentAction.deleteMany({
      where: {
        repoFullName: repoFullName,
      },
    });

    // Prd uses Cascade delete in schema, so deleting the Repository deletes the Prd automatically.
    await prisma.repository.delete({
      where: {
        repoFullName: repoFullName,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[REPOS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
