import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { extractPrdMeta } from "../../../lib/agent/extractPrdMeta";

export const runtime = "nodejs";

// Basic heuristic for counting rules: matches lists starting with -, *, or digits (1., 1)
function countRules(text) {
  if (!text) return 0;
  const lines = text.split("\n");
  let count = 0;
  const ruleRegex = /^\s*[-*\d]\.?\s+/;
  
  for (const line of lines) {
    if (ruleRegex.test(line)) {
      count++;
    }
  }
  return count;
}

export async function GET(req) {
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

    const prd = await prisma.prd.findUnique({
      where: {
        repoFullName: repoFullName,
      },
    });

    if (!prd || prd.userId !== userId) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(prd);
  } catch (error) {
    console.error("[PRD_GET]", error);
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
    const { repoFullName, prdText } = body;

    if (!repoFullName || typeof prdText !== "string") {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify user owns this repository
    const repository = await prisma.repository.findUnique({
      where: {
        repoFullName: repoFullName,
      },
    });

    if (!repository || repository.userId !== userId) {
      return new NextResponse("Unauthorized or repository not found", { status: 404 });
    }

    const ruleCount = countRules(prdText);
    let prdMeta = {};
    try {
      prdMeta = await extractPrdMeta(prdText);
      console.log("[PRD_META]", prdMeta);
    } catch (metaError) {
      console.error("[PRD_META_ERROR] Failed to extract PRD meta, saving empty meta.", metaError);
    }

    // Upsert the PRD
    const prd = await prisma.prd.upsert({
      where: {
        repoFullName: repoFullName,
      },
      update: {
        prdText,
        ruleCount,
        prdMeta,
      },
      create: {
        userId,
        repoFullName,
        prdText,
        ruleCount,
        prdMeta,
      },
    });

    return NextResponse.json(prd);
  } catch (error) {
    console.error("[PRD_POST]", error);
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

    const prd = await prisma.prd.findUnique({
      where: {
        repoFullName: repoFullName,
      },
    });

    if (!prd || prd.userId !== userId) {
      return new NextResponse("Not found or unauthorized", { status: 404 });
    }

    await prisma.prd.delete({
      where: {
        repoFullName: repoFullName,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PRD_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
