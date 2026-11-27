import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../lib/themeContext";
import { useState } from "react";
import ReportGate from "./ReportGate";

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isDark, menuOpen } = useTheme();
  const [showGate, setShowGate] = useState(false);
  const bg = isDark ? "white" : "#111";
  const activeColor = isDark ? "#111" : "#fff";
  const inactiveColor = isDark ? "#858585" : "#666";

  const active = (path: string) => pathname === path;

  return (
    <>
    <nav style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      display: menuOpen ? "none" : "flex",
      right: 0,
      justifyContent: "center",
      padding: "0 0 calc(14px + env(safe-area-inset-bottom))",
      zIndex: 10000,
      pointerEvents: "none",
    }}>
      <div style={{
        position: "relative",
        width: "min(94vw, 612px)",
        aspectRatio: "612/166",
        containerType: "inline-size",
        isolation: "isolate",
        pointerEvents: "all",
      }}>

        {/* White arch-pill shell — exact path from reference */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.22)) drop-shadow(0 1px 6px rgba(0,0,0,0.18)) drop-shadow(0 8px 32px rgba(0,0,0,0.14))" }}
          viewBox="0 0 612 166"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path fill={bg} d="M64 37 H200 C238 37 267 0 305 0 C343 0 374 37 412 37 H546 C582 37 611 66 611 101 C611 137 582 165 546 165 H64 C29 165 0 137 0 101 C0 66 29 37 64 37 Z"/>
        </svg>

        {/* Home (was Map) — first slot */}
        <button onClick={() => navigate("/")} style={itemStyle(active("/"), activeColor, inactiveColor)}>
          <svg viewBox="0 0 28 28" style={iconStyle}>
            <path
              d="M14 1C7.8 1 3.5 5.8 3.5 11.5c0 7 10.5 15 10.5 15s10.5-8 10.5-15C24.5 5.8 20.2 1 14 1Z"
              style={{ fill: active("/") ? activeColor : "none", stroke: active("/") ? "none" : inactiveColor, strokeWidth: 1.8 }}
            />
            <circle cx="14" cy="11" r="3" style={{ fill: active("/") ? bg : "transparent", stroke: "none" }}/>
          </svg>
          <span>Home</span>
        </button>

        {/* Discover — second slot */}
        <button onClick={() => navigate("/discover")} style={{ ...itemStyle(active("/discover"), activeColor, inactiveColor), left: "30.9%" }}>
          <svg viewBox="0 0 28 28" style={iconStyle}>
            <circle cx="12" cy="12" r="10"/>
            <path d="m20 20 6 6"/>
          </svg>
          <span>Discover</span>
        </button>

        {/* Saved */}
        <button onClick={() => navigate("/saved")} style={{ ...itemStyle(active("/saved"), activeColor, inactiveColor), left: "68.9%" }}>
          <svg viewBox="0 0 28 28" style={{ ...iconStyle, fill: active("/saved") ? "currentColor" : "none" }}>
            <path d="M14 24s-11-7-11-14a7 7 0 0 1 11-5.74A7 7 0 0 1 25 10c0 7-11 14-11 14Z"/>
          </svg>
          <span>Saved</span>
        </button>

        {/* Profile */}
        <button onClick={() => navigate("/profile")} style={{ ...itemStyle(active("/profile"), activeColor, inactiveColor), left: "87.3%" }}>
          <svg viewBox="0 0 28 28" style={iconStyle}>
            <circle cx="14" cy="7" r="5.5"/>
            <path d="M5 23c0-8 18-8 18 0 0 4-18 4-18 0Z"/>
          </svg>
          <span>Profile</span>
        </button>

        {/* Center orb button */}
        <button
          onClick={() => setShowGate(true)}
          style={{
            position: "absolute",
            left: "50%",
            top: "10.2%",
            transform: "translateX(-50%)",
            width: "17.5%",
            aspectRatio: "1",
            border: 0,
            borderRadius: "50%",
            padding: "1.05cqw",
            background: "conic-gradient(from 5deg,#ddd 0deg,#f5e7df 48deg,#ff5b24 105deg,#e93b12 165deg,#e94c6e 225deg,#d6d5d1 295deg,#ddd)",
            boxShadow: "0 1.5cqw 2.7cqw rgba(0,0,0,0.2)",
            cursor: "pointer",
            transition: "transform 0.15s",
          }}
          onMouseDown={e  => (e.currentTarget.style.transform  = "translateX(-50%) scale(.96)")}
          onMouseUp={e    => (e.currentTarget.style.transform  = "translateX(-50%) scale(1)")}
          onTouchStart={e => (e.currentTarget.style.transform  = "translateX(-50%) scale(.96)")}
          onTouchEnd={e   => (e.currentTarget.style.transform  = "translateX(-50%) scale(1)")}
        >
          <div style={{
            width: "100%",
            height: "100%",
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            border: "0.45cqw solid rgba(255,255,255,0.6)",
            background: [
              "radial-gradient(ellipse at 70% 25%,#f18fbc 0%,transparent 45%)",
              "radial-gradient(ellipse at 40% 85%,#ff4b13 0%,transparent 58%)",
              "linear-gradient(145deg,#c5c8ba 10%,#e7d7c1 35%,#f25b8b 70%,#f9e6c5)",
            ].join(","),
            boxShadow: "inset 0 -1.3cqw 1.1cqw rgba(255,255,255,0.6), inset 0 1cqw 1cqw rgba(255,255,255,0.33)",
          }}>
            <svg viewBox="0 0 28 28" style={{ width: "6cqw", height: "6cqw", stroke: "white", strokeWidth: 2.4, strokeLinecap: "round" as const, fill: "none" }}>
              <path d="M14 4v20M4 14h20"/>
            </svg>
          </div>
        </button>
      </div>
    </nav>

    {showGate && <ReportGate onClose={() => setShowGate(false)} />}
    </>
  );
}

const iconStyle: React.CSSProperties = {
  width: "6.1cqw",
  height: "6.1cqw",
  stroke: "currentColor",
  strokeWidth: 1.8,
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function itemStyle(isActive: boolean, activeColor: string, inactiveColor: string): React.CSSProperties {
  return {
    position: "absolute",
    top: "39%",
    left: "12.4%",
    width: "19%",
    height: "48%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "2cqw",
    border: 0,
    background: "none",
    color: isActive ? activeColor : inactiveColor,
    fontSize: "3.25cqw",
    fontFamily: "Arial, sans-serif",
    cursor: "pointer",
    padding: 0,
  };
}
