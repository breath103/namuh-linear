"use client";

import { signIn } from "@/lib/auth-client";
import { useState } from "react";

type LoginStep = "choose" | "email-input" | "email-sent";

export default function LoginPage() {
  const [step, setStep] = useState<LoginStep>("choose");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");
    await signIn.social({ provider: "google", callbackURL: "/" });
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      await signIn.magicLink({ email, callbackURL: "/" });
      setStep("email-sent");
    } catch {
      setError("Failed to send magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[360px] px-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#7180ff]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            role="img"
            aria-label="Linear logo"
          >
            <path
              d="M2 10L10 2L18 10L10 18L2 10Z"
              fill="white"
              fillOpacity="0.9"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-white">Log in to Linear</h1>
      </div>

      {step === "choose" && (
        <div className="space-y-3">
          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#2a2a2e] bg-[#1c1c20] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#25252a] disabled:opacity-50"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              role="img"
              aria-label="Google"
            >
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Email magic link */}
          <button
            type="button"
            onClick={() => setStep("email-input")}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#2a2a2e] bg-[#1c1c20] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#25252a] disabled:opacity-50"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              role="img"
              aria-label="Email"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Continue with Email
          </button>

          {error && <p className="text-center text-sm text-red-400">{error}</p>}
        </div>
      )}

      {step === "email-input" && (
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              className="w-full rounded-lg border border-[#2a2a2e] bg-[#1c1c20] px-4 py-2.5 text-sm text-white placeholder-[#6b6f76] outline-none focus:border-[#7180ff] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full rounded-lg bg-[#7180ff] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5c6be6] disabled:opacity-50"
          >
            {loading ? "Sending..." : "Continue with Email"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("choose");
              setError("");
            }}
            className="w-full text-center text-sm text-[#6b6f76] hover:text-white transition-colors"
          >
            Back to login options
          </button>
          {error && <p className="text-center text-sm text-red-400">{error}</p>}
        </form>
      )}

      {step === "email-sent" && (
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1c1c20] border border-[#2a2a2e]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7180ff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              role="img"
              aria-label="Email sent"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-medium text-white mb-1">
              Check your email
            </h2>
            <p className="text-sm text-[#6b6f76]">
              We sent a sign-in link to{" "}
              <span className="text-white">{email}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setStep("choose");
              setEmail("");
              setError("");
            }}
            className="text-sm text-[#6b6f76] hover:text-white transition-colors"
          >
            Use a different method
          </button>
        </div>
      )}

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-[#6b6f76]">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
