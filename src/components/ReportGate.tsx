import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, FileText, AlertTriangle, ArrowRight, Check, ChevronDown, ChevronUp } from "lucide-react";

const SLIDES = [
  {
    icon: <ShieldCheck size={28} color="#111" strokeWidth={1.6} />,
    title: "Safety First",
    body: "Always meet in a safe, public place when reuniting a pet. Never share your home address or personal financial info with strangers.",
    linkLabel: "Read our Safety Tips",
    linkContent: [
      "🐾 Meet in a busy public place like a park or pet store",
      "🔒 Never share your home address with strangers",
      "💳 Never send money or gift cards to claim a pet",
      "📸 Ask for multiple photos to verify the pet is real",
      "🤝 Bring a friend or family member to meetups",
      "📞 Trust your gut — if something feels off, don't go",
    ],
    label: "I understand, keep me safe",
  },
  {
    icon: <FileText size={28} color="#111" strokeWidth={1.6} />,
    title: "Our Terms Apply",
    body: "By posting you agree to our Terms of Service and Privacy Policy. Keep your post honest and accurate — false reports will be removed.",
    linkLabel: "View Terms & Privacy",
    linkContent: [
      "📋 Posts must be accurate and in good faith",
      "🚫 False or misleading reports will be removed",
      "🔐 Your data is stored securely and never sold",
      "📧 We may contact you about your active listings",
      "⚖️ nyc.pet reserves the right to remove any post",
      "🔄 Terms may be updated — check back periodically",
    ],
    label: "I agree to the Terms of Service",
  },
  {
    icon: <AlertTriangle size={28} color="#111" strokeWidth={1.6} />,
    title: "Important Disclaimer",
    body: "nyc.pet connects pet owners and finders but is not responsible for any interactions, meetings, or outcomes between users. Post at your own discretion.",
    linkLabel: null,
    linkContent: [],
    label: "I understand and accept",
  },
];

interface Props {
  onClose: () => void;
}

export default function ReportGate({ onClose }: Props) {
  const [step, setStep] = useState(0);
  const [checked, setChecked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  function next() {
    if (!checked) return;
    if (step < SLIDES.length - 1) {
      setStep(step + 1);
      setChecked(false);
      setExpanded(false);
    } else {
      onClose();
      navigate("/report");
    }
  }

  const slide = SLIDES[step];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10100,
      background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px",
      animation: "fadeIn 0.2s ease",
    }}>
      {/* Card */}
      <div style={{
        width: "min(420px, 100%)",
        borderRadius: "32px",
        overflow: "hidden",
        color: "#111",
        textAlign: "center",
        containerType: "inline-size",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* White content section */}
        <div style={{ background: "#fff", padding: "10% 8% 6%" }}>

          {/* Icon */}
          <div style={{ marginBottom: "3cqw" }}>
            {slide.icon}
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: "9cqw",
            lineHeight: 1.23,
            letterSpacing: "-0.045em",
            fontWeight: 500,
            margin: "0 0 3cqw",
            color: "#111",
          }}>
            {slide.title}
          </h1>

          {/* Body */}
          <p style={{
            fontSize: "4.2cqw",
            lineHeight: 1.6,
            color: "#666",
            margin: 0,
          }}>
            {slide.body}
          </p>

          {/* Expandable info section */}
          {slide.linkLabel && (
            <div style={{ marginTop: "4cqw" }}>
              <button
                onClick={() => setExpanded(!expanded)}
                style={{
                  background: "#f5f5f7",
                  border: "1px solid #e2e8f0",
                  borderRadius: 24,
                  padding: "2cqw 4cqw",
                  color: "#1c314e",
                  fontSize: "3.8cqw",
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5cqw",
                  cursor: "pointer",
                  margin: "0 auto",
                }}
              >
                {slide.linkLabel}
                {expanded
                  ? <ChevronUp size={13} strokeWidth={2.2} />
                  : <ChevronDown size={13} strokeWidth={2.2} />
                }
              </button>

              {/* Expanded list */}
              {expanded && (
                <ul style={{
                  listStyle: "none",
                  margin: "3cqw 0 0",
                  padding: "3cqw",
                  background: "#f8faff",
                  borderRadius: 16,
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2cqw",
                }}>
                  {slide.linkContent.map((item, i) => (
                    <li key={i} style={{
                      fontSize: "3.8cqw",
                      color: "#555",
                      lineHeight: 1.5,
                    }}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Checkbox row */}
          <label style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2.5cqw",
            marginTop: "5cqw",
            marginBottom: "5cqw",
            cursor: "pointer",
            userSelect: "none",
          }}>
            <span
              onClick={() => setChecked(!checked)}
              style={{
                width: "5cqw",
                height: "5cqw",
                minWidth: 20,
                minHeight: 20,
                borderRadius: "1.2cqw",
                border: checked ? "none" : "2px solid #ccc",
                background: checked ? "#111" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s, border 0.2s",
              }}
            >
              {checked && <Check size={12} color="#fff" strokeWidth={3} />}
            </span>
            <span
              onClick={() => setChecked(!checked)}
              style={{ fontSize: "3.8cqw", color: "#444", textAlign: "left", lineHeight: 1.4 }}
            >
              {slide.label}
            </span>
          </label>

          {/* Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: "8cqw" }}>
            {SLIDES.map((_, i) => (
              <div key={i} style={{ width: 26, height: 4, borderRadius: 9, background: i === step ? "#111" : "#ddd", transition: "background 0.2s" }} />
            ))}
          </div>

        </div>

        {/* Black bottom section with wave + button — all in flow */}
        <div style={{ background: "#111", position: "relative", paddingBottom: 28, paddingTop: 0 }}>
          {/* Wave bridges white → black */}
          <svg viewBox="0 0 390 34" preserveAspectRatio="none" aria-hidden="true"
            style={{ display: "block", width: "100%", marginTop: -1 }}>
            <path fill="#fff" d="M0 34 C0 15 15 0 34 0 H136 C159 0 175 28 195 28 C215 28 231 0 254 0 H356 C375 0 390 15 390 34 Z"/>
          </svg>
          {/* Button floats in the wave dip */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: -38 }}>
            <button
              onClick={next}
              disabled={!checked}
              style={{
                width: 52, height: 52,
                borderRadius: "50%",
                border: "none",
                background: checked ? "#fff" : "#333",
                color: checked ? "#111" : "#888",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: checked ? "pointer" : "default",
                transition: "background 0.25s, color 0.25s",
                boxShadow: checked ? "0 4px 16px rgba(255,255,255,0.15)" : "none",
              }}
            >
              <ArrowRight size={20} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
