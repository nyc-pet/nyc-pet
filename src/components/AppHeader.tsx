import { useNavigate } from "react-router-dom";
import { MessageCircle, Bell, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useTheme } from "../lib/themeContext";

interface Props {
  onMenuOpen?: () => void;
}

export default function AppHeader({ onMenuOpen }: Props) {
  const navigate = useNavigate();
  const { setMenuOpen } = useTheme();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .neq("sender_id", data.user.id)
        .eq("read", false)
        .then(({ count }) => setUnread(count ?? 0));
    });
  }, []);

  function openMenu() {
    if (onMenuOpen) {
      onMenuOpen();
    } else {
      setMenuOpen(true);
    }
  }

  return (
    <div style={{ background: "#fff", padding: "52px 20px 16px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img src="/logo.png" alt="nyc.pet" style={{ height: 44, width: "auto", filter: "brightness(0)" }} />
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => navigate("/messages")}
            style={{ width: 48, height: 48, borderRadius: 24, background: "var(--gray-1,#f5f5f5)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", border: "none", cursor: "pointer" }}
          >
            <MessageCircle size={22} color="#333" />
            {unread > 0 && (
              <div style={{ position: "absolute", top: 8, right: 8, width: 16, height: 16, borderRadius: 8, background: "#ff3b30", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>{unread > 9 ? "9+" : unread}</span>
              </div>
            )}
          </button>
          <button style={{ width: 48, height: 48, borderRadius: 24, background: "var(--gray-1,#f5f5f5)", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
            <Bell size={22} color="#333" />
          </button>
          <button
            onClick={openMenu}
            style={{ width: 48, height: 48, borderRadius: 24, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(0,0,0,0.2)", border: "none", cursor: "pointer" }}
          >
            <Menu size={20} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}
