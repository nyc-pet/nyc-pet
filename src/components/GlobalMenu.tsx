import { useNavigate } from "react-router-dom";
import { Info, HelpCircle, Heart, Phone, FileText, ChevronRight } from "lucide-react";
import { useTheme } from "../lib/themeContext";

export default function GlobalMenu() {
  const navigate = useNavigate();
  const { menuOpen, setMenuOpen } = useTheme();

  if (!menuOpen) return null;

  function close() { setMenuOpen(false); }
  function go(path: string) { close(); navigate(path); }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: "fixed", inset: 0, zIndex: 9000,
          background: "rgba(0,0,0,0.3)",
          animation: "fadeIn 0.2s ease",
        }}
      />

      {/* Sheet — filter drop-shadow follows the arch shape */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9001,
        maxHeight: "85dvh",
        display: "flex", flexDirection: "column",
        animation: "slideUp 0.3s cubic-bezier(0.32,0.72,0,1)",
        filter: "drop-shadow(0 -6px 20px rgba(0,0,0,0.2))",
      }}>
        {/* Arch SVG — pure white, same as sheet */}
        <svg
          style={{ position: "absolute", bottom: "calc(100% - 1px)", left: 0, width: "100%", display: "block" }}
          viewBox="0 0 390 34"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path fill="white" d="M0 34 C0 15 15 0 34 0 H136 C159 0 175 28 195 28 C215 28 231 0 254 0 H356 C375 0 390 15 390 34 Z"/>
        </svg>

        {/* Close button */}
        <button
          onClick={close}
          aria-label="Close"
          style={{
            position: "absolute", top: -53, left: "50%", transform: "translateX(-50%)",
            width: 44, height: 44, border: 0, borderRadius: "50%",
            background: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 700, lineHeight: 1, color: "#111",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            cursor: "pointer",
          }}
        >
          ×
        </button>

        {/* Scrollable content */}
        <div style={{ background: "#fff", overflowY: "auto", WebkitOverflowScrolling: "touch" as any }}>
          {[
            { icon: Info,       label: "About Us",        path: "/about" },
            { icon: HelpCircle, label: "How to Help",     path: "/how-to-help" },
            { icon: Heart,      label: "Success Stories", path: "/success-stories" },
            { icon: Phone,      label: "Contact Us",      path: "/contact" },
            { icon: FileText,   label: "Safety Tips",     path: "/safety-tips" },
          ].map(({ icon: Icon, label, path }) => (
            <button
              key={label}
              onClick={() => go(path)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 16,
                padding: "16px 24px", background: "none", border: "none",
                cursor: "pointer", textAlign: "left",
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={20} color="#333" />
              </div>
              <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#111" }}>{label}</p>
              <ChevronRight size={16} color="#c4c4c4" />
            </button>
          ))}

          {/* Footer pill links */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: "16px 24px calc(110px + env(safe-area-inset-bottom))" }}>
            {[
              { label: "Privacy Policy", path: "/privacy" },
              { label: "Terms of Service", path: "/terms" },
            ].map(({ label, path }) => (
              <button
                key={label}
                onClick={() => go(path)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 999,
                  border: "1.5px solid #e4e4e4",
                  background: "#fafafa",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#666",
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
      `}</style>
    </>
  );
}
