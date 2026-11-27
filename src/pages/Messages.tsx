import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Conversation, Message, PetPost } from "../lib/supabase";

interface ConvRow {
  id: string;
  created_at: string;
  pet_post_id: string;
  sender_id: string;
  receiver_id: string;
  pet_posts: PetPost;
  messages: Message[];
}

function timeAgo(d: string) {
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Messages() {
  const navigate = useNavigate();
  const [convs, setConvs] = useState<ConvRow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate("/login"); return; }
      setUserId(data.user.id);
      loadConvs(data.user.id);
    });
  }, []);

  async function loadConvs(uid: string) {
    const { data } = await supabase
      .from("conversations")
      .select("*, pet_posts(*), messages(id, content, created_at, sender_id, read)")
      .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
      .order("created_at", { ascending: false });
    setConvs((data as ConvRow[]) || []);
    setLoading(false);
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh" }}>
      <div style={{ width: 24, height: 24, border: "3px solid #e2e8f0", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#f5f5f7" }}>

      {/* Header */}
      <div style={{ background: "#fff", padding: "56px 24px 20px", flexShrink: 0 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: "#111", marginBottom: 4 }}>Messages</h2>
        <p style={{ fontSize: 13, color: "#aaa" }}>{convs.length} conversation{convs.length !== 1 ? "s" : ""}</p>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 100px" }}>
        {convs.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: 36, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageCircle size={32} color="#c4c4c4" strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#111" }}>No messages yet</p>
            <p style={{ fontSize: 13, color: "#aaa", textAlign: "center", maxWidth: 240, lineHeight: 1.6 }}>
              When you contact someone about a pet, your conversations will appear here.
            </p>
            <button onClick={() => navigate("/discover")} style={{ marginTop: 8, padding: "13px 28px", borderRadius: 24, background: "#111", color: "#fff", fontSize: 14, fontWeight: 700 }}>
              Browse Pets
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {convs.map(conv => {
              const pet = conv.pet_posts;
              const msgs = conv.messages || [];
              const last = msgs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
              const unread = msgs.filter(m => !m.read && m.sender_id !== userId).length;

              return (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/chat/${conv.id}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    background: "#fff", borderRadius: 20, padding: "14px 16px",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                    textAlign: "left", cursor: "pointer",
                  }}
                >
                  {/* Pet photo / avatar */}
                  <div style={{ width: 54, height: 54, borderRadius: 18, overflow: "hidden", flexShrink: 0, background: "#f1f5f9" }}>
                    {pet?.photo_url
                      ? <img src={pet.photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <MessageCircle size={22} color="#c4c4c4" strokeWidth={1.5} />
                        </div>
                    }
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {pet?.name || pet?.species || "Pet"}
                      </p>
                      {last && <span style={{ fontSize: 11, color: "#aaa", flexShrink: 0, marginLeft: 8 }}>{timeAgo(last.created_at)}</span>}
                    </div>
                    <p style={{ fontSize: 13, color: unread > 0 ? "#111" : "#aaa", fontWeight: unread > 0 ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {last ? last.content : "No messages yet"}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {unread > 0 ? (
                    <div style={{ width: 22, height: 22, borderRadius: 11, background: "#ff3b30", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{unread}</span>
                    </div>
                  ) : (
                    <ArrowRight size={16} color="#c4c4c4" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
