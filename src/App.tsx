import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./lib/themeContext";
import { useEffect, useState } from "react";
import Discover from "./pages/Discover";
import MapPage from "./pages/MapPage";
import Profile from "./pages/Profile";
import Saved from "./pages/Saved";
import PetDetail from "./pages/PetDetail";
import Report from "./pages/Report";
import Login from "./pages/Login";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import BottomNav from "./components/BottomNav";
import GlobalMenu from "./components/GlobalMenu";
import AboutUs from "./pages/AboutUs";
import HowToHelp from "./pages/HowToHelp";
import SuccessStories from "./pages/SuccessStories";
import ContactUs from "./pages/ContactUs";
import SafetyTips from "./pages/SafetyTips";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Admin from "./pages/Admin";
import ResetPassword from "./pages/ResetPassword";

function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 1600);
    const t2 = setTimeout(() => onDone(), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "#fff",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity: fading ? 0 : 1,
      transition: "opacity 0.6s ease",
      pointerEvents: "none",
    }}>
      <img
        src="/logo.png"
        alt="nyc.pet"
        style={{
          height: 56,
          filter: "brightness(0)",
          opacity: fading ? 0 : 1,
          transform: fading ? "scale(0.95)" : "scale(1)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      />
      {/* subtle pulse dots */}
      <div style={{ marginTop: 32, display: "flex", gap: 6 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: 3, background: "#ddd",
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
      {/* Credit */}
      <p style={{
        position: "absolute", bottom: 40,
        fontSize: 10, fontWeight: 700, letterSpacing: 2,
        color: "#111", textTransform: "uppercase",
      }}>
        Developed by Rubayath Rahman
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1);   }
        }
      `}</style>
    </div>
  );
}

function AppShell() {
  const location = useLocation();
  const noNav = ["/login", "/report", "/about", "/how-to-help", "/success-stories", "/contact", "/safety-tips", "/terms", "/privacy", "/admin", "/reset-password"].includes(location.pathname) || location.pathname.startsWith("/pet/") || location.pathname.startsWith("/chat/");

  return (
    <>
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/pet/:id" element={<PetDetail />} />
        <Route path="/report" element={<Report />} />
        <Route path="/login" element={<Login />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/chat/:id" element={<Chat />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/how-to-help" element={<HowToHelp />} />
        <Route path="/success-stories" element={<SuccessStories />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/safety-tips" element={<SafetyTips />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      {!noNav && <BottomNav />}
      <GlobalMenu />
    </>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  return (
    <ThemeProvider>
      <BrowserRouter>
        {!ready && <SplashScreen onDone={() => setReady(true)} />}
        <AppShell />
      </BrowserRouter>
    </ThemeProvider>
  );
}
