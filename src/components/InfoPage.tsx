import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  title: string;
  subtitle?: string;
  heroColor?: string;
  heroIcon?: ReactNode;
  showLogo?: boolean;
  centerHeader?: boolean;
  children: ReactNode;
}

export default function InfoPage({
  title,
  subtitle,
  heroColor = "linear-gradient(160deg,#111 0%,#2d2d2d 100%)",
  heroIcon,
  showLogo = false,
  centerHeader = true,
  children,
}: Props) {
  const navigate = useNavigate();

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* Hero — fixed height, never scrolls */}
      <div style={{
        background: heroColor,
        flexShrink: 0,
        height: 220,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: centerHeader ? "0 24px 52px" : "0 24px 52px",
        textAlign: centerHeader ? "center" : "left",
      }}>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute", top: 54, left: 20,
            width: 40, height: 40, borderRadius: 20,
            background: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            border: "none", cursor: "pointer",
          }}
        >
          <ArrowLeft size={18} color="#111" />
        </button>

        {/* Logo */}
        {showLogo && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <img
              src="/logo.png"
              alt="nyc.pet"
              style={{ height: 36, objectFit: "contain" }}
              onError={(e) => {
                // fallback to text if logo image missing
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}

        {/* Icon (only shown if no logo) */}
        {heroIcon && !showLogo && (
          <div style={{ marginBottom: 12, display: centerHeader ? "flex" : "block", justifyContent: "center" }}>
            {heroIcon}
          </div>
        )}

        <h1 style={{
          fontSize: 30, fontWeight: 700, color: "#fff", lineHeight: 1.2,
          margin: 0,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 6, marginBottom: 0 }}>
            {subtitle}
          </p>
        )}

        {/* Arch SVG — merges hero into white sheet */}
        <svg
          style={{ position: "absolute", bottom: -1, left: 0, width: "100%", display: "block" }}
          viewBox="0 0 390 34"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path fill="#fff" d="M0 34 C0 15 15 0 34 0 H136 C159 0 175 28 195 28 C215 28 231 0 254 0 H356 C375 0 390 15 390 34 Z"/>
        </svg>
      </div>

      {/* Scrollable white sheet */}
      <div style={{
        background: "#fff",
        borderRadius: 0,
        marginTop: -1,
        flex: 1,
        overflowY: "auto",
        position: "relative",
        zIndex: 1,
        WebkitOverflowScrolling: "touch" as any,
      }}>
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "16px 0 8px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
        </div>
        <div style={{ padding: "8px 24px 100px" }}>
          {children}
        </div>
      </div>

    </div>
  );
}
