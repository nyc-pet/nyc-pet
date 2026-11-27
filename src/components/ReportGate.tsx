import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, FileText, AlertTriangle, ArrowRight, Check, ChevronDown, ChevronUp } from "lucide-react";

const SLIDES = [
  {
    icon: <ShieldCheck size={28} color="#f5f5f5" strokeWidth={1.6} />,
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
    icon: <FileText size={28} color="#f5f5f5" strokeWidth={1.6} />,
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
    icon: <AlertTriangle size={28} color="#f5f5f5" strokeWidth={1.6} />,
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
      {/* Wave card */}
      <div style={{
        width: "min(420px, 100%)",
        background: "#171716",
        borderRadius: "32px",
        position: "relative",
        overflow: "hidden",
        color: "white",
        textAlign: "center",
        containerType: "inline-size",
        paddingBottom: "calc(72px + env(safe-area-inset-bottom, 20px))",
      }}>

        {/* Content */}
        <div style={{ padding: "10% 8% 0" }}>

          {/* Icon */}
          <div style={{ marginBottom: "3cqw" }}>
            {slide.icon}
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: "7.25cqw",
            lineHeight: 1.23,
            letterSpacing: "-0.045em",
            fontWeight: 500,
            margin: "0 0 3cqw",
            color: "#f5f5f5",
          }}>
            {slide.title}
          </h1>

          {/* Body */}
          <p style={{
            fontSize: "3.35cqw",
            lineHeight: 1.6,
            color: "#a6a6a6",
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
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 24,
                  padding: "2cqw 4cqw",
                  color: "#c8d8ff",
                  fontSize: "3.1cqw",
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
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 16,
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: "2cqw",
                }}>
                  {slide.linkContent.map((item, i) => (
                    <li key={i} style={{
                      fontSize: "3.1cqw",
                      color: "#b0b0b0",
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
                border: checked ? "none" : "2px solid #555",
                background: checked ? "#f5f5f5" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s, border 0.2s",
              }}
            >
              {checked && <Check size={12} color="#171716" strokeWidth={3} />}
            </span>
            <span
              onClick={() => setChecked(!checked)}
              style={{ fontSize: "3.1cqw", color: "#c0c0c0", textAlign: "left", lineHeight: 1.4 }}
            >
              {slide.label}
            </span>
          </label>

          {/* Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: "8cqw" }}>
            {SLIDES.map((_, i) => (
              <div key={i} style={{ width: 26, height: 4, borderRadius: 9, background: i === step ? "#f5f5f5" : "#737373", transition: "background 0.2s" }} />
            ))}
          </div>

        </div>

        {/* Wave SVG */}
        <svg
          style={{ position: "absolute", bottom: 0, left: 0, width: "100%", display: "block" }}
          viewBox="0 0 386 61"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path fill="white" d="M0 59 H91 C121 59 145 38 167 15 C176 5 183 1 193 1 C204 1 212 5 221 15 C243 38 267 59 297 59 H386 V61 H0 Z"/>
        </svg>

        {/* Round arrow button — sits in the wave peak, above home bar */}
        <button
          onClick={next}
          disabled={!checked}
          style={{
            position: "absolute",
            bottom: "calc(env(safe-area-inset-bottom, 20px) + 18px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: 52, height: 52,
            borderRadius: "50%",
            border: "none",
            background: checked ? "#111" : "#d4d4d4",
            color: checked ? "#fff" : "#555",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: checked ? "pointer" : "default",
            transition: "background 0.25s, color 0.25s",
            boxShadow: checked ? "0 4px 16px rgba(0,0,0,0.3)" : "none",
          }}
        >
          <ArrowRight size={20} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
