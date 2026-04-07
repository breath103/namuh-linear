"use client";

import { signIn } from "@/lib/auth-client";
import { useEffect, useState } from "react";

type LoginStep = "choose" | "email-input" | "email-code";

const authErrorMessages: Record<string, string> = {
  INVALID_TOKEN:
    "That sign-in code is invalid. Request a new email and try again.",
  EXPIRED_TOKEN: "That sign-in code expired. Request a new email to continue.",
  ATTEMPTS_EXCEEDED:
    "That sign-in code has already been used. Request a new email to continue.",
};

function getSafeCallbackUrl(): string {
  if (typeof window === "undefined") {
    return "/";
  }

  const callbackUrl = new URLSearchParams(window.location.search).get(
    "callbackUrl",
  );

  if (
    !callbackUrl ||
    !callbackUrl.startsWith("/") ||
    callbackUrl.startsWith("//")
  ) {
    return "/";
  }

  return callbackUrl;
}

function getErrorCallbackUrl(callbackUrl: string): string {
  if (callbackUrl === "/") {
    return "/login";
  }

  const errorCallbackUrl = new URL("/login", window.location.origin);
  errorCallbackUrl.searchParams.set("callbackUrl", callbackUrl);
  return `${errorCallbackUrl.pathname}${errorCallbackUrl.search}`;
}

export default function LoginPage() {
  const [step, setStep] = useState<LoginStep>("choose");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("error");
    if (authError && authErrorMessages[authError]) {
      setError(authErrorMessages[authError]);
    }
  }, []);

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");
    await signIn.social({
      provider: "google",
      callbackURL: getSafeCallbackUrl(),
    });
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError("");

    try {
      const callbackUrl = getSafeCallbackUrl();
      await signIn.magicLink({
        email,
        callbackURL: callbackUrl,
        errorCallbackURL: getErrorCallbackUrl(callbackUrl),
      });
      setCode("");
      setStep("email-code");
    } catch {
      setError("Failed to send magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();

    const normalizedCode = code.replace(/\D/g, "").slice(0, 6);
    if (normalizedCode.length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    const verifyUrl = new URL(
      "/api/auth/magic-link/verify",
      window.location.origin,
    );
    const callbackUrl = getSafeCallbackUrl();
    verifyUrl.searchParams.set("token", normalizedCode);
    verifyUrl.searchParams.set("callbackURL", callbackUrl);
    verifyUrl.searchParams.set(
      "errorCallbackURL",
      getErrorCallbackUrl(callbackUrl),
    );
    window.location.assign(verifyUrl.toString());
  }

  return (
    <div className="w-full max-w-[340px] px-4">
      {/* Logo & Title */}
      <div className="mb-10 flex flex-col items-center">
        <svg
          width="48"
          height="48"
          viewBox="0 0 100 100"
          fill="none"
          role="img"
          aria-label="Linear logo"
          className="mb-5"
        >
          <path
            d="M5.22 51.09a49.4 49.4 0 0 0 43.69 43.69L5.22 51.09Z"
            fill="#5E6AD2"
          />
          <path
            d="M1.01 40.94a49.54 49.54 0 0 0 58.05 58.05L1.01 40.94Z"
            fill="#5E6AD2"
          />
          <path
            d="M3.42 27.2A49.58 49.58 0 0 0 72.8 96.58L3.42 27.2Z"
            fill="#5E6AD2"
          />
          <path
            d="M10.57 16.1A49.53 49.53 0 0 0 83.9 89.43L10.57 16.1Z"
            fill="#5E6AD2"
          />
          <path
            d="M21.07 8.53a49.46 49.46 0 0 0 70.4 70.4A49.53 49.53 0 0 0 21.07 8.53Z"
            fill="#5E6AD2"
          />
          <path
            d="M34.7 3.68a49.46 49.46 0 0 0 61.6 61.63A49.54 49.54 0 0 0 34.7 3.68Z"
            fill="#5E6AD2"
          />
          <path
            d="M50.58.16a49.4 49.4 0 0 0 49.26 49.26A49.41 49.41 0 0 0 50.58.16Z"
            fill="#5E6AD2"
          />
        </svg>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-white">
          Log in to Linear
        </h1>
        <p className="mt-2 text-sm text-[#6b6f76]">
          Build software better, together.
        </p>
      </div>

      {step === "choose" && (
        <div className="space-y-2.5">
          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-[#26262a] bg-[#18181b] px-4 py-[10px] text-[13px] font-medium text-white/90 transition-colors hover:bg-[#222226] hover:border-[#303036] disabled:opacity-50"
          >
            <svg
              width="16"
              height="16"
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
            className="flex w-full items-center justify-center gap-3 rounded-md border border-[#26262a] bg-[#18181b] px-4 py-[10px] text-[13px] font-medium text-white/90 transition-colors hover:bg-[#222226] hover:border-[#303036] disabled:opacity-50"
          >
            <svg
              width="16"
              height="16"
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

          {error && (
            <p className="pt-1 text-center text-sm text-red-400">{error}</p>
          )}
        </div>
      )}

      {step === "email-input" && (
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address..."
            required
            className="w-full rounded-md border border-[#26262a] bg-[#18181b] px-3.5 py-[10px] text-[13px] text-white placeholder-[#555] outline-none transition-colors focus:border-[#5E6AD2]"
          />
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full rounded-md bg-[#5E6AD2] px-4 py-[10px] text-[13px] font-medium text-white transition-colors hover:bg-[#4F5ABF] disabled:opacity-50"
          >
            {loading ? "Sending..." : "Continue with Email"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep("choose");
              setError("");
              setCode("");
            }}
            className="w-full pt-1 text-center text-[13px] text-[#6b6f76] transition-colors hover:text-white"
          >
            Back to login options
          </button>
          {error && <p className="text-center text-sm text-red-400">{error}</p>}
        </form>
      )}

      {step === "email-code" && (
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#26262a] bg-[#18181b]">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5E6AD2"
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
            <h2 className="text-[15px] font-medium text-white">
              Check your email
            </h2>
            <p className="mt-1.5 text-[13px] text-[#6b6f76]">
              We sent a sign-in link and 6-digit code to{" "}
              <span className="text-white">{email}</span>
            </p>
          </div>
          <form onSubmit={handleCodeSubmit} className="space-y-3 text-left">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full rounded-md border border-[#26262a] bg-[#18181b] px-3.5 py-[10px] text-center text-[15px] tracking-[0.35em] text-white placeholder-[#555] outline-none transition-colors focus:border-[#5E6AD2]"
            />
            <button
              type="submit"
              disabled={code.length !== 6}
              className="w-full rounded-md bg-[#5E6AD2] px-4 py-[10px] text-[13px] font-medium text-white transition-colors hover:bg-[#4F5ABF] disabled:opacity-50"
            >
              Continue with code
            </button>
            {error && (
              <p className="text-center text-sm text-red-400">{error}</p>
            )}
          </form>
          <button
            type="button"
            onClick={() => {
              setStep("choose");
              setEmail("");
              setCode("");
              setError("");
            }}
            className="text-[13px] text-[#6b6f76] transition-colors hover:text-white"
          >
            Use a different method
          </button>
        </div>
      )}

      {/* Footer */}
      <p className="mt-10 text-center text-[11px] leading-relaxed text-[#555]">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
