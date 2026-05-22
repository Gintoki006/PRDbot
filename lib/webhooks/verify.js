import crypto from "crypto";

/**
 * Verify GitHub webhook signature using HMAC SHA-256.
 * Uses timing-safe comparison to prevent timing attacks.
 *
 * @param {string} payload - The raw request body as a string
 * @param {string} signature - The x-hub-signature-256 header value
 * @param {string} secret - The GITHUB_WEBHOOK_SECRET from env
 * @returns {boolean} Whether the signature is valid
 */
export function verifyWebhookSignature(payload, signature, secret) {
  if (!signature || !secret) {
    return false;
  }

  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(payload, "utf8").digest("hex");

  const sigBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}
