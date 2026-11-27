import { useState } from "react";
import { Mail, AtSign, MessageCircle, Send, CheckCircle } from "lucide-react";
import InfoPage from "../components/InfoPage";

export default function ContactUs() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate send — wire to your backend / Supabase function if needed
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  }

  if (sent) return (
    <InfoPage title="Contact Us" subtitle="Get in touch">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 40, gap: 16, textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 36, background: "#f0fff4", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle size={36} color="#34c759" strokeWidth={1.5} />
        </div>
        <p style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>Message Sent!</p>
        <p style={{ fontSize: 14, color: "#aaa", maxWidth: 260, lineHeight: 1.7 }}>Thanks for reaching out. We'll get back to you within 1–2 business days.</p>
      </div>
    </InfoPage>
  );

  return (
    <InfoPage title="Contact Us" subtitle="We'd love to hear from you">

      {/* Social links */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
        {[
          { icon: <Mail size={18} color="#1c314e" strokeWidth={1.8} />, label: "Email", href: "mailto:hello@nyc.pet" },
          { icon: <AtSign size={18} color="#1c314e" strokeWidth={1.8} />, label: "Instagram", href: "https://instagram.com/nycpet" },
          { icon: <MessageCircle size={18} color="#1c314e" strokeWidth={1.8} />, label: "Twitter", href: "https://twitter.com/nycpet" },
        ].map(s => (
          <a key={s.label} href={s.href} style={{ flex: 1, padding: "14px 8px", background: "#f8faff", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
              {s.icon}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#555" }}>{s.label}</span>
          </a>
        ))}
      </div>

      {/* Contact form */}
      <p style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 16 }}>Send us a message</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { label: "Your name", value: name, set: setName, type: "text", placeholder: "John Smith" },
          { label: "Email", value: email, set: setEmail, type: "email", placeholder: "you@email.com" },
        ].map(f => (
          <div key={f.label}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>{f.label}</label>
            <input type={f.type} required value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
              style={{ width: "100%", padding: "13px 16px", background: "#f5f5f7", borderRadius: 14, fontSize: 14, color: "#111", border: "none", outline: "none" }} />
          </div>
        ))}
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 6 }}>Message</label>
          <textarea required value={message} onChange={e => setMessage(e.target.value)} placeholder="How can we help?" rows={5}
            style={{ width: "100%", padding: "13px 16px", background: "#f5f5f7", borderRadius: 14, fontSize: 14, color: "#111", border: "none", outline: "none", resize: "none", fontFamily: "inherit" }} />
        </div>
        <button type="submit" disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px", background: "#111", color: "#fff", borderRadius: 16, fontSize: 15, fontWeight: 700, marginTop: 4, opacity: loading ? 0.7 : 1 }}>
          {loading ? "Sending…" : <><Send size={16} strokeWidth={2} /> Send Message</>}
        </button>
      </form>
    </InfoPage>
  );
}
