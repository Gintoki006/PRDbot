import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  // Handles the OAuth redirect from Clerk and sends the user to the dashboard
  return <AuthenticateWithRedirectCallback />;
}
