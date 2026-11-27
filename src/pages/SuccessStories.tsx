import { Heart } from "lucide-react";
import InfoPage from "../components/InfoPage";

const stories = [
  {
    name: "Max",
    species: "Golden Retriever",
    borough: "Brooklyn",
    days: 3,
    story: "Max slipped his collar during a thunderstorm in Prospect Park. His owner posted on nyc.pet that same night. A neighbor spotted him two blocks away the following morning and messaged through the app. Max was home by lunchtime.",
    color: "#fef3c7",
    accent: "#f59e0b",
  },
  {
    name: "Luna",
    species: "Tabby Cat",
    borough: "Queens",
    days: 7,
    story: "Luna disappeared from a Jackson Heights apartment. Her owner thought she'd slipped out during a move. A family found her hiding under a stoop and posted her as found. The owner recognized the photo instantly and they were reunited the same day.",
    color: "#f0fff4",
    accent: "#34c759",
  },
  {
    name: "Biscuit",
    species: "French Bulldog",
    borough: "Manhattan",
    days: 1,
    story: "Biscuit ran out of an open door in the East Village. Within two hours of the post going live, three people had spotted him near Tompkins Square Park. He was found before sunset — the fastest reunion we've seen.",
    color: "#fff0ef",
    accent: "#ff3b30",
  },
  {
    name: "Mango",
    species: "Parrot",
    borough: "The Bronx",
    days: 12,
    story: "Mango flew out of an open window and was missing for nearly two weeks. A family in a neighboring building heard him calling and posted on nyc.pet. His owner had been checking the app daily — she cried when she saw the notification.",
    color: "#f0f7ff",
    accent: "#1c314e",
  },
];

export default function SuccessStories() {
  return (
    <InfoPage title="Success Stories" subtitle="Happy reunions from our community">
      <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8, marginBottom: 28 }}>
        Every reunion is a reminder of why nyc.pet exists. Here are a few stories shared by our community.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {stories.map((s, i) => (
          <div key={i} style={{ background: "#f5f5f5", borderRadius: 20, padding: 20, border: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: s.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Heart size={20} color="#fff" strokeWidth={1.8} />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#111" }}>{s.name} · {s.species}</p>
                <p style={{ fontSize: 12, color: "#777", marginTop: 2 }}>{s.borough} · Reunited in {s.days} day{s.days > 1 ? "s" : ""}</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#444", lineHeight: 1.8 }}>{s.story}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, padding: 20, background: "#f8faff", borderRadius: 20, textAlign: "center" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "#111", marginBottom: 6 }}>Have a success story?</p>
        <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.6 }}>Email us at <strong style={{ color: "#1c314e" }}>hello@nyc.pet</strong> and we'll feature your reunion here.</p>
      </div>
    </InfoPage>
  );
}
