import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { PetPost } from "../lib/supabase";
import { ChevronRight, FileText, LogOut, MapPin, Trash2, Clock, AlertTriangle, RefreshCw, Shield, ScrollText, UserX, X, Pencil, Camera } from "lucide-react";
import AppHeader from "../components/AppHeader";

function timeAgo(d: string) {
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function daysOld(d: string) {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<PetPost[]>([]);
  const [showReports, setShowReports] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editSuccess, setEditSuccess] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setDisplayName(data.user?.user_metadata?.display_name || "");
      setAvatarUrl(data.user?.user_metadata?.avatar_url || "");
      if (data.user) loadReports(data.user.id);
    });
  }, []);

  async function loadReports(uid: string) {
    const { data } = await supabase.from("pet_posts").select("*").eq("user_id", uid).order("created_at", { ascending: false });
    setReports((data as PetPost[]) || []);
  }

  async function deleteReport(id: string) {
    await supabase.from("pet_posts").delete().eq("id", id);
    setReports(prev => prev.filter(r => r.id !== id));
  }

  function openEditSheet() {
    setEditName(user.user_metadata?.display_name || "");
    setEditEmail(user.email || "");
    setEditSuccess("");
    setShowEditSheet(true);
  }

  async function uploadAvatar(file: File) {
    setUploadingPhoto(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = urlData.publicUrl + "?t=" + Date.now();
      await supabase.auth.updateUser({ data: { avatar_url: url } });
      setAvatarUrl(url);
    }
    setUploadingPhoto(false);
  }

  async function saveProfile() {
    setSavingProfile(true);
    setEditSuccess("");
    const updates: any = { data: { display_name: editName.trim(), avatar_url: avatarUrl } };
    if (editEmail.trim() && editEmail.trim() !== user.email) {
      updates.email = editEmail.trim();
    }
    const { data, error } = await supabase.auth.updateUser(updates);
    setSavingProfile(false);
    if (error) { setEditSuccess("Error: " + error.message); return; }
    setDisplayName(editName.trim());
    setUser(data.user);
    if (editEmail.trim() !== user.email) {
      setEditSuccess("Profile saved! Check your new email address for a confirmation link.");
    } else {
      setEditSuccess("Profile saved!");
      setTimeout(() => setShowEditSheet(false), 900);
    }
  }

  async function saveName() {
    setSavingName(true);
    await supabase.auth.updateUser({ data: { display_name: displayName.trim() } });
    setSavingName(false);
    setEditingName(false);
  }

  async function deleteAccount() {
    setDeleting(true);
    await supabase.rpc("delete_account");
    await supabase.auth.signOut();
    setDeleting(false);
    setShowDeleteModal(false);
    setUser(null);
    setReports([]);
  }

  if (!user) return (
    <div className="page" style={{ background: "#f5f5f7" }}>
      <AppHeader />
      <div style={{ padding: "0 24px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#000", marginBottom: 8 }}>Profile</h2>
      <div style={{ background: "var(--white)", borderRadius: 24, padding: 32, textAlign: "center", boxShadow: "var(--shadow-sm)", marginTop: 32 }}>
        <img src="/logo.png" alt="nyc.pet" style={{ height: 44, filter: "brightness(0)", display: "block", margin: "0 auto 16px" }} />
        <p style={{ fontSize: 20, fontWeight: 800, color: "#000" }}>Sign in to nyc.pet</p>
        <p style={{ fontSize: 14, color: "var(--gray-4)", marginTop: 8, lineHeight: 1.5 }}>Track reports and get notified when pets are found</p>
        <button onClick={() => navigate("/login")} style={{ width: "100%", background: "#111", color: "#fff", borderRadius: 16, padding: "16px", fontSize: 16, fontWeight: 700, marginTop: 24 }}>Sign In</button>
        <button onClick={() => navigate("/login?mode=signup")} style={{ width: "100%", background: "var(--gray-1)", color: "#000", borderRadius: 16, padding: "16px", fontSize: 16, fontWeight: 700, marginTop: 10 }}>Create Account</button>
      </div>
      </div>
    </div>
  );

  return (
    <div className="page" style={{ padding: "0 0 100px", background: "#f5f5f7" }}>
      <AppHeader />
      <div style={{ padding: "0 24px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#000", marginBottom: 20 }}>Profile</h2>

      {/* Avatar card */}
      <div style={{ background: "#fff", borderRadius: 24, padding: "20px", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", marginBottom: 14 }}>
        {/* Avatar */}
        <div style={{ width: 60, height: 60, borderRadius: 30, background: "#111", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: "#fff" }}>
          {avatarUrl
            ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : (displayName || user.email || "U")[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {displayName || <span style={{ color: "#aaa", fontWeight: 500 }}>Add your name</span>}
          </p>
          <p style={{ fontSize: 12, color: "#aaa", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
          <p style={{ fontSize: 11, color: "#ccc", marginTop: 2 }}>Member since {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
        </div>
        <button onClick={openEditSheet}
          style={{ padding: "8px 14px", borderRadius: 12, background: "#f5f5f7", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <Pencil size={13} color="#555" strokeWidth={2} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>Edit</span>
        </button>
      </div>

      {/* My Reports */}
      <div style={{ background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", marginBottom: 14 }}>
        <button onClick={() => setShowReports(v => !v)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", borderBottom: showReports ? "1px solid #f0f0f0" : "none" }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={16} color="#555" strokeWidth={1.8} />
          </div>
          <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "#000", textAlign: "left" }}>My Reports</span>
          <span style={{ fontSize: 12, color: "#aaa", marginRight: 6 }}>{reports.length}</span>
          <ChevronRight size={16} color="var(--gray-3)" style={{ transform: showReports ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
        </button>

        {showReports && (
          <div>
            {reports.length === 0 ? (
              <p style={{ padding: "20px", fontSize: 13, color: "#aaa", textAlign: "center" }}>No reports yet</p>
            ) : reports.map(r => {
              const age = daysOld(r.created_at);
              const isExpired = age >= 30;
              const isAging   = age >= 20 && age < 30;
              return (
              <div key={r.id} style={{ borderBottom: "1px solid #f8f8f8" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer" }}
                  onClick={() => navigate(`/pet/${r.id}`)}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "#f1f5f9", position:"relative" }}>
                    {r.photo_url ? <img src={r.photo_url} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isExpired ? 0.4 : 1 }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><MapPin size={16} color="#ddd" /></div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2, flexWrap:"wrap" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: r.status === "lost" ? "#fff0ef" : "#f0fff4", color: r.status === "lost" ? "#ff3b30" : "#34c759" }}>{r.status}</span>
                      {!r.approved && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: "#fffbeb", color: "#f59e0b" }}>Pending</span>}
                      {isExpired && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: "#fff0ef", color: "#ef4444", display:"flex", alignItems:"center", gap:3 }}><AlertTriangle size={9} />Expired</span>}
                      {isAging   && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: "#fffbeb", color: "#f59e0b", display:"flex", alignItems:"center", gap:3 }}><Clock size={9} />Aging</span>}
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: isExpired ? "#aaa" : "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name || r.species}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                      <Clock size={10} color="#c4c4c4" />
                      <span style={{ fontSize: 11, color: "#c4c4c4" }}>{age}d old</span>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteReport(r.id); }} style={{ width: 32, height: 32, borderRadius: 10, background: "#fff0ef", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Trash2 size={14} color="#ff3b30" strokeWidth={1.8} />
                  </button>
                </div>
                {/* Expiry warning bar */}
                {(isExpired || isAging) && (
                  <div style={{ margin:"0 12px 12px", background: isExpired ? "#fff0ef" : "#fffbeb", borderRadius:12, padding:"10px 14px", display:"flex", alignItems:"center", gap:10 }}>
                    <AlertTriangle size={14} color={isExpired ? "#ef4444" : "#f59e0b"} strokeWidth={2} />
                    <p style={{ flex:1, fontSize:12, color: isExpired ? "#ef4444" : "#b45309", lineHeight:1.5 }}>
                      {isExpired
                        ? `This report is ${age} days old and may be less visible. Delete and repost to bring it back to the top.`
                        : `This report is ${age} days old. Consider refreshing it soon to keep it visible.`}
                    </p>
                    <button onClick={e => { e.stopPropagation(); navigate("/report"); }}
                      style={{ display:"flex", alignItems:"center", gap:4, padding:"6px 10px", background: isExpired ? "#ef4444" : "#f59e0b", borderRadius:10, flexShrink:0 }}>
                      <RefreshCw size={12} color="#fff" strokeWidth={2.5} />
                      <span style={{ fontSize:11, fontWeight:700, color:"#fff" }}>Repost</span>
                    </button>
                  </div>
                )}
              </div>
            )})}
            <button onClick={() => navigate("/report")} style={{ width: "100%", padding: "14px", fontSize: 13, fontWeight: 700, color: "#111", textAlign: "center", borderTop: "1px solid #f0f0f0" }}>
              + New Report
            </button>
          </div>
        )}
      </div>

      {/* Legal */}
      <div style={{ background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", marginBottom: 14 }}>
        {[
          { icon: <ScrollText size={16} color="#555" strokeWidth={1.8} />, label: "Terms of Service", path: "/terms" },
          { icon: <Shield size={16} color="#555" strokeWidth={1.8} />, label: "Privacy Policy", path: "/terms" },
        ].map((item, i) => (
          <button key={i} onClick={() => navigate(item.path)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderBottom: i === 0 ? "1px solid #f5f5f7" : "none" }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {item.icon}
            </div>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: "#000", textAlign: "left" }}>{item.label}</span>
            <ChevronRight size={16} color="#ccc" />
          </button>
        ))}
      </div>

      {/* Sign out + Delete */}
      <div style={{ background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)", marginBottom: 14 }}>
        <button onClick={() => supabase.auth.signOut().then(() => { setUser(null); setReports([]); })}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", borderBottom: "1px solid #f5f5f7" }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "#fff0ef", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LogOut size={16} color="#ff3b30" strokeWidth={1.8} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#ff3b30" }}>Sign Out</span>
        </button>
        <button onClick={() => setShowDeleteModal(true)}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "18px 20px" }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "#f5f5f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <UserX size={16} color="#aaa" strokeWidth={1.8} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#aaa" }}>Delete Account</span>
        </button>
      </div>

      </div>{/* end padding wrapper */}

      {/* Edit Profile sheet */}
      {showEditSheet && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10001, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end" }}
          onClick={() => setShowEditSheet(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: "100%", background: "#fff", borderRadius: "28px 28px 0 0", padding: "28px 24px 32px", maxHeight: "80dvh", overflowY: "auto", paddingBottom: "calc(32px + env(safe-area-inset-bottom))" }}>

            {/* Handle + header */}
            <div style={{ width: 36, height: 4, background: "#e0e0e0", borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>Edit Profile</p>
              <button onClick={() => setShowEditSheet(false)} style={{ width: 32, height: 32, borderRadius: 10, background: "#f5f5f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={16} color="#555" />
              </button>
            </div>

            {/* Profile photo */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
              <label style={{ position: "relative", cursor: "pointer" }}>
                <div style={{ width: 90, height: 90, borderRadius: 45, background: "#111", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, color: "#fff" }}>
                  {avatarUrl
                    ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : (editName || user.email || "U")[0].toUpperCase()}
                </div>
                {/* Camera badge */}
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, background: "#111", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {uploadingPhoto
                    ? <div style={{ width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    : <Camera size={14} color="#fff" strokeWidth={2} />}
                </div>
                <input type="file" accept="image/*" style={{ display: "none" }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
              </label>
              <p style={{ fontSize: 12, color: "#aaa", marginTop: 10 }}>Tap to change photo</p>
            </div>

            {/* Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#aaa", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>Display Name</label>
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="Your name"
                style={{ width: "100%", padding: "14px 16px", background: "#f5f5f7", borderRadius: 14, fontSize: 15, color: "#111", border: "none", outline: "none" }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#aaa", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>Email Address</label>
              <input
                type="email"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: "100%", padding: "14px 16px", background: "#f5f5f7", borderRadius: 14, fontSize: 15, color: "#111", border: "none", outline: "none" }}
              />
              {editEmail !== user.email && (
                <p style={{ fontSize: 12, color: "#f59e0b", marginTop: 6, paddingLeft: 4 }}>⚠ You'll need to confirm the new email address</p>
              )}
            </div>

            {editSuccess && (
              <p style={{ fontSize: 13, color: editSuccess.startsWith("Error") ? "#ef4444" : "#34c759", background: editSuccess.startsWith("Error") ? "#fff0ef" : "#f0fff4", borderRadius: 12, padding: "12px 16px", textAlign: "center", marginBottom: 16 }}>
                {editSuccess}
              </p>
            )}

            <button onClick={saveProfile} disabled={savingProfile}
              style={{ width: "100%", padding: "17px", background: "#111", color: "#fff", borderRadius: 16, fontSize: 16, fontWeight: 700, opacity: savingProfile ? 0.5 : 1, transition: "opacity 0.2s" }}>
              {savingProfile ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Delete account confirmation modal */}
      {showDeleteModal && (
        <>
          {/* Backdrop */}
          <div style={{ position: "fixed", inset: 0, zIndex: 10001, background: "rgba(0,0,0,0.6)" }}
            onClick={() => setShowDeleteModal(false)} />

          {/* Sheet — arch style matching hamburger menu */}
          <div style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10002,
            background: "#fff", borderRadius: 0, padding: "24px 24px calc(100px + env(safe-area-inset-bottom))",
            boxShadow: "none", animation: "slideUp 0.3s cubic-bezier(0.32,0.72,0,1)",
          }}>
            {/* Arch SVG */}
            <svg style={{ position: "absolute", bottom: "calc(100% - 1px)", left: 0, width: "100%", display: "block" }}
              viewBox="0 0 390 34" preserveAspectRatio="none" aria-hidden="true">
              <path fill="white" d="M0 34 C0 15 15 0 34 0 H136 C159 0 175 28 195 28 C215 28 231 0 254 0 H356 C375 0 390 15 390 34 Z"/>
            </svg>

            {/* Floating close button in arch */}
            <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}
              style={{
                position: "absolute", top: -53, left: "50%", transform: "translateX(-50%)",
                width: 44, height: 44, border: 0, borderRadius: "50%", background: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 700, lineHeight: 1, color: "#111",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)", cursor: "pointer",
              }}>
              ×
            </button>

            {/* Title */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 14, background: "#fff0ef", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AlertTriangle size={18} color="#ef4444" strokeWidth={2} />
              </div>
              <p style={{ fontSize: 18, fontWeight: 800, color: "#111" }}>Delete Account</p>
            </div>

            <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, marginBottom: 20 }}>
              This will permanently delete your account and all your reports. This action <strong>cannot be undone</strong>.
            </p>

            <label style={{ fontSize: 12, fontWeight: 700, color: "#aaa", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>
              Type DELETE to confirm
            </label>
            <input
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              style={{ width: "100%", padding: "14px 16px", background: "#f5f5f7", borderRadius: 14, fontSize: 15, color: "#111", border: "none", outline: "none", marginBottom: 16, boxSizing: "border-box" }}
            />

            <button
              onClick={deleteAccount}
              disabled={deleteConfirm !== "DELETE" || deleting}
              style={{ width: "100%", padding: "16px", background: "#ef4444", color: "#fff", borderRadius: 16, fontSize: 15, fontWeight: 700, opacity: (deleteConfirm !== "DELETE" || deleting) ? 0.4 : 1, transition: "opacity 0.2s" }}>
              {deleting ? "Deleting…" : "Permanently Delete My Account"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
