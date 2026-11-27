import { Share2, Eye, Bell, PawPrint, DollarSign, Megaphone } from "lucide-react";
import InfoPage from "../components/InfoPage";

const ways = [
  {
    icon: <Share2 size={22} color="#1c314e" strokeWidth={1.8} />,
    title: "Share Reports",
    desc: "When you see a lost pet post, share it on social media, WhatsApp, or with your neighbors. The more eyes, the better the chances.",
  },
  {
    icon: <Eye size={22} color="#1c314e" strokeWidth={1.8} />,
    title: "Keep an Eye Out",
    desc: "Browse the map regularly. If you spot a pet matching a lost report in your neighborhood, contact the owner immediately.",
  },
  {
    icon: <Bell size={22} color="#1c314e" strokeWidth={1.8} />,
    title: "Report What You Find",
    desc: "If you find a stray, report it on nyc.pet right away — even if you're already caring for it. The owner may be searching.",
  },
  {
    icon: <PawPrint size={22} color="#1c314e" strokeWidth={1.8} />,
    title: "Microchip Your Pet",
    desc: "Encourage pet owners you know to microchip their pets and keep their contact info updated with the registry.",
  },
  {
    icon: <Megaphone size={22} color="#1c314e" strokeWidth={1.8} />,
    title: "Spread the Word",
    desc: "Tell friends, family, your building's group chat, and local community boards about nyc.pet. Growing the community helps everyone.",
  },
  {
    icon: <DollarSign size={22} color="#1c314e" strokeWidth={1.8} />,
    title: "Support the Platform",
    desc: "nyc.pet is free and runs on volunteer time. If you'd like to help keep the servers running, any contribution is appreciated.",
  },
];

export default function HowToHelp() {
  return (
    <InfoPage title="How to Help" subtitle="Volunteer & make a difference">
      <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8, marginBottom: 28 }}>
        You don't need to be a volunteer organization to make a difference. Here are six simple ways anyone can help reunite pets with their families.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {ways.map((w, i) => (
          <div key={i} style={{ display: "flex", gap: 16, padding: "18px", background: "#f8faff", borderRadius: 20, alignItems: "flex-start" }}>
            <div style={{ width: 46, height: 46, borderRadius: 15, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
              {w.icon}
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 5 }}>{w.title}</p>
              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7 }}>{w.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </InfoPage>
  );
}
