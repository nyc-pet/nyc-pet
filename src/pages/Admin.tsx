import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { PetPost } from "../lib/supabase";
import { Trash2, CheckCircle, XCircle, Eye, RefreshCw, Users, FileText, ShieldCheck, ShieldOff, Mail, Calendar, LogIn, Edit2, Save, X } from "lucide-react";

function timeAgo(d: string) {
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
}

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  raw_user_meta_data: Record<string, unknown>;
  provider: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [authError, setAuthError] = useState<"not_logged_in" | "not_admin" | null>(null);

  // Section
  const [section, setSection] = useState<"posts" | "users">("posts");

  // Posts state
  const [posts, setPosts] = useState<PetPost[]>([]);
  const [postFilter, setPostFilter] = useState<"all" | "pending" | "approved">("pending");
  const [selectedPost, setSelectedPost] = useState<PetPost | null>(null);
  const [postStats, setPostStats] = useState({ total: 0, pending: 0, approved: 0, lost: 0, found: 0 });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userPosts, setUserPosts] = useState<PetPost[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersFuncMissing, setUsersFuncMissing] = useState(false);

  // Edit state
  const [editingPost, setEditingPost] = useState(false);
  const [postForm, setPostForm] = useState<Partial<PetPost>>({});
  const [editingUser, setEditingUser] = useState(false);
  const [userForm, setUserForm] = useState({ name: "", email: "" });
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) { setAuthError("not_logged_in"); setLoading(false); return; }
      if (!user.user_metadata?.is_admin) { setAuthError("not_admin"); setLoading(false); return; }
      setAuthorized(true);
      loadPosts();
    });
  }, []);

  // ── POSTS ──────────────────────────────────────────────
  async function loadPosts() {
    setLoading(true);
    const { data } = await supabase.from("pet_posts").select("*").order("created_at", { ascending: false });
    if (data) {
      setPosts(data as PetPost[]);
      setPostStats({
        total: data.length,
        pending: data.filter((p: PetPost) => !p.approved).length,
        approved: data.filter((p: PetPost) => p.approved).length,
        lost: data.filter((p: PetPost) => p.status === "lost").length,
        found: data.filter((p: PetPost) => p.status === "found").length,
      });
    }
    setLoading(false);
  }

  async function approvePost(id: string) {
    setActionLoading(id + "_approve");
    await supabase.from("pet_posts").update({ approved: true }).eq("id", id);
    setPosts(ps => ps.map(p => p.id === id ? { ...p, approved: true } : p));
    setPostStats(s => ({ ...s, pending: s.pending - 1, approved: s.approved + 1 }));
    setActionLoading(null);
  }

  async function rejectPost(id: string) {
    setActionLoading(id + "_reject");
    await supabase.from("pet_posts").update({ approved: false }).eq("id", id);
    setPosts(ps => ps.map(p => p.id === id ? { ...p, approved: false } : p));
    setPostStats(s => ({ ...s, pending: s.pending + 1, approved: s.approved - 1 }));
    setActionLoading(null);
  }

  async function deletePost(id: string) {
    if (!confirm("Permanently delete this post?")) return;
    setActionLoading(id + "_delete");
    await supabase.from("pet_posts").delete().eq("id", id);
    setPosts(ps => ps.filter(p => p.id !== id));
    setPostStats(s => ({ ...s, total: s.total - 1 }));
    if (selectedPost?.id === id) setSelectedPost(null);
    setActionLoading(null);
  }

  async function savePost() {
    if (!selectedPost) return;
    setSaveLoading(true);
    const { error } = await supabase.from("pet_posts").update(postForm).eq("id", selectedPost.id);
    if (error) { alert(error.message); setSaveLoading(false); return; }
    const updated = { ...selectedPost, ...postForm };
    setPosts(ps => ps.map(p => p.id === selectedPost.id ? updated : p));
    setSelectedPost(updated);
    setEditingPost(false);
    setSaveLoading(false);
  }

  async function saveUser() {
    if (!selectedUser) return;
    setSaveLoading(true);
    const { error } = await supabase.rpc("admin_update_user", { user_id: selectedUser.id, new_name: userForm.name, new_email: userForm.email });
    if (error) { alert(error.message); setSaveLoading(false); return; }
    const updated = { ...selectedUser, email: userForm.email, raw_user_meta_data: { ...selectedUser.raw_user_meta_data, full_name: userForm.name } };
    setUsers(us => us.map(u => u.id === selectedUser.id ? updated : u));
    setSelectedUser(updated);
    setEditingUser(false);
    setSaveLoading(false);
  }

  // ── USERS ──────────────────────────────────────────────
  async function loadUsers() {
    setUsersLoading(true);
    const { data, error } = await supabase.rpc("admin_get_users");
    if (error) {
      if (error.message.includes("does not exist") || error.code === "42883") setUsersFuncMissing(true);
      setUsersLoading(false);
      return;
    }
    setUsers((data as AdminUser[]) || []);
    setUsersLoading(false);
  }

  async function loadUserPosts(userId: string) {
    const { data } = await supabase.from("pet_posts").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    setUserPosts((data as PetPost[]) || []);
  }

  async function deleteUser(userId: string, email: string) {
    if (!confirm(`Permanently delete user ${email} and all their data?`)) return;
    setActionLoading("user_" + userId);
    const { error } = await supabase.rpc("admin_delete_user", { user_id: userId });
    if (error) { alert("Error: " + error.message); setActionLoading(null); return; }
    setUsers(us => us.filter(u => u.id !== userId));
    if (selectedUser?.id === userId) setSelectedUser(null);
    setActionLoading(null);
  }

  async function toggleAdmin(userId: string, makeAdmin: boolean) {
    setActionLoading("admin_" + userId);
    const { error } = await supabase.rpc("admin_toggle_admin", { user_id: userId, make_admin: makeAdmin });
    if (error) { alert("Error: " + error.message); setActionLoading(null); return; }
    setUsers(us => us.map(u => u.id === userId ? { ...u, raw_user_meta_data: { ...u.raw_user_meta_data, is_admin: makeAdmin } } : u));
    if (selectedUser?.id === userId) setSelectedUser(prev => prev ? { ...prev, raw_user_meta_data: { ...prev.raw_user_meta_data, is_admin: makeAdmin } } : null);
    setActionLoading(null);
  }

  function selectUser(user: AdminUser) {
    setSelectedUser(user);
    setEditingUser(false);
    setUserForm({ name: (user.raw_user_meta_data?.full_name || user.raw_user_meta_data?.name || "") as string, email: user.email });
    loadUserPosts(user.id);
  }

  function selectPost(post: PetPost) {
    setSelectedPost(selectedPost?.id === post.id ? null : post);
    setEditingPost(false);
    setPostForm({ name: post.name, status: post.status, description: post.description, last_seen_address: post.last_seen_address, contact_name: post.contact_name, contact_phone: post.contact_phone, contact_email: post.contact_email, reward: post.reward });
  }

  // ── AUTH ERRORS ────────────────────────────────────────
  if (authError === "not_logged_in") return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ background: "#181818", border: "1px solid #2a2a2a", borderRadius: 20, padding: 40, textAlign: "center", maxWidth: 360 }}>
        <img src="/logo.png" alt="nyc.pet" style={{ height: 36, filter: "brightness(0) invert(1)", marginBottom: 24 }} />
        <p style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Admin Access</p>
        <p style={{ fontSize: 14, color: "#666", marginBottom: 24, lineHeight: 1.6 }}>You need to be signed in to access this area.</p>
        <button onClick={() => navigate("/login")} style={{ width: "100%", padding: "12px", borderRadius: 12, background: "#fff", color: "#111", fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer" }}>Sign In</button>
      </div>
    </div>
  );

  if (authError === "not_admin") return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ background: "#181818", border: "1px solid #2a2a2a", borderRadius: 20, padding: 40, textAlign: "center", maxWidth: 400 }}>
        <p style={{ fontSize: 32, marginBottom: 16 }}>🚫</p>
        <p style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Not Authorized</p>
        <p style={{ fontSize: 13, color: "#444", marginBottom: 24, lineHeight: 1.6, fontFamily: "monospace", background: "#111", padding: "12px 16px", borderRadius: 10, textAlign: "left" }}>
          UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{`{"is_admin":true}`}' WHERE email = 'your@email.com';
        </p>
        <button onClick={() => navigate("/")} style={{ padding: "10px 24px", borderRadius: 12, background: "#222", color: "#aaa", fontWeight: 600, fontSize: 14, border: "1px solid #333", cursor: "pointer" }}>Back to App</button>
      </div>
    </div>
  );

  if (!authorized) return null;

  const filteredPosts = posts.filter(p => {
    if (postFilter === "pending") return !p.approved;
    if (postFilter === "approved") return p.approved;
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", fontFamily: "system-ui,-apple-system,sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Top bar */}
      <div style={{ background: "#181818", borderBottom: "1px solid #2a2a2a", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <img src="/logo.png" alt="nyc.pet" style={{ height: 28, filter: "brightness(0) invert(1)" }} />
          <span style={{ color: "#555", fontSize: 14 }}>/</span>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Admin</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => { loadPosts(); if (section === "users") loadUsers(); }} style={{ background: "none", border: "1px solid #333", borderRadius: 8, padding: "6px 12px", color: "#aaa", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button onClick={() => navigate("/")} style={{ background: "#222", border: "1px solid #333", borderRadius: 8, padding: "6px 14px", color: "#aaa", fontSize: 13, cursor: "pointer" }}>← App</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{ width: 220, background: "#181818", borderRight: "1px solid #2a2a2a", padding: "24px 0", flexShrink: 0, display: "flex", flexDirection: "column" }}>

          {/* Section switcher */}
          <div style={{ padding: "0 12px 20px", display: "flex", gap: 4 }}>
            <button onClick={() => setSection("posts")} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: section === "posts" ? "#2a2a2a" : "none", color: section === "posts" ? "#fff" : "#666", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <FileText size={14} /> Posts
            </button>
            <button onClick={() => { setSection("users"); if (users.length === 0) loadUsers(); }} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: section === "users" ? "#2a2a2a" : "none", color: section === "users" ? "#fff" : "#666", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Users size={14} /> Users
            </button>
          </div>

          {section === "posts" && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: 1, textTransform: "uppercase", padding: "0 20px 10px" }}>Filter</p>
              {([
                { key: "pending", label: "Pending Review", count: postStats.pending, color: "#f59e0b" },
                { key: "approved", label: "Approved", count: postStats.approved, color: "#34c759" },
                { key: "all", label: "All Posts", count: postStats.total, color: "#aaa" },
              ] as const).map(item => (
                <button key={item.key} onClick={() => setPostFilter(item.key)} style={{ width: "100%", padding: "10px 20px", border: "none", background: postFilter === item.key ? "rgba(255,255,255,0.07)" : "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", borderLeft: postFilter === item.key ? "3px solid #fff" : "3px solid transparent" }}>
                  <span style={{ fontSize: 14, color: postFilter === item.key ? "#fff" : "#888" }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: item.color, background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "1px 8px" }}>{item.count}</span>
                </button>
              ))}
              <div style={{ marginTop: 24, padding: "0 20px", borderTop: "1px solid #222", paddingTop: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Breakdown</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <StatRow label="Lost" value={postStats.lost} color="#ff3b30" />
                  <StatRow label="Found" value={postStats.found} color="#34c759" />
                </div>
              </div>
            </>
          )}

          {section === "users" && (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#555", letterSpacing: 1, textTransform: "uppercase", padding: "0 20px 10px" }}>Stats</p>
              <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                <StatRow label="Total Users" value={users.length} color="#aaa" />
                <StatRow label="Admins" value={users.filter(u => u.raw_user_meta_data?.is_admin).length} color="#f59e0b" />
                <StatRow label="Google" value={users.filter(u => u.provider === "google").length} color="#4285F4" />
                <StatRow label="Email" value={users.filter(u => u.provider === "email").length} color="#34c759" />
              </div>
            </>
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflow: "auto", display: "flex" }}>

          {/* ── POSTS TABLE ── */}
          {section === "posts" && (
            <div style={{ flex: 1, overflow: "auto" }}>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#555" }}>Loading…</div>
              ) : filteredPosts.length === 0 ? (
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
                    {filteredPosts.map(post => (
                      <tr key={post.id} onClick={() => selectPost(post)} style={{ borderBottom: "1px solid #1e1e1e", cursor: "pointer", background: selectedPost?.id === post.id ? "rgba(255,255,255,0.04)" : "transparent", transition: "background 0.1s" }}>
                        <td style={{ padding: "10px 16px" }}>
                          <div style={{ width: 48, height: 48, borderRadius: 10, overflow: "hidden", background: "#222" }}>
                            {post.photo_url ? <img src={post.photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🐾</div>}
                          </div>
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>{post.name || "—"}</p>
                          <p style={{ fontSize: 12, color: "#666", margin: 0 }}>{post.species}{post.breed ? ` · ${post.breed}` : ""}</p>
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: post.status === "lost" ? "#3a1a1a" : "#1a3a1a", color: post.status === "lost" ? "#ff3b30" : "#34c759" }}>{post.status}</span>
                        </td>
                        <td style={{ padding: "10px 16px", maxWidth: 180 }}>
                          <p style={{ fontSize: 13, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{post.last_seen_address || "—"}</p>
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          <p style={{ fontSize: 13, color: "#666", margin: 0 }}>{timeAgo(post.created_at)}</p>
                        </td>
                        <td style={{ padding: "10px 16px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: post.approved ? "#1a3a1a" : "#2a2200", color: post.approved ? "#34c759" : "#f59e0b" }}>{post.approved ? "✓ Live" : "⏳ Pending"}</span>
                        </td>
                        <td style={{ padding: "10px 16px" }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <ActionBtn icon={<Eye size={14} />} onClick={() => window.open(`/pet/${post.id}`, "_blank")} title="View" />
                            {!post.approved
                              ? <ActionBtn icon={<CheckCircle size={14} />} onClick={() => approvePost(post.id)} title="Approve" color="green" disabled={actionLoading === post.id + "_approve"} />
                              : <ActionBtn icon={<XCircle size={14} />} onClick={() => rejectPost(post.id)} title="Unapprove" color="yellow" disabled={actionLoading === post.id + "_reject"} />
                            }
                            <ActionBtn icon={<Trash2 size={14} />} onClick={() => deletePost(post.id)} title="Delete" color="red" disabled={actionLoading === post.id + "_delete"} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── USERS TABLE ── */}
          {section === "users" && (
            <div style={{ flex: 1, overflow: "auto" }}>
              {usersFuncMissing ? (
                <div style={{ padding: 32, maxWidth: 640 }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 8 }}>⚙️ One-time Setup Required</p>
                  <p style={{ fontSize: 14, color: "#777", marginBottom: 20, lineHeight: 1.6 }}>Run this SQL once in Supabase → SQL Editor to enable user management:</p>
                  <pre style={{ background: "#111", border: "1px solid #2a2a2a", borderRadius: 12, padding: 20, fontSize: 12, color: "#a8ff78", lineHeight: 1.8, overflowX: "auto", whiteSpace: "pre-wrap" }}>{SQL_SETUP}</pre>
                  <button onClick={() => { setUsersFuncMissing(false); loadUsers(); }} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 10, background: "#fff", color: "#111", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>
                    I ran it — Retry
                  </button>
                </div>
              ) : usersLoading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#555" }}>Loading users…</div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #2a2a2a" }}>
                      {["User", "Email", "Provider", "Joined", "Last Sign In", "Role", "Actions"].map(h => (
                        <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 0.8, textAlign: "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => {
                      const isAdmin = !!user.raw_user_meta_data?.is_admin;
                      const name = (user.raw_user_meta_data?.full_name || user.raw_user_meta_data?.name || "") as string;
                      const avatar = user.raw_user_meta_data?.avatar_url as string;
                      const initials = (name || user.email || "?")[0].toUpperCase();
                      return (
                        <tr key={user.id} onClick={() => selectUser(user)} style={{ borderBottom: "1px solid #1e1e1e", cursor: "pointer", background: selectedUser?.id === user.id ? "rgba(255,255,255,0.04)" : "transparent", transition: "background 0.1s" }}>
                          <td style={{ padding: "10px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", background: "#333", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {avatar ? <img src={avatar} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: 14, fontWeight: 700, color: "#aaa" }}>{initials}</span>}
                              </div>
                              <span style={{ fontSize: 14, fontWeight: 600, color: "#ddd" }}>{name || "—"}</span>
                            </div>
                          </td>
                          <td style={{ padding: "10px 16px" }}>
                            <span style={{ fontSize: 13, color: "#888" }}>{user.email}</span>
                          </td>
                          <td style={{ padding: "10px 16px" }}>
                            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: user.provider === "google" ? "#1a2a4a" : "#1a3a1a", color: user.provider === "google" ? "#4285F4" : "#34c759" }}>{user.provider}</span>
                          </td>
                          <td style={{ padding: "10px 16px" }}>
                            <span style={{ fontSize: 13, color: "#666" }}>{timeAgo(user.created_at)}</span>
                          </td>
                          <td style={{ padding: "10px 16px" }}>
                            <span style={{ fontSize: 13, color: "#666" }}>{user.last_sign_in_at ? timeAgo(user.last_sign_in_at) : "Never"}</span>
                          </td>
                          <td style={{ padding: "10px 16px" }}>
                            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: isAdmin ? "#2a1a3a" : "#1a1a1a", color: isAdmin ? "#c084fc" : "#555" }}>{isAdmin ? "Admin" : "User"}</span>
                          </td>
                          <td style={{ padding: "10px 16px" }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: "flex", gap: 6 }}>
                              {isAdmin
                                ? <ActionBtn icon={<ShieldOff size={14} />} onClick={() => toggleAdmin(user.id, false)} title="Remove Admin" color="yellow" disabled={actionLoading === "admin_" + user.id} />
                                : <ActionBtn icon={<ShieldCheck size={14} />} onClick={() => toggleAdmin(user.id, true)} title="Make Admin" disabled={actionLoading === "admin_" + user.id} />
                              }
                              <ActionBtn icon={<Trash2 size={14} />} onClick={() => deleteUser(user.id, user.email)} title="Delete User" color="red" disabled={actionLoading === "user_" + user.id} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── DETAIL PANELS ── */}

          {/* Post detail */}
          {section === "posts" && selectedPost && (
            <div style={{ width: 340, background: "#181818", borderLeft: "1px solid #2a2a2a", overflow: "auto", flexShrink: 0, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0 }}>{editingPost ? "Edit Post" : "Post Details"}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {!editingPost && <button onClick={() => setEditingPost(true)} style={{ background: "#222", border: "1px solid #333", borderRadius: 8, padding: "5px 10px", color: "#aaa", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><Edit2 size={12} /> Edit</button>}
                  <button onClick={() => { setSelectedPost(null); setEditingPost(false); }} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
                </div>
              </div>

              {selectedPost.photo_url && <img src={selectedPost.photo_url} style={{ width: "100%", borderRadius: 14, marginBottom: 16, objectFit: "cover", maxHeight: 200 }} />}

              {editingPost ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <EditField label="Pet Name" value={postForm.name || ""} onChange={v => setPostForm(f => ({ ...f, name: v }))} />
                  <div>
                    <p style={{ fontSize: 11, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 6px" }}>Status</p>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["lost", "found"].map(s => (
                        <button key={s} onClick={() => setPostForm(f => ({ ...f, status: s as "lost" | "found" }))} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${postForm.status === s ? (s === "lost" ? "#ff3b30" : "#34c759") : "#333"}`, background: postForm.status === s ? (s === "lost" ? "#3a1a1a" : "#1a3a1a") : "#111", color: postForm.status === s ? (s === "lost" ? "#ff3b30" : "#34c759") : "#666", fontSize: 13, fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <EditField label="Location" value={postForm.last_seen_address || ""} onChange={v => setPostForm(f => ({ ...f, last_seen_address: v }))} />
                  <EditField label="Description" value={postForm.description || ""} onChange={v => setPostForm(f => ({ ...f, description: v }))} multiline />
                  <EditField label="Contact Name" value={postForm.contact_name || ""} onChange={v => setPostForm(f => ({ ...f, contact_name: v }))} />
                  <EditField label="Contact Phone" value={postForm.contact_phone || ""} onChange={v => setPostForm(f => ({ ...f, contact_phone: v }))} />
                  <EditField label="Contact Email" value={postForm.contact_email || ""} onChange={v => setPostForm(f => ({ ...f, contact_email: v }))} />
                  <EditField label="Reward" value={postForm.reward || ""} onChange={v => setPostForm(f => ({ ...f, reward: v }))} />
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button onClick={() => setEditingPost(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#222", color: "#aaa", border: "1px solid #333", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><X size={14} /> Cancel</button>
                    <button onClick={savePost} disabled={saveLoading} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#fff", color: "#111", border: "none", fontSize: 13, fontWeight: 700, cursor: saveLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: saveLoading ? 0.7 : 1 }}><Save size={14} /> {saveLoading ? "Saving…" : "Save"}</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <Row label="Name" value={selectedPost.name || "—"} />
                    <Row label="Species" value={selectedPost.species} />
                    <Row label="Breed" value={selectedPost.breed || "—"} />
                    <Row label="Color" value={selectedPost.color || "—"} />
                    <Row label="Status" value={selectedPost.status} />
                    <Row label="Location" value={selectedPost.last_seen_address} />
                    <Row label="Coordinates" value={selectedPost.lat ? `${selectedPost.lat.toFixed(5)}, ${selectedPost.lng.toFixed(5)}` : "—"} />
                    {selectedPost.description && <Row label="Description" value={selectedPost.description} />}
                    <Row label="Contact Name" value={selectedPost.contact_name || "—"} />
                    <Row label="Contact Phone" value={selectedPost.contact_phone || "—"} />
                    <Row label="Contact Email" value={selectedPost.contact_email || "—"} />
                    {selectedPost.reward && <Row label="Reward" value={selectedPost.reward} highlight />}
                    <Row label="Posted" value={new Date(selectedPost.created_at).toLocaleString()} />
                    <Row label="Post ID" value={selectedPost.id} mono />
                  </div>
                  <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
                    <button onClick={() => window.open(`/pet/${selectedPost.id}`, "_blank")} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#222", color: "#aaa", border: "1px solid #333", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>View Public</button>
                    <button onClick={() => deletePost(selectedPost.id)} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#3a1a1a", color: "#ff3b30", border: "1px solid #4a2a2a", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Delete</button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* User detail */}
          {section === "users" && selectedUser && (
            <div style={{ width: 340, background: "#181818", borderLeft: "1px solid #2a2a2a", overflow: "auto", flexShrink: 0, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: 0 }}>{editingUser ? "Edit User" : "User Details"}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {!editingUser && <button onClick={() => setEditingUser(true)} style={{ background: "#222", border: "1px solid #333", borderRadius: 8, padding: "5px 10px", color: "#aaa", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><Edit2 size={12} /> Edit</button>}
                  <button onClick={() => { setSelectedUser(null); setEditingUser(false); }} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
                </div>
              </div>

              {/* Avatar */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", overflow: "hidden", background: "#333", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                  {selectedUser.raw_user_meta_data?.avatar_url
                    ? <img src={selectedUser.raw_user_meta_data.avatar_url as string} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 28, fontWeight: 700, color: "#aaa" }}>{(selectedUser.email || "?")[0].toUpperCase()}</span>
                  }
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>{selectedUser.raw_user_meta_data?.full_name as string || selectedUser.raw_user_meta_data?.name as string || "No name"}</p>
                <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0" }}>{selectedUser.email}</p>
              </div>

              {editingUser ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                  <EditField label="Display Name" value={userForm.name} onChange={v => setUserForm(f => ({ ...f, name: v }))} />
                  <EditField label="Email Address" value={userForm.email} onChange={v => setUserForm(f => ({ ...f, email: v }))} />
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button onClick={() => setEditingUser(false)} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#222", color: "#aaa", border: "1px solid #333", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><X size={14} /> Cancel</button>
                    <button onClick={saveUser} disabled={saveLoading} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#fff", color: "#111", border: "none", fontSize: 13, fontWeight: 700, cursor: saveLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: saveLoading ? 0.7 : 1 }}><Save size={14} /> {saveLoading ? "Saving…" : "Save"}</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Mail size={14} style={{ color: "#555" }} />
                    <span style={{ fontSize: 13, color: "#888" }}>{selectedUser.provider} login</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Calendar size={14} style={{ color: "#555" }} />
                    <span style={{ fontSize: 13, color: "#888" }}>Joined {new Date(selectedUser.created_at).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <LogIn size={14} style={{ color: "#555" }} />
                    <span style={{ fontSize: 13, color: "#888" }}>Last seen {selectedUser.last_sign_in_at ? timeAgo(selectedUser.last_sign_in_at) : "never"}</span>
                  </div>
                </div>
              )}

              {/* Their posts */}
              <p style={{ fontSize: 11, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Their Posts ({userPosts.length})</p>
              {userPosts.length === 0 ? (
                <p style={{ fontSize: 13, color: "#444" }}>No posts yet</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {userPosts.map(p => (
                    <div key={p.id} onClick={() => window.open(`/pet/${p.id}`, "_blank")} style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer", padding: "8px", borderRadius: 10, background: "#111", border: "1px solid #222" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", background: "#222", flexShrink: 0 }}>
                        {p.photo_url ? <img src={p.photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>🐾</div>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#ddd", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name || "Unnamed"}</p>
                        <p style={{ fontSize: 11, color: "#555", margin: 0 }}>{p.status} · {timeAgo(p.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedUser.raw_user_meta_data?.is_admin
                  ? <button onClick={() => toggleAdmin(selectedUser.id, false)} style={{ padding: "10px", borderRadius: 10, background: "#2a1a3a", color: "#c084fc", border: "1px solid #3a2a4a", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Remove Admin</button>
                  : <button onClick={() => toggleAdmin(selectedUser.id, true)} style={{ padding: "10px", borderRadius: 10, background: "#222", color: "#aaa", border: "1px solid #333", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Make Admin</button>
                }
                <button onClick={() => deleteUser(selectedUser.id, selectedUser.email)} style={{ padding: "10px", borderRadius: 10, background: "#3a1a1a", color: "#ff3b30", border: "1px solid #4a2a2a", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Delete User & All Data</button>
              </div>

              <div style={{ marginTop: 16, padding: 12, background: "#111", borderRadius: 10, border: "1px solid #222" }}>
                <p style={{ fontSize: 11, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, margin: "0 0 4px" }}>User ID</p>
                <p style={{ fontSize: 11, color: "#444", fontFamily: "monospace", margin: 0, wordBreak: "break-all" }}>{selectedUser.id}</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── HELPERS ────────────────────────────────────────────────

function Row({ label, value, highlight, mono }: { label: string; value: string; highlight?: boolean; mono?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 3px" }}>{label}</p>
      <p style={{ fontSize: 13, color: highlight ? "#f59e0b" : "#ccc", margin: 0, fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-all", lineHeight: 1.5 }}>{value}</p>
    </div>
  );
}

function EditField({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const style: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #333", background: "#111", color: "#ddd", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" };
  return (
    <div>
      <p style={{ fontSize: 11, color: "#555", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 6px" }}>{label}</p>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} style={style} />
        : <input value={value} onChange={e => onChange(e.target.value)} style={style} />
      }
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontSize: 13, color: "#666" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

function ActionBtn({ icon, onClick, title, color, disabled }: { icon: React.ReactNode; onClick: () => void; title: string; color?: "red" | "green" | "yellow"; disabled?: boolean }) {
  const bg = color === "red" ? "#3a1a1a" : color === "green" ? "#1a3a1a" : color === "yellow" ? "#2a2200" : "none";
  const fg = color === "red" ? "#ff3b30" : color === "green" ? "#34c759" : color === "yellow" ? "#f59e0b" : "#aaa";
  const border = color === "red" ? "#4a2a2a" : color === "green" ? "#2a4a2a" : color === "yellow" ? "#3a3200" : "#333";
  return (
    <button onClick={onClick} title={title} disabled={disabled} style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${border}`, background: bg, cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: fg, opacity: disabled ? 0.5 : 1 }}>
      {icon}
    </button>
  );
}

// SQL to run once in Supabase
const SQL_SETUP = `-- Run this once in Supabase SQL Editor

CREATE OR REPLACE FUNCTION admin_get_users()
RETURNS TABLE (
  id uuid, email text, created_at timestamptz,
  last_sign_in_at timestamptz, raw_user_meta_data jsonb, provider text
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY
  SELECT u.id, u.email::text, u.created_at, u.last_sign_in_at,
    u.raw_user_meta_data,
    (u.raw_app_meta_data ->> 'provider')::text
  FROM auth.users u ORDER BY u.created_at DESC;
END; $$;

CREATE OR REPLACE FUNCTION admin_delete_user(user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  DELETE FROM auth.users WHERE id = user_id;
END; $$;

CREATE OR REPLACE FUNCTION admin_toggle_admin(user_id uuid, make_admin boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('is_admin', make_admin)
  WHERE id = user_id;
END; $$;

CREATE OR REPLACE FUNCTION admin_update_user(user_id uuid, new_name text, new_email text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE auth.users
  SET email = new_email,
      raw_user_meta_data = raw_user_meta_data || jsonb_build_object('full_name', new_name)
  WHERE id = user_id;
END; $$;`;
