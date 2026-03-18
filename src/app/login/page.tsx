"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Mail, ArrowRight } from "lucide-react";
import PawIcon from "@/components/PawIcon";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-4">📬</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
        <p className="text-gray-500 text-sm">
          We sent a magic link to <strong>{email}</strong>.<br />
          Click it to sign in — no password needed.
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Didn&apos;t get it? Check your spam folder or{" "}
          <button
            onClick={() => setSent(false)}
            className="text-blue-500 hover:underline"
          >
            try again
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 text-[#1c314e] font-fredoka font-semibold text-2xl mb-4">
          <PawIcon className="w-6 h-6" />
          nyc.pet
        </div>
        <h1 className="font-fredoka text-3xl font-semibold text-gray-900 mb-1">Welcome back</h1>
        <p className="font-nunito text-gray-500 text-sm leading-relaxed">
          Sign in to post or manage your lost &amp; found reports. No password needed — just a magic link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            className="w-full border border-gray-200 rounded-2xl pl-11 pr-4 py-4 font-nunito text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder:text-gray-300"
          />
        </div>

        {error && (
          <p className="font-nunito text-sm text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1c314e] hover:bg-blue-600 disabled:bg-blue-300 text-white font-fredoka font-semibold text-lg py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
        >
          {loading ? "Sending…" : (
            <>Send Magic Link <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-gray-100 text-center">
        <p className="font-nunito text-xs text-gray-400">
          By signing in you agree to our{" "}
          <a href="/terms" className="text-blue-500 hover:underline">Terms of Service</a>.
          <br/>Your email is only used to manage your reports.
        </p>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center px-4">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-bg.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/30 to-black/75" />

      {/* Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 w-full max-w-md">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
