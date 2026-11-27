import { ShieldCheck, AlertTriangle, Thermometer, Car, User, Scissors } from "lucide-react";
import InfoPage from "../components/InfoPage";

const tips = [
  {
    icon: <ShieldCheck size={22} color="#fff" strokeWidth={1.8} />,
    bg: "#34c759",
    title: "Microchip & ID tags",
    items: [
      "Always keep an ID tag with your current phone number on your pet's collar.",
      "Microchip your pet and register the chip — keep contact info up to date.",
      "Take clear, recent photos of your pet from multiple angles.",
    ],
  },
  {
    icon: <AlertTriangle size={22} color="#fff" strokeWidth={1.8} />,
    bg: "#f59e0b",
    title: "Preventing Escapes",
    items: [
      "Check fences and gates for gaps regularly.",
      "Never leave your pet unattended in a yard during thunderstorms or fireworks.",
      "Use a double-clip leash or harness for dogs prone to slipping collars.",
    ],
  },
  {
    icon: <Thermometer size={22} color="#fff" strokeWidth={1.8} />,
    bg: "#ef4444",
    title: "Extreme Weather",
    items: [
      "In summer, limit walks to early morning or evening — asphalt can burn paws above 85°F.",
      "Never leave a pet in a parked car, even for a few minutes.",
      "In winter, rinse paws after walks to remove road salt and chemicals.",
    ],
  },
  {
    icon: <Car size={22} color="#fff" strokeWidth={1.8} />,
    bg: "#1c314e",
    title: "In the City",
    items: [
      "Keep cats indoors or supervised on a leash/enclosed balcony.",
      "Be cautious near subway grates and construction sites — they can startle pets.",
      "Avoid retractable leashes near traffic — they don't give enough control.",
    ],
  },
  {
    icon: <User size={22} color="#fff" strokeWidth={1.8} />,
    bg: "#7c3aed",
    title: "Interacting With Strangers",
    items: [
      "Never give your home address to someone claiming to have found your pet.",
      "Arrange meetups in a public place and bring a friend.",
      "Use nyc.pet's in-app messaging to avoid giving out your phone number.",
    ],
  },
  {
    icon: <Scissors size={22} color="#fff" strokeWidth={1.8} />,
    bg: "#0891b2",
    title: "Grooming & Health",
    items: [
      "Keep nails trimmed — overgrown nails can catch on surfaces and cause injury.",
      "Keep vaccinations and flea/tick prevention up to date.",
      "Schedule a vet checkup at least once a year for healthy adult pets.",
    ],
  },
];

export default function SafetyTips() {
  return (
    <InfoPage title="Safety Tips" subtitle="Keep your pet safe in NYC">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {tips.map((t, i) => (
          <div key={i} style={{ background: "#f8faff", borderRadius: 20, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {t.icon}
              </div>
              <p style={{ fontSize: 15, fontWeight: 800, color: "#111" }}>{t.title}</p>
            </div>
            <ul style={{ paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {t.items.map((item, j) => (
                <li key={j} style={{ fontSize: 13, color: "#555", lineHeight: 1.7, listStyleType: "disc" }}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </InfoPage>
  );
}
