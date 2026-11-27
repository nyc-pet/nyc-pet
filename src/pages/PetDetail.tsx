import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { PetPost } from "../lib/supabase";
import { ArrowLeft, MapPin, Heart, MessageCircle, Lock, Share2, CheckCircle } from "lucide-react";

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<PetPost | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [contacting, setContacting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reuniting, setReuniting] = useState(false);
  const [photoIdx, setPhotoIdx] = useState<number | null>(null);

  useEffect(() => {
    if (id) supabase.from("pet_posts").select("*").eq("id", id).single().then(({ data }) => setPost(data));
    supabase.auth.getUser().then(async ({ data }) => {
      setUserId(data.user?.id || null);
      if (data.user && id) {
        const { data: sv } = await supabase.from("saved_pets").select("id").eq("user_id", data.user.id).eq("pet_post_id", id).maybeSingle();
        setSaved(!!sv);
      }
    });
  }, [id]);

  async function toggleSave() {
    if (!userId) { navigate("/login"); return; }
    if (saved) {
      await supabase.from("saved_pets").delete().eq("user_id", userId).eq("pet_post_id", id);
      setSaved(false);
    } else {
      await supabase.from("saved_pets").insert({ user_id: userId, pet_post_id: id });
      setSaved(true);
    }
  }

  async function markReunited() {
    if (!userId || !post) return;
    setReuniting(true);
    await supabase.from("pet_posts").update({ status: "found" }).eq("id", post.id);
    setPost(prev => prev ? { ...prev, status: "found" } : prev);
    setReuniting(false);
  }

  function share() {
    const text = `${post?.name || post?.species} — ${post?.status === "lost" ? "Lost" : "Found"} near ${post?.last_seen_address}`;
    if (navigator.share) {
      navigator.share({ title: "nyc.pet", text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  }

  // Photos array
  const photos = post ? [post.photo_url, post.photo_url_2, post.photo_url_3, post.photo_url_4].filter(Boolean) as string[] : [];

  async function handleContact() {
    if (!userId) { navigate("/login"); return; }
    if (!post) return;
    setContacting(true);
    try {
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("pet_post_id", post.id)
        .eq("sender_id", userId)
        .maybeSingle();

      if (existing) {
        navigate(`/chat/${existing.id}`);
        return;
      }

      // Create new conversation
      const { data: newConv } = await supabase
        .from("conversations")
        .insert({ pet_post_id: post.id, sender_id: userId, receiver_id: post.user_id || userId })
        .select("id")
        .single();

      if (newConv) navigate(`/chat/${newConv.id}`);
    } finally {
      setContacting(false);
    }
  }

  if (!post) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>Loading…</div>;

  const isLost = post.status === "lost";

  return (
    <div style={{ minHeight: "100dvh", background: "#fff" }}>
      <div style={{ position: "relative", height: 340, zIndex: 0 }}>
        {post.photo_url
          ? <img src={post.photo_url} alt="" onClick={() => setPhotoIdx(0)} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} />
          : <div style={{ width: "100%", height: "100%", background: "var(--gray-1)", display: "flex", alignItems: "center", justifyContent: "center" }}><MapPin size={40} color="#ddd" /></div>
        }
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%)" }} />
        <button onClick={() => navigate(-1)} style={{ position: "absolute", top: 56, left: 20, width: 40, height: 40, borderRadius: 20, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          <ArrowLeft size={18} color="#111" />
        </button>
        <div style={{ position: "absolute", top: 56, right: 20, display: "flex", gap: 8 }}>
          <button onClick={share} style={{ width: 40, height: 40, borderRadius: 20, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
            <Share2 size={16} color="#111" />
          </button>
          <button onClick={toggleSave} style={{ width: 40, height: 40, borderRadius: 20, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
            <Heart size={16} color={saved ? "#ff3b30" : "#111"} fill={saved ? "#ff3b30" : "none"} />
          </button>
        </div>
        <div style={{ position: "absolute", bottom: 56, left: 16, zIndex: 2, padding: "7px 16px", borderRadius: 20, background: isLost ? "rgba(255,59,48,0.92)" : "rgba(52,199,89,0.92)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{isLost ? "Lost" : "Found"}</span>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: "30px 30px 0 0", marginTop: -40, padding: "12px 24px 100px", minHeight: 500, position: "relative", zIndex: 1, boxShadow: "0 -8px 24px rgba(0,0,0,0.12)" }}>
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#000" }}>{post.name || post.species}</h1>
            <p style={{ fontSize: 14, color: "var(--gray-4)", marginTop: 4 }}>{post.breed || post.species}</p>
          </div>
          <div style={{ padding: "5px 12px", borderRadius: 20, background: "#111", flexShrink: 0, marginTop: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: 0.3 }}>
              {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px", background: "var(--gray-1)", borderRadius: 16, marginBottom: 16 }}>
          <MapPin size={16} color="var(--gray-4)" />
          <p style={{ fontSize: 14, color: "#000", fontWeight: 500 }}>{post.last_seen_address}</p>
        </div>

        {post.description && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#000", marginBottom: 8 }}>Description</p>
            <p style={{ fontSize: 14, color: "var(--gray-4)", lineHeight: 1.6 }}>{post.description}</p>
          </div>
        )}

        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: "#000", marginBottom: 12 }}>Details</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["Species", post.species],
              ["Color", post.color || "—"],
              ["Breed", post.breed || "—"],
            ].map(([label, val]) => (
              <div key={label} style={{ padding: "12px 14px", background: "var(--gray-1)", borderRadius: 14 }}>
                <p style={{ fontSize: 11, color: "var(--gray-4)", fontWeight: 600, marginBottom: 4 }}>{label}</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#000" }}>{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Extra photos strip */}
        {photos.length > 1 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#000", marginBottom: 10 }}>Photos</p>
            <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
              {photos.map((url, i) => (
                <div key={i} onClick={() => setPhotoIdx(i)} style={{ width: 80, height: 80, borderRadius: 14, overflow: "hidden", flexShrink: 0, cursor: "pointer" }}>
                  <img src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact via in-app message */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={handleContact} disabled={contacting}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "17px 20px", background: "#111", borderRadius: 18, color: "#fff", cursor: "pointer" }}>
            <MessageCircle size={20} strokeWidth={1.8} />
            <span style={{ flex: 1, fontSize: 15, fontWeight: 700, textAlign: "left" }}>
              {contacting ? "Opening chat…" : `Message about ${post.name || post.species}`}
            </span>
          </button>

          {/* Mark as Reunited — only owner sees this */}
          {userId === post.user_id && post.status === "lost" && (
            <button onClick={markReunited} disabled={reuniting}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "17px 20px", background: "#f0fff4", border: "1.5px solid #34c759", borderRadius: 18, color: "#34c759", cursor: "pointer" }}>
              <CheckCircle size={20} strokeWidth={1.8} />
              <span style={{ flex: 1, fontSize: 15, fontWeight: 700, textAlign: "left" }}>
                {reuniting ? "Updating…" : "Mark as Reunited 🎉"}
              </span>
            </button>
          )}

          {!userId && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", background: "#fafafa", borderRadius: 14, border: "1px solid #f0f0f0" }}>
              <Lock size={14} color="#aaa" strokeWidth={1.8} />
              <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>
                You'll need to <strong style={{ color: "#111" }}>sign in</strong> to send a message. Personal contact info is never shared.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Full-screen photo lightbox */}
      {photoIdx !== null && photos.length > 0 && (
        <div onClick={() => setPhotoIdx(null)} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={photos[photoIdx]} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} onClick={e => e.stopPropagation()} />
          {/* Prev / Next */}
          {photos.length > 1 && (
            <div style={{ position: "absolute", bottom: 40, display: "flex", gap: 10 }}>
              {photos.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setPhotoIdx(i); }}
                  style={{ width: 8, height: 8, borderRadius: 4, background: i === photoIdx ? "#fff" : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", padding: 0 }} />
              ))}
            </div>
          )}
          <button onClick={() => setPhotoIdx(null)} style={{ position: "absolute", top: 56, right: 20, width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft size={18} color="#fff" style={{ transform: "rotate(180deg)" }} />
          </button>
        </div>
      )}
    </div>
  );
}
