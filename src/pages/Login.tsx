import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ArrowLeft, Eye, EyeOff, Square, CheckSquare } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";

  const [mode, setMode] = useState<"signin" | "signup" | "reset">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [agreedToTos, setAgreedToTos] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) { setError(error.message); setLoading(false); return; }
      setSuccess("Check your email for a password reset link!");
      setLoading(false);
    } else if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      navigate("/profile");
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      setSuccess("Check your email to verify your account!");
      setLoading(false);
    }
  }

  const canSubmit = mode === "signup" ? agreedToTos : true;

  return (
    <div style={{ minHeight: "100dvh", background: "var(--white)", padding: "60px 24px 40px", display: "flex", flexDirection: "column" }}>
      <button
        onClick={() => navigate("/")}
        style={{ width: 40, height: 40, borderRadius: 20, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 32 }}
      >
        <ArrowLeft size={18} color="#111" />
      </button>

      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <img src="/logo.png" alt="nyc.pet" style={{ height: 80, filter: "brightness(0)", display: "block", margin: "0 auto 12px" }} />
        <p style={{ fontSize: 14, color: "var(--gray-4)" }}>NYC's lost & found for pets</p>
      </div>

      {/* Mode toggle */}
      <div style={{ display: "flex", background: "var(--gray-1)", borderRadius: 16, padding: 4, marginBottom: 28 }}>
        {(["signin", "signup"] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setError(""); setAgreedToTos(false); }}
            style={{ flex: 1, padding: "11px", borderRadius: 12, fontSize: 14, fontWeight: 700, background: mode === m ? "var(--white)" : "none", color: mode === m ? "#000" : "var(--gray-4)", boxShadow: mode === m ? "var(--shadow-sm)" : "none", transition: "all 0.2s" }}>
            {m === "signin" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#000", display: "block", marginBottom: 8 }}>Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
            style={{ width: "100%", padding: "14px 16px", background: "var(--gray-1)", borderRadius: 14, fontSize: 15, color: "#000" }} />
        </div>
        {mode !== "reset" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "#000" }}>Password</label>
              {mode === "signin" && (
                <button type="button" onClick={() => { setMode("reset"); setError(""); setSuccess(""); }}
                  style={{ fontSize: 12, color: "#555", fontWeight: 600 }}>Forgot password?</button>
              )}
            </div>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" minLength={6}
                style={{ width: "100%", padding: "14px 48px 14px 16px", background: "var(--gray-1)", borderRadius: 14, fontSize: 15, color: "#000" }} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
                {showPass ? <EyeOff size={18} color="var(--gray-4)" /> : <Eye size={18} color="var(--gray-4)" />}
              </button>
            </div>
          </div>
        )}

        {mode === "reset" && (
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>
            Enter your email and we'll send you a link to reset your password.
            <button type="button" onClick={() => setMode("signin")} style={{ color: "#111", fontWeight: 700, marginLeft: 4 }}>Back to Sign In</button>
          </p>
        )}

        {/* Terms of Service checkbox — signup only */}
        {mode === "signup" && (
          <button type="button" onClick={() => setAgreedToTos(v => !v)}
            style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "none", textAlign: "left", padding: "4px 0" }}>
            <div style={{ flexShrink: 0, marginTop: 1 }}>
              {agreedToTos
                ? <CheckSquare size={20} color="#111" strokeWidth={2} />
                : <Square size={20} color="#ccc" strokeWidth={2} />
              }
            </div>
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
              I agree to the{" "}
              <Link
                to="/terms"
                onClick={e => e.stopPropagation()}
                style={{ color: "#111", fontWeight: 700, textDecoration: "underline" }}
              >
                Terms of Service
              </Link>
              {" "}and{" "}
              <Link
                to="/terms"
                onClick={e => e.stopPropagation()}
                style={{ color: "#111", fontWeight: 700, textDecoration: "underline" }}
              >
                Privacy Policy
              </Link>
            </p>
          </button>
        )}

        {error && <p style={{ fontSize: 13, color: "var(--lost)", background: "#fff0ef", borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>{error}</p>}
        {success && <p style={{ fontSize: 13, color: "var(--found)", background: "#f0fff4", borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>{success}</p>}

        <button type="submit" disabled={loading || !canSubmit}
          style={{ width: "100%", padding: "17px", background: "#111", color: "#fff", borderRadius: 16, fontSize: 16, fontWeight: 700, marginTop: 8, opacity: (loading || !canSubmit) ? 0.4 : 1, transition: "opacity 0.2s" }}>
          {loading ? "Please wait…" : mode === "signin" ? "Sign In" : mode === "reset" ? "Send Reset Link" : "Create Account"}
        </button>
      </form>
    </div>
  );
}
