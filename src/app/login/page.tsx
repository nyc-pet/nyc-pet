"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { Turnstile } from "@marsidev/react-turnstile";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

function LoginForm() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const redirectTo    = searchParams.get("redirectTo") ?? "/";

  const [mode, setMode]           = useState<"signin" | "signup" | "reset">("signin");

  function switchMode(m: "signin" | "signup" | "reset") {
    setMode(m);
    setError("");
    setSuccess("");
    // Don't reset turnstile on mode switch — the silent check token stays valid.
    // It only resets on error/expire (handled by onError/onExpire props).
  }
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Please complete the security check.");
      setLoading(false);
      return;
    }

    const captchaToken = TURNSTILE_SITE_KEY ? turnstileToken : undefined;

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken } });
      if (error) { setError(error.message); setLoading(false); setTurnstileKey(k => k + 1); return; }
      router.push(redirectTo);
      return;
    }

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
          captchaToken,
        },
      });
      if (error) { setError(error.message); setLoading(false); setTurnstileKey(k => k + 1); return; }
      setSuccess("Account created! Check your email to verify before signing in.");
      setLoading(false);
      return;
    }

    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=/profile`,
        captchaToken,
      } as Parameters<typeof supabase.auth.resetPasswordForEmail>[1]);
      if (error) { setError(error.message); setLoading(false); setTurnstileKey(k => k + 1); return; }
      setSuccess("Password reset email sent! Check your inbox.");
      setLoading(false);
      return;
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}` },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  async function handleFacebook() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}` },
    });
    if (error) { setError(error.message); setLoading(false); }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Image src="/new-logo-nyc-pet.png" alt="nyc.pet" width={180} height={66} className="h-16 w-auto" style={{ filter: "brightness(0)" }} />
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button onClick={() => switchMode("signin")}
            className={`flex-1 py-4 font-fredoka font-semibold text-base transition-colors ${mode === "signin" ? "text-[#1c314e] border-b-2 border-[#1c314e]" : "text-gray-400 hover:text-gray-600"}`}>
            Sign In
          </button>
          <button onClick={() => switchMode("signup")}
            className={`flex-1 py-4 font-fredoka font-semibold text-base transition-colors ${mode === "signup" ? "text-[#1c314e] border-b-2 border-[#1c314e]" : "text-gray-400 hover:text-gray-600"}`}>
            Create Account
          </button>
        </div>

        <div className="p-8 space-y-4">
          {mode !== "reset" && (
            <>
              {/* Google */}
              <button onClick={handleGoogle} disabled={loading}
                className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:bg-gray-50 rounded-2xl py-3.5 font-nunito font-semibold text-sm text-gray-700 transition-colors disabled:opacity-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <button onClick={handleFacebook} disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166FE5] rounded-2xl py-3.5 font-nunito font-semibold text-sm text-white transition-colors disabled:opacity-50">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="font-nunito text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block font-nunito text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3.5 border border-gray-200 rounded-2xl font-nunito text-sm focus:outline-none focus:ring-2 focus:ring-[#1c314e]/30 focus:border-[#1c314e] placeholder:text-gray-300" />
              </div>
            </div>

            {/* Password */}
            {mode !== "reset" && (
              <div>
                <label className="block font-nunito text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPass ? "text" : "password"} required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder={mode === "signup" ? "Create a password (min 6 chars)" : "Your password"}
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3.5 border border-gray-200 rounded-2xl font-nunito text-sm focus:outline-none focus:ring-2 focus:ring-[#1c314e]/30 focus:border-[#1c314e] placeholder:text-gray-300" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === "signin" && (
                  <button type="button" onClick={() => switchMode("reset")}
                    className="mt-1.5 font-nunito text-xs text-[#1c314e] hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {/* Turnstile — on all auth forms */}
            {TURNSTILE_SITE_KEY && (
              <div className="flex justify-center">
                <Turnstile
                  key={turnstileKey}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={setTurnstileToken}
                  onError={() => setError("Security check failed. Please refresh and try again.")}
                  onExpire={() => { setTurnstileToken(""); setTurnstileKey(k => k + 1); }}
                  options={{ theme: "light", size: "normal", appearance: "always" }}
                />
              </div>
            )}

            {error   && <p className="font-nunito text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>}
            {success && <p className="font-nunito text-sm text-green-600 bg-green-50 rounded-xl px-4 py-2.5">{success}</p>}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#1c314e] hover:bg-[#1c314e]/80 text-white font-fredoka font-semibold text-lg py-3.5 rounded-2xl transition-colors disabled:opacity-50">
              {loading ? "Please wait…" : mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Email"}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          {mode === "reset" && (
            <button onClick={() => switchMode("signin")}
              className="w-full font-nunito text-sm text-gray-400 hover:text-gray-600 text-center">
              ← Back to Sign In
            </button>
          )}
        </div>
      </div>

      <p className="font-nunito text-xs text-gray-400 text-center mt-6 px-4">
        By continuing you agree to our{" "}
        <a href="/terms" className="underline hover:text-gray-600">Terms</a> and{" "}
        <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16"
      style={{ background: "linear-gradient(135deg, #f0f4f8 0%, #dce8f5 100%)" }}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
