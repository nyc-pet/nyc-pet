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
    const t1 = setTimeout(() => setFading(true), 3500);
    const t2 = setTimeout(() => onDone(), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "linear-gradient(160deg,#111 0%,#1c1c1e 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity: fading ? 0 : 1,
      transition: "opacity 0.7s ease",
      pointerEvents: "none",
    }}>

      {/* Logo */}
      <img
        src="/logo.png"
        alt="nyc.pet"
        style={{
          height: 100,
          filter: "brightness(0) invert(1)",
          opacity: fading ? 0 : 1,
          transform: fading ? "scale(0.95)" : "scale(1)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      />

      {/* Pulse dots */}
      <div style={{ marginTop: 36, display: "flex", gap: 7 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: 3,
            background: "rgba(255,255,255,0.4)",
            animation: `splashPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

      {/* SVG arch at bottom */}
      <svg
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", display: "block" }}
        viewBox="0 0 390 80"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path fill="rgba(255,255,255,0.06)" d="M0 80 C0 40 40 0 80 0 H180 C205 0 220 32 195 48 C170 64 165 80 195 80 Z"/>
        <path fill="rgba(255,255,255,0.04)" d="M390 80 C390 40 350 0 310 0 H210 C185 0 170 32 195 48 C220 64 225 80 195 80 Z"/>
      </svg>

      {/* Credit */}
      <p style={{
        position: "absolute", bottom: 32,
        fontSize: 10, fontWeight: 700, letterSpacing: 2,
        color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
      }}>
        Developed by Rubayath Rahman
      </p>

      <style>{`
        @keyframes splashPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
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
