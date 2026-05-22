"use client";

import { useClerk, useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CustomSignUp() {
  const { isLoaded } = useAuth();
  const { client, setActive } = useClerk();
  const signUp = client?.signUp;

  const [emailAddress, setEmailAddress] = useState("");
  const [code, setCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!isLoaded) { setError("Clerk is not fully loaded. Please wait."); return; }
    setError("");
    try {
      await signUp.create({ emailAddress });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      console.error("Error creating sign-up:", err);
      setError(err.errors?.[0]?.longMessage || "An error occurred during sign up.");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError("");
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/dashboard");
      } else {
        console.warn("SignUp status not complete:", completeSignUp);
        setError("Failed to complete sign-up. Please try again.");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError(err.errors?.[0]?.longMessage || "Invalid OTP code.");
    }
  };

  const signUpWithGithub = async () => {
    if (!isLoaded) { setError("Clerk is not fully loaded. Please wait."); return; }
    setError("");
    try {
      await signUp.authenticateWithRedirect({ strategy: "oauth_github", redirectUrl: "/sso-callback", redirectUrlComplete: "/dashboard" });
    } catch (err) {
      console.error("Error signing up with GitHub:", err);
      setError(err.errors?.[0]?.longMessage || "GitHub sign-up is not enabled or an error occurred.");
    }
  };

  return (
    <div className="w-full">
      <div className="text-left mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Create an account</h2>
        <p className="text-[#8b949e] text-sm mt-2">Join PRDbot to automate your workflow</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-md">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!pendingVerification ? (
        <>
          <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-white">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 bg-[#0d1117] border border-[#30363d] rounded text-white text-sm placeholder-[#8b949e] focus:outline-none focus:ring-1 focus:ring-[#58a6ff] focus:border-[#58a6ff] transition-colors"
              />
            </div>
            <button type="submit" className="gh-btn-primary w-full py-2.5 rounded font-semibold mt-2 flex items-center justify-center gap-2 text-sm transition-colors">
              Send OTP Code
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#30363d]"></div>
            <span className="text-[11px] text-[#8b949e] uppercase font-semibold">Or continue with</span>
            <div className="flex-1 h-px bg-[#30363d]"></div>
          </div>

          <button
            onClick={signUpWithGithub}
            type="button"
            className="w-full py-2.5 px-4 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#8b949e] text-[#c9d1d9] rounded font-semibold transition-all flex items-center justify-center gap-3 text-sm"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"></path>
            </svg>
            GitHub
          </button>
        </>
      ) : (
        <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="code" className="text-sm font-medium text-white">
              Verification Code
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              required
              className="w-full px-3 py-2.5 bg-[#0d1117] border border-[#30363d] rounded text-white text-sm placeholder-[#8b949e] focus:outline-none focus:ring-1 focus:ring-[#58a6ff] focus:border-[#58a6ff] transition-colors"
            />
            <p className="text-xs text-[#8b949e] mt-1">We sent a code to {emailAddress}</p>
          </div>
          <button type="submit" className="gh-btn-primary w-full py-2.5 rounded font-semibold mt-2 flex items-center justify-center gap-2 text-sm transition-colors">
            Verify & Create Account
          </button>
          <button
            type="button"
            onClick={() => setPendingVerification(false)}
            className="text-sm text-[#8b949e] hover:text-white transition-colors mt-2 text-left"
          >
            Back to email
          </button>
        </form>
      )}

      <div className="mt-8 text-left">
        <p className="text-[#8b949e] text-sm">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-white hover:text-[#58a6ff] transition-colors font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
