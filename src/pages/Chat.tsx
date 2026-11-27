import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Message, PetPost } from "../lib/supabase";

interface ConvDetail {
  id: string;
  pet_post_id: string;
  sender_id: string;
  receiver_id: string;
  pet_posts: PetPost;
}

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [conv, setConv] = useState<ConvDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate("/login"); return; }
      setUserId(data.user.id);
    });

    // Load conversation + messages
    supabase.from("conversations").select("*, pet_posts(*)").eq("id", id).single()
      .then(({ data }) => setConv(data as ConvDetail));

    supabase.from("messages").select("*").eq("conversation_id", id)
      .order("created_at", { ascending: true })
      .then(({ data }) => setMessages((data as Message[]) || []));

    // Mark messages as read
    supabase.from("messages").update({ read: true })
      .eq("conversation_id", id).neq("sender_id", userId || "").then(() => {});

    // Real-time subscription
    const channel = supabase
      .channel(`chat-${id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${id}`,
      }, payload => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!text.trim() || !userId || !id) return;
    setSending(true);
    const content = text.trim();
    setText("");
    await supabase.from("messages").insert({
      conversation_id: id,
      sender_id: userId,
      content,
      read: false,
    });
    setSending(false);
  }

  const pet = conv?.pet_posts;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#f5f5f7" }}>

      {/* Header */}
      <div style={{ background: "#fff", padding: "52px 20px 16px", flexShrink: 0, boxShadow: "0 1px 0 #f0f0f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => navigate(-1)} style={{ width: 40, height: 40, borderRadius: 20, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ArrowLeft size={18} color="#111" />
          </button>

          {pet?.photo_url && (
            <div style={{ width: 42, height: 42, borderRadius: 14, overflow: "hidden", flexShrink: 0 }}>
              <img src={pet.photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {pet?.name || pet?.species || "Chat"}
            </p>
            <p style={{ fontSize: 12, color: "#aaa" }}>
              {pet?.status === "lost" ? "Lost pet" : "Found pet"} · {pet?.last_seen_address || ""}
            </p>
          </div>

          {/* Pet status pill */}
          <div style={{ padding: "5px 12px", borderRadius: 20, background: pet?.status === "lost" ? "#fff0ef" : "#f0fff4", flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: pet?.status === "lost" ? "#ff3b30" : "#34c759" }}>
              {pet?.status === "lost" ? "Lost" : "Found"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 20px" }}>

        {/* Safety notice */}
        <div style={{ background: "#fff8ec", border: "1px solid #ffe8b0", borderRadius: 16, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>🔒</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#92610a", marginBottom: 3 }}>Safety reminder</p>
            <p style={{ fontSize: 12, color: "#a07020", lineHeight: 1.6 }}>
              Please <strong>do not share</strong> personal details like your home address, full name, or financial info. Arrange pet handoffs in a safe, public place.
            </p>
          </div>
        </div>

        {messages.map((msg, i) => {
          const isMe = msg.sender_id === userId;
          const prevMsg = messages[i - 1];
          const showTime = !prevMsg || new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() > 300000;

          return (
            <div key={msg.id}>
              {showTime && (
                <p style={{ textAlign: "center", fontSize: 11, color: "#bbb", margin: "12px 0 8px" }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
              <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", marginBottom: 6 }}>
                <div style={{
                  maxWidth: "72%", padding: "11px 16px", borderRadius: isMe ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                  background: isMe ? "#111" : "#fff",
                  color: isMe ? "#fff" : "#111",
                  fontSize: 14, lineHeight: 1.5,
                  boxShadow: isMe ? "none" : "0 1px 6px rgba(0,0,0,0.07)",
                }}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ background: "#fff", padding: "12px 16px 36px", flexShrink: 0, boxShadow: "0 -1px 0 #f0f0f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f5f5f7", borderRadius: 24, padding: "10px 10px 10px 18px" }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Type a message…"
            style={{ flex: 1, fontSize: 14, color: "#111", background: "none", border: "none", outline: "none" }}
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            style={{
              width: 40, height: 40, borderRadius: 20, flexShrink: 0,
              background: text.trim() ? "#111" : "#e2e8f0",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}
          >
            <Send size={16} color={text.trim() ? "#fff" : "#aaa"} strokeWidth={2} />
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
