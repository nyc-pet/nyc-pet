import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { PetPost } from "../lib/supabase";
import { Trash2, CheckCircle, XCircle, Eye, RefreshCw } from "lucide-react";

function timeAgo(d: string) {
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [posts, setPosts] = useState<PetPost[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<PetPost | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, lost: 0, found: 0 });

  const [authError, setAuthError] = useState<"not_logged_in" | "not_admin" | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) { setAuthError("not_logged_in"); setLoading(false); return; }
      if (!user.user_metadata?.is_admin) { setAuthError("not_admin"); setLoading(false); return; }
      setAuthorized(true);
      loadPosts();
    });
  }, []);

  async function loadPosts() {
    setLoading(true);
    const { data } = await supabase
      .from("pet_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setPosts(data as PetPost[]);
      setStats({
        total: data.length,
        pending: data.filter((p: PetPost) => !p.approved).length,
        approved: data.filter((p: PetPost) => p.approved).length,
        lost: data.filter((p: PetPost) => p.status === "lost").length,
        found: data.filter((p: PetPost) => p.status === "found").length,
      });
    }
    setLoading(false);
  }

  async function approve(id: string) {
    setActionLoading(id + "_approve");
    await supabase.from("pet_posts").update({ approved: true }).eq("id", id);
    setPosts(ps => ps.map(p => p.id === id ? { ...p, approved: true } : p));
    setStats(s => ({ ...s, pending: s.pending - 1, approved: s.approved + 1 }));
    setActionLoading(null);
  }

  async function reject(id: string) {
    setActionLoading(id + "_reject");
    await supabase.from("pet_posts").update({ approved: false }).eq("id", id);
    setPosts(ps => ps.map(p => p.id === id ? { ...p, approved: false } : p));
    setStats(s => ({ ...s, pending: s.pending + 1, approved: s.approved - 1 }));
    setActionLoading(null);
  }

  async function deletePost(id: string) {
    if (!confirm("Permanently delete this post?")) return;
    setActionLoading(id + "_delete");
    await supabase.from("pet_posts").delete().eq("id", id);
    setPosts(ps => ps.filter(p => p.id !== id));
    setStats(s => ({ ...s, total: s.total - 1 }));
    if (selected?.id === id) setSelected(null);
    setActionLoading(null);
  }

  const filtered = posts.filter(p => {
    if (filter === "pending") return !p.approved;
    if (filter === "approved") return p.approved;
    return true;
  });

  if (authError === "not_logged_in") return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ background: "#181818", border: "1px solid #2a2a2a", borderRadius: 20, padding: 40, textAlign: "center", maxWidth: 360 }}>
        <img src="/logo.png" alt="nyc.pet" style={{ height: 36, filter: "brightness(0) invert(1)", marginBottom: 24 }} />
        <p style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Admin Access</p>
        <p style={{ fontSize: 14, color: "#666", marginBottom: 24, lineHeight: 1.6 }}>You need to be signed in to access this area.</p>
        <button onClick={() => navigate("/login")} style={{ width: "100%", padding: "12px", borderRadius: 12, background: "#fff", color: "#111", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>
          Sign In
        </button>
      </div>
    </div>
  );

  if (authError === "not_admin") return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ background: "#181818", border: "1px solid #2a2a2a", borderRadius: 20, padding: 40, textAlign: "center", maxWidth: 400 }}>
        <p style={{ fontSize: 32, marginBottom: 16 }}>🚫</p>
        <p style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Not Authorized</p>
        <p style={{ fontSize: 14, color: "#666", marginBottom: 8, lineHeight: 1.6 }}>Your account doesn't have admin access.</p>
        <p style={{ fontSize: 13, color: "#444", marginBottom: 24, lineHeight: 1.6, fontFamily: "monospace", background: "#111", padding: "12px 16px", borderRadius: 10 }}>
          Run in Supabase SQL:<br/>
          UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{`{"is_admin":true}`}' WHERE email = 'your@email.com';
        </p>
        <button onClick={() => navigate("/")} style={{ padding: "10px 24px", borderRadius: 12, background: "#222", color: "#aaa", fontWeight: 600, fontSize: 14, border: "1px solid #333", cursor: "pointer" }}>
          Back to App
        </button>
      </div>
    </div>
  );

  if (!authorized) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", fontFamily: "system-ui,-apple-system,sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Top bar */}
      <div style={{ background: "#181818", borderBottom: "1px solid #2a2a2a", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src="/logo.png" alt="nyc.pet" style={{ height: 28, filter: "brightness(0) invert(1)" }} />
          <span style={{ color: "#555", fontSize: 14 }}>/</span>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Admin</span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={loadPosts} style={{ background: "none", border: "1px solid #333", borderRadius: 8, padding: "6px 12px", color: "#aaa", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={() => navigate("/")} style={{ background: "#222", border: "1px solid #333", borderRadius: 8, padding: "6px 14px", color: "#aaa", fontSize: 13, cursor: "pointer" }}>
            ← App
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{ width: 220, background: "#181818", borderRight: "1px solid #2a2a2a", padding: "24px 0", flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: 1, textTransform: "uppercase", padding: "0 20px 10px" }}>Posts</p>

          {([
            { key: "pending", label: "Pending Review", count: stats.pending, color: "#f59e0b" },
            { key: "approved", label: "Approved", count: stats.approved, color: "#34c759" },
            { key: "all", label: "All Posts", count: stats.total, color: "#aaa" },
          ] as const).map(item => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              style={{
                width: "100%", padding: "10px 20px", border: "none", background: filter === item.key ? "rgba(255,255,255,0.07)" : "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                borderLeft: filter === item.key ? "3px solid #fff" : "3px solid transparent",
              }}
            >
              <span style={{ fontSize: 14, color: filter === item.key ? "#fff" : "#888" }}>{item.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: item.color, background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "1px 8px" }}>{item.count}</span>
            </button>
          ))}

          <div style={{ marginTop: 24, padding: "0 20px" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Breakdown</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#666" }}>Lost</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#ff3b30" }}>{stats.lost}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "#666" }}>Found</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#34c759" }}>{stats.found}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: "auto", display: "flex" }}>

          {/* Posts table */}
          <div style={{ flex: 1, overflow: "auto" }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#555" }}>Loading…</div>
            ) : filtered.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, color: "#555", gap: 8 }}>
                <p style={{ fontSize: 18, fontWeight: 700 }}>No posts</p>
                <p style={{ fontSize: 14 }}>Nothing in this category</p>
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
                    {["Photo", "Pet", "Status", "Location", "Posted", "Approved", "Actions"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 0.8, textAlign: "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(post => (
                    <tr
                      key={post.id}
                      onClick={() => setSelected(selected?.id === post.id ? null : post)}
                      style={{ borderBottom: "1px solid #1e1e1e", cursor: "pointer", background: selected?.id === post.id ? "rgba(255,255,255,0.04)" : "transparent", transition: "background 0.1s" }}
                    >
                      {/* Photo */}
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", background: "#222", flexShrink: 0 }}>
                          {post.photo_url
                            ? <img src={post.photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🐾</div>
                          }
                        </div>
                      </td>

                      {/* Pet */}
                      <td style={{ padding: "10px 16px" }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>{post.name || "—"}</p>
                        <p style={{ fontSize: 12, color: "#666", margin: 0 }}>{post.species}{post.breed ? ` · ${post.breed}` : ""}</p>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: post.status === "lost" ? "#3a1a1a" : "#1a3a1a", color: post.status === "lost" ? "#ff3b30" : "#34c759" }}>
                          {post.status}
                        </span>
                      </td>

                      {/* Location */}
                      <td style={{ padding: "10px 16px", maxWidth: 180 }}>
                        <p style={{ fontSize: 13, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{post.last_seen_address || "—"}</p>
                      </td>

                      {/* Posted */}
                      <td style={{ padding: "10px 16px" }}>
                        <p style={{ fontSize: 13, color: "#666", margin: 0 }}>{timeAgo(post.created_at)}</p>
                      </td>

                      {/* Approved */}
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: post.approved ? "#1a3a1a" : "#2a2200", color: post.approved ? "#34c759" : "#f59e0b" }}>
                          {post.approved ? "✓ Live" : "⏳ Pending"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "10px 16px" }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => window.open(`/pet/${post.id}`, "_blank")} title="View" style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #333", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>
                            <Eye size={14} />
                          </button>
                          {!post.approved ? (
                            <button onClick={() => approve(post.id)} title="Approve" disabled={actionLoading === post.id + "_approve"} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #1a3a1a", background: "#1a3a1a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#34c759" }}>
                              <CheckCircle size={14} />
                            </button>
                          ) : (
                            <button onClick={() => reject(post.id)} title="Unapprove" disabled={actionLoading === post.id + "_reject"} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #2a2200", background: "#2a2200", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                              <XCircle size={14} />
                            </button>
                          )}
                          <button onClick={() => deletePost(post.id)} title="Delete" disabled={actionLoading === post.id + "_delete"} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #3a1a1a", background: "#3a1a1a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff3b30" }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ width: 320, background: "#181818", borderLeft: "1px solid #2a2a2a", overflow: "auto", flexShrink: 0, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0 }}>Details</p>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
              </div>

              {selected.photo_url && (
                <img src={selected.photo_url} style={{ width: "100%", borderRadius: 14, marginBottom: 16, objectFit: "cover", maxHeight: 200 }} />
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Row label="Name" value={selected.name || "—"} />
                <Row label="Species" value={selected.species} />
                <Row label="Breed" value={selected.breed || "—"} />
                <Row label="Color" value={selected.color || "—"} />
                <Row label="Status" value={selected.status} />
                <Row label="Location" value={selected.last_seen_address} />
                <Row label="Coordinates" value={selected.lat ? `${selected.lat.toFixed(5)}, ${selected.lng.toFixed(5)}` : "—"} />
                {selected.description && <Row label="Description" value={selected.description} />}
                <Row label="Contact Name" value={selected.contact_name || "—"} />
                <Row label="Contact Phone" value={selected.contact_phone || "—"} />
                <Row label="Contact Email" value={selected.contact_email || "—"} />
                {selected.reward && <Row label="Reward" value={selected.reward} highlight />}
                <Row label="Posted" value={new Date(selected.created_at).toLocaleString()} />
                <Row label="Post ID" value={selected.id} mono />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight, mono }: { label: string; value: string; highlight?: boolean; mono?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 3px" }}>{label}</p>
      <p style={{ fontSize: 13, color: highlight ? "#f59e0b" : "#ccc", margin: 0, fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-all", lineHeight: 1.5 }}>{value}</p>
    </div>
  );
}
