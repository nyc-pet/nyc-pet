import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Clock, Trash2 } from "lucide-react";
import AppHeader from "../components/AppHeader";
import { supabase } from "../lib/supabase";
import type { PetPost } from "../lib/supabase";

interface SavedRow { id: string; pet_post_id: string; pet_posts: PetPost; }

function timeAgo(d: string) {
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Saved() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState<SavedRow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
      if (data.user) loadSaved(data.user.id);
      else setLoading(false);
    });
  }, []);

  async function loadSaved(uid: string) {
    const { data } = await supabase
      .from("saved_pets")
      .select("id, pet_post_id, pet_posts(*)")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    setSaved((data as unknown as SavedRow[]) || []);
    setLoading(false);
  }

  async function unsave(savedId: string) {
    await supabase.from("saved_pets").delete().eq("id", savedId);
    setSaved(prev => prev.filter(s => s.id !== savedId));
  }

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh" }}>
      <div style={{ width: 24, height: 24, border: "3px solid #e2e8f0", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#f5f5f7" }}>

      {/* Header */}
      <AppHeader />
      <div style={{ padding: "0 24px 16px", background: "#fff" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111", marginBottom: 2 }}>Saved</h2>
        <p style={{ fontSize: 13, color: "#aaa" }}>{saved.length} bookmarked pet{saved.length !== 1 ? "s" : ""}</p>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 100px" }}>

        {/* Not logged in */}
        {!userId && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 60, gap: 16, textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: 36, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Heart size={30} color="#c4c4c4" strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#111" }}>Sign in to save pets</p>
            <p style={{ fontSize: 13, color: "#aaa", maxWidth: 240, lineHeight: 1.6 }}>Bookmark pets you're keeping an eye on so you can find them quickly.</p>
            <button onClick={() => navigate("/login")} style={{ padding: "13px 32px", borderRadius: 24, background: "#111", color: "#fff", fontSize: 14, fontWeight: 700, marginTop: 8 }}>
              Sign In
            </button>
          </div>
        )}

        {/* Logged in, empty */}
        {userId && saved.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 60, gap: 16, textAlign: "center" }}>
            <div style={{ width: 72, height: 72, borderRadius: 36, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Heart size={30} color="#c4c4c4" strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#111" }}>No saved pets yet</p>
            <p style={{ fontSize: 13, color: "#aaa", maxWidth: 240, lineHeight: 1.6 }}>Tap the heart on any pet to save it here for quick access.</p>
            <button onClick={() => navigate("/discover")} style={{ padding: "13px 32px", borderRadius: 24, background: "#111", color: "#fff", fontSize: 14, fontWeight: 700, marginTop: 8 }}>
              Browse Pets
            </button>
          </div>
        )}

        {/* List */}
        {saved.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {saved.map(({ id, pet_posts: p }) => {
              if (!p) return null;
              const isLost = p.status === "lost";
              return (
                <div key={id} style={{ display: "flex", background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", cursor: "pointer" }}
                  onClick={() => navigate(`/pet/${p.id}`)}>
                  <div style={{ width: 100, height: 108, flexShrink: 0, background: "#f1f5f9" }}>
                    {p.photo_url
                      ? <img src={p.photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Heart size={28} color="#ddd" /></div>
                    }
                  </div>
                  <div style={{ flex: 1, padding: "12px 12px 12px 14px", display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: isLost ? "#fff0ef" : "#f0fff4", color: isLost ? "#ff3b30" : "#34c759" }}>
                        {isLost ? "Lost" : "Found"}
                      </span>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name || p.species}</p>
                    <p style={{ fontSize: 12, color: "#aaa", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.breed || p.species}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                      <MapPin size={11} color="#c4c4c4" />
                      <p style={{ fontSize: 11, color: "#aaa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.last_seen_address}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                      <Clock size={11} color="#c4c4c4" />
                      <p style={{ fontSize: 11, color: "#c4c4c4" }}>{timeAgo(p.created_at)}</p>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); unsave(id); }}
                    style={{ width: 44, display: "flex", alignItems: "center", justifyContent: "center", background: "none", flexShrink: 0 }}>
                    <Trash2 size={16} color="#ff3b30" strokeWidth={1.8} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
