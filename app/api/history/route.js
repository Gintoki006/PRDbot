import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const repoFullName = searchParams.get("repoFullName");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // Build query filter
    const where = {};

    if (repoFullName) {
      // Verify user owns this repo
      const repo = await prisma.repository.findUnique({
        where: { repoFullName },
      });

      if (!repo || repo.userId !== userId) {
        return new NextResponse("Not found", { status: 404 });
      }

      where.repoFullName = repoFullName;
    } else {
      // Get all repos belonging to user
      const userRepos = await prisma.repository.findMany({
        where: { userId },
        select: { repoFullName: true },
      });

      where.repoFullName = {
        in: userRepos.map((r) => r.repoFullName),
      };
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      prisma.agentAction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.agentAction.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[HISTORY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
