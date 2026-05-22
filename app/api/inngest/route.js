import { serve } from "inngest/next";
import { inngest } from "../../../lib/inngest/client";
import { agentFunction } from "../../../lib/inngest/functions";

export const runtime = "nodejs";

const handler = serve({
  client: inngest,
  functions: [agentFunction],
});

export const GET = handler;
export const POST = handler;
export const PUT = handler;
