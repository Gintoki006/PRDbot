import { Octokit } from "@octokit/rest";

/**
 * Creates an authenticated Octokit instance using a GitHub OAuth token.
 * 
 * @param {string} token - The GitHub OAuth access token retrieved from Clerk
 * @returns {Octokit} Configured Octokit instance
 */
export function createOctokit(token) {
  return new Octokit({
    auth: token,
  });
}
