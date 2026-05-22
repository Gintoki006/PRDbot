import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { inngest } from "../../../../lib/inngest/client";

export const runtime = "nodejs";

const rateLimit = new Map();

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    // Clean up old entries
    for (const [key, timestamp] of rateLimit.entries()) {
      if (timestamp < windowStart) {
        rateLimit.delete(key);
      }
    }

    const userRequests = Array.from(rateLimit.values()).filter(t => t > windowStart && rateLimit.get(userId) === t).length;
    // Actually, simple array of timestamps per user
    const userTimes = rateLimit.get(userId) || [];
    const recentTimes = userTimes.filter(t => t > windowStart);
    
    if (recentTimes.length >= 5) {
      return new NextResponse("Rate limit exceeded. Try again in a minute.", { status: 429 });
    }
    
    recentTimes.push(now);
    rateLimit.set(userId, recentTimes);

    const body = await req.json();
    const { repoFullName, issueTitle, issueBody } = body;

    if (!repoFullName || !issueTitle) {
      return new NextResponse("Missing required fields (repoFullName, issueTitle)", {
        status: 400,
      });
    }

    // Validate that the repo belongs to the user
    const repository = await prisma.repository.findUnique({
      where: { repoFullName },
    });

    if (!repository || repository.userId !== userId) {
      return new NextResponse("Repository not found or unauthorized", {
        status: 404,
      });
    }

    // Check that a PRD exists for this repo
    const prd = await prisma.prd.findUnique({
      where: { repoFullName },
    });

    if (!prd) {
      return new NextResponse("No PRD found for this repository. Upload a PRD first.", {
        status: 400,
      });
    }

    // Send Inngest event with simulated: true
    await inngest.send({
      name: "agent/issue.created",
      data: {
        repoFullName,
        issueNumber: 0,
        issueTitle,
        issueBody: issueBody || "",
        simulated: true,
      },
    });

    return NextResponse.json(
      { message: "Simulation started", repoFullName },
      { status: 202 }
    );
  } catch (error) {
    console.error("[SIMULATE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
