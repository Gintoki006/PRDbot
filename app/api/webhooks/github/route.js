import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "../../../../lib/webhooks/verify";
import { inngest } from "../../../../lib/inngest/client";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    // Step 1: Read the raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

    // Step 2: Verify signature
    if (!webhookSecret) {
      console.error("[WEBHOOK] GITHUB_WEBHOOK_SECRET not configured");
      return new NextResponse("Server configuration error", { status: 500 });
    }

    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.error("[WEBHOOK] Signature verification failed");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Step 3: Parse payload
    const payload = JSON.parse(rawBody);
    const event = req.headers.get("x-github-event");

    // Step 4: Only handle 'issues' events with action 'opened'
    if (event !== "issues") {
      return NextResponse.json(
        { message: `Ignored event: ${event}` },
        { status: 200 }
      );
    }

    if (payload.action !== "opened") {
      return NextResponse.json(
        { message: `Ignored action: ${payload.action}` },
        { status: 200 }
      );
    }

    // Step 5: Extract issue data
    const repoFullName = payload.repository?.full_name;
    const issueNumber = payload.issue?.number;
    const issueTitle = payload.issue?.title || "";
    const issueBody = payload.issue?.body || "";

    if (!repoFullName || !issueNumber) {
      console.error("[WEBHOOK] Missing repo or issue data", {
        repoFullName,
        issueNumber,
      });
      return new NextResponse("Bad request", { status: 400 });
    }

    console.log(
      `[WEBHOOK] New issue #${issueNumber} on ${repoFullName}: "${issueTitle}"`
    );

    // Step 6: Send Inngest event
    await inngest.send({
      name: "agent/issue.created",
      data: {
        repoFullName,
        issueNumber,
        issueTitle,
        issueBody,
        simulated: false,
      },
    });

    // Step 7: Respond 202 Accepted immediately
    return NextResponse.json(
      { message: "Event accepted", issueNumber, repoFullName },
      { status: 202 }
    );
  } catch (err) {
    console.error("[WEBHOOK] Unhandled error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
