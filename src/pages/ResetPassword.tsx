import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when the reset link is clicked
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Also check if already in recovery session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords don't match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError(error.message); setLoading(false); return; }
    setDone(true);
    setTimeout(() => navigate("/"), 2000);
  }

  return (
    <div style={{
      minHeight: "100dvh", background: "#fff",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px",
    }}>
      {/* Logo */}
      <img src="/logo.png" alt="nyc.pet" style={{ height: 36, filter: "brightness(0)", marginBottom: 32 }} />

      <div style={{
        width: "100%", maxWidth: 360,
        background: "#fff", borderRadius: 20,
        boxShadow: "0 4px 32px rgba(0,0,0,0.1)",
        padding: "32px 24px",
      }}>
        {done ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111", marginBottom: 8 }}>Password Updated!</h2>
            <p style={{ fontSize: 14, color: "#777" }}>Redirecting you home...</p>
          </div>
        ) : !ready ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⏳</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 8 }}>Verifying link...</h2>
            <p style={{ fontSize: 13, color: "#777" }}>If this takes too long, request a new reset link.</p>
            <button onClick={() => navigate("/login")} style={{
              marginTop: 16, background: "#111", color: "#fff",
              border: "none", borderRadius: 12, padding: "12px 24px",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>Back to Login</button>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111", marginBottom: 4 }}>Set New Password</h2>
            <p style={{ fontSize: 13, color: "#777", marginBottom: 24 }}>Choose a strong password for your account.</p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "14px 44px 14px 14px",
                    borderRadius: 12, border: "1.5px solid #e5e5e5",
                    fontSize: 15, outline: "none", boxSizing: "border-box",
                    background: "#fafafa",
                  }}
                />
                <button type="button" onClick={() => setShowPass(v => !v)} style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#aaa",
                }}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <input
                type={showPass ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                style={{
                  width: "100%", padding: "14px",
                  borderRadius: 12, border: "1.5px solid #e5e5e5",
                  fontSize: 15, outline: "none", boxSizing: "border-box",
                  background: "#fafafa",
                }}
              />

              {error && <p style={{ color: "#e53935", fontSize: 13, margin: 0 }}>{error}</p>}

              <button type="submit" disabled={loading} style={{
                background: "#111", color: "#fff", border: "none",
                borderRadius: 12, padding: "14px", fontSize: 15,
                fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1, marginTop: 4,
              }}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
