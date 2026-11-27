import { useNavigate } from "react-router-dom";
import { MessageCircle, Bell, Menu, X, CheckCheck } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useTheme } from "../lib/themeContext";

interface Notification {
  id: string;
  message: string;
  post_id: string | null;
  read: boolean;
  created_at: string;
}

interface Props {
  onMenuOpen?: () => void;
}

export default function AppHeader({ onMenuOpen }: Props) {
  const navigate = useNavigate();
  const { setMenuOpen } = useTheme();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter(n => !n.read).length;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;

      // Unread messages
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .neq("sender_id", data.user.id)
        .eq("read", false)
        .then(({ count }) => setUnreadMessages(count ?? 0));

      // Notifications
      supabase
        .from("notifications")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false })
        .limit(20)
        .then(({ data: notifs }) => {
          if (notifs) setNotifications(notifs as Notification[]);
        });
    });
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    if (!showNotifs) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNotifs]);

  async function markAllRead() {
    const unread = notifications.filter(n => !n.read).map(n => n.id);
    if (!unread.length) return;
    await supabase.from("notifications").update({ read: true }).in("id", unread);
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  }

  async function openNotif(n: Notification) {
    if (!n.read) {
      await supabase.from("notifications").update({ read: true }).eq("id", n.id);
      setNotifications(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x));
    }
    setShowNotifs(false);
    if (n.post_id) navigate(`/pet/${n.post_id}`);
  }

  function openMenu() {
    if (onMenuOpen) {
      onMenuOpen();
    } else {
      setMenuOpen(true);
    }
  }

  function timeAgo(d: string) {
    const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
    if (h < 1) return "Just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  return (
    <div style={{ background: "#fff", padding: "52px 20px 16px", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img src="/logo.png" alt="nyc.pet" style={{ height: 44, width: "auto", filter: "brightness(0)" }} />
        <div style={{ display: "flex", gap: 12 }}>

          {/* Messages */}
          <button
            onClick={() => navigate("/messages")}
            style={{ width: 48, height: 48, borderRadius: 24, background: "var(--gray-1,#f5f5f5)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", border: "none", cursor: "pointer" }}
          >
            <MessageCircle size={22} color="#333" />
            {unreadMessages > 0 && (
              <div style={{ position: "absolute", top: 8, right: 8, width: 16, height: 16, borderRadius: 8, background: "#ff3b30", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>{unreadMessages > 9 ? "9+" : unreadMessages}</span>
              </div>
            )}
          </button>

          {/* Notifications bell */}
          <div style={{ position: "relative" }} ref={panelRef}>
            <button
              onClick={() => { setShowNotifs(v => !v); if (!showNotifs) markAllRead(); }}
              style={{ width: 48, height: 48, borderRadius: 24, background: showNotifs ? "#111" : "var(--gray-1,#f5f5f5)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", border: "none", cursor: "pointer", transition: "background 0.2s" }}
            >
              <Bell size={22} color={showNotifs ? "#fff" : "#333"} />
              {unreadNotifs > 0 && (
                <div style={{ position: "absolute", top: 8, right: 8, width: 16, height: 16, borderRadius: 8, background: "#ff3b30", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff" }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>{unreadNotifs > 9 ? "9+" : unreadNotifs}</span>
                </div>
              )}
            </button>

            {/* Dropdown panel */}
            {showNotifs && (
              <div style={{ position: "absolute", top: 56, right: 0, width: 300, background: "#fff", borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.15)", zIndex: 1000, overflow: "hidden", border: "1px solid #f0f0f0" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #f0f0f0" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Notifications</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {unreadNotifs > 0 && (
                      <button onClick={markAllRead} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#888", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                        <CheckCheck size={13} /> Mark all read
                      </button>
                    )}
                    <button onClick={() => setShowNotifs(false)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                      <X size={16} color="#aaa" />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "32px 16px", textAlign: "center" }}>
                      <Bell size={28} color="#ddd" strokeWidth={1.5} style={{ marginBottom: 8 }} />
                      <p style={{ fontSize: 13, color: "#bbb" }}>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} onClick={() => openNotif(n)}
                        style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 16px", cursor: n.post_id ? "pointer" : "default", background: n.read ? "#fff" : "#f0f9ff", borderBottom: "1px solid #f8f8f8", transition: "background 0.15s" }}>
                        <div style={{ width: 8, height: 8, borderRadius: 4, background: n.read ? "transparent" : "#3b82f6", flexShrink: 0, marginTop: 5 }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, color: "#111", lineHeight: 1.5, fontWeight: n.read ? 400 : 600 }}>{n.message}</p>
                          <p style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{timeAgo(n.created_at)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Menu */}
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
