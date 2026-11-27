import { Heart, MapPin, Users, Award } from "lucide-react";
import InfoPage from "../components/InfoPage";

const stats = [
  { icon: <MapPin size={20} color="#1c314e" strokeWidth={1.8} />, value: "500+", label: "Pets Reported" },
  { icon: <Heart size={20} color="#ff3b30" strokeWidth={1.8} />, value: "320+", label: "Reunited" },
  { icon: <Users size={20} color="#34c759" strokeWidth={1.8} />, value: "1,200+", label: "Community Members" },
  { icon: <Award size={20} color="#f59e0b" strokeWidth={1.8} />, value: "2024", label: "Founded" },
];

export default function AboutUs() {
  return (
    <InfoPage title="About Us" subtitle="Our mission & story">

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "#f8faff", borderRadius: 20, padding: "18px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
              {s.icon}
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#111" }}>{s.value}</p>
            <p style={{ fontSize: 12, color: "#aaa", fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <Section title="Our Mission">
        nyc.pet is a free community platform dedicated to reuniting lost pets with their families across New York City. We believe every pet deserves to find their way home.
      </Section>

      <Section title="How We Started">
        nyc.pet was born out of a simple frustration — when a pet goes missing in NYC, there was no single place to look. Flyers get torn down, Facebook groups are fragmented, and shelters are hard to navigate. We built nyc.pet to fix that.
      </Section>

      <Section title="What We Do">
        We provide an interactive map where anyone can report a lost or found pet. Reports are reviewed by our team before going live to ensure quality and safety. All contact is handled through our in-app messaging system to protect everyone's privacy.
      </Section>

      <Section title="Who We Are">
        We're a small team of pet lovers and developers based in New York City. This is a passion project — we don't charge anything, run ads, or sell data. Just a tool built to help pets and families find each other.
      </Section>

    </InfoPage>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 10 }}>{title}</h2>
      <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8 }}>{children}</p>
    </div>
  );
}
