import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { PetPost } from "../lib/supabase";
import { ArrowLeft, MapPin, Heart, MessageCircle, Lock, Share2, CheckCircle, Navigation, RefreshCw, X, Map as MapIcon, Keyboard } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41],
});

function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: e => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}
function MapFlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo([lat, lng], 15, { animate: true, duration: 1 }); }, [lat, lng]);
  return null;
}

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<PetPost | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [contacting, setContacting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reuniting, setReuniting] = useState(false);
  const [photoIdx, setPhotoIdx] = useState<number | null>(null);

  // Update location sheet state
  const [showLocationSheet, setShowLocationSheet] = useState(false);
  const [locMapMode, setLocMapMode] = useState(true);
  const [newLocation, setNewLocation] = useState("");
  const [newLat, setNewLat] = useState<number | null>(null);
  const [newLng, setNewLng] = useState<number | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [savingLocation, setSavingLocation] = useState(false);

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

  // ── Map pick handler ──
  async function handleMapPick(lat: number, lng: number) {
    setGeocoding(true);
    setNewLat(lat); setNewLng(lng);
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      const addr = data.address;
      const loc  = [addr.road, addr.neighbourhood || addr.suburb, addr.city || addr.town || addr.village].filter(Boolean).join(", ");
      setNewLocation(loc || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } catch {
      setNewLocation(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    }
    setGeocoding(false);
  }

  async function searchLocation() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery + ", New York")}&format=json&limit=1`);
      const data = await res.json();
      if (data[0]) setFlyTarget({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
    } catch {}
    setSearching(false);
  }

  async function saveLocation() {
    if (!post || !newLocation.trim()) return;
    setSavingLocation(true);
    const updates: Record<string, unknown> = { last_seen_address: newLocation };
    if (newLat && newLng) { updates.lat = newLat; updates.lng = newLng; }
    const { error } = await supabase.from("pet_posts").update(updates).eq("id", post.id).eq("user_id", userId!);
    if (!error) {
      setPost(p => p ? { ...p, last_seen_address: newLocation, lat: newLat ?? p.lat, lng: newLng ?? p.lng } : p);
      setShowLocationSheet(false);
    } else {
      alert("Failed to update: " + error.message);
    }
    setSavingLocation(false);
  }

  function openLocationSheet() {
    setNewLocation(post?.last_seen_address || "");
    setNewLat(post?.lat ?? null);
    setNewLng(post?.lng ?? null);
    setSearchQuery("");
    setFlyTarget(null);
    setShowLocationSheet(true);
  }

  const photos = post ? [post.photo_url, post.photo_url_2, post.photo_url_3, post.photo_url_4].filter(Boolean) as string[] : [];

  async function handleContact() {
    if (!userId) { navigate("/login"); return; }
    if (!post) return;
    setContacting(true);
    try {
      const { data: existing } = await supabase.from("conversations").select("id").eq("pet_post_id", post.id).eq("sender_id", userId).maybeSingle();
      if (existing) { navigate(`/chat/${existing.id}`); return; }
      const { data: newConv } = await supabase.from("conversations").insert({ pet_post_id: post.id, sender_id: userId, receiver_id: post.user_id || userId }).select("id").single();
      if (newConv) navigate(`/chat/${newConv.id}`);
    } finally {
      setContacting(false);
    }
  }

  if (!post) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>Loading…</div>;

  const isLost = post.status === "lost";
  const isOwner = userId === post.user_id;
  const mapCenter: [number, number] = newLat && newLng ? [newLat, newLng] : (post.lat && post.lng ? [post.lat, post.lng] : [40.7128, -74.0060]);

  return (
    <div style={{ minHeight: "100dvh", background: "#fff" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

      {/* Hero photo */}
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

      {/* Content card */}
      <div style={{ background: "#fff", borderRadius: "30px 30px 0 0", marginTop: -40, padding: "12px 24px 100px", minHeight: 500, position: "relative", zIndex: 1, boxShadow: "0 -8px 24px rgba(0,0,0,0.12)" }}>
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

        {/* Last seen location — owner can tap to update */}
        <div
          onClick={isOwner ? openLocationSheet : undefined}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 16px", background: isOwner ? "#f0f9ff" : "var(--gray-1)", borderRadius: 16, marginBottom: 16, cursor: isOwner ? "pointer" : "default", border: isOwner ? "1.5px solid #bae6fd" : "1.5px solid transparent" }}
        >
          <MapPin size={16} color={isOwner ? "#0369a1" : "var(--gray-4)"} />
          <p style={{ fontSize: 14, color: "#000", fontWeight: 500, flex: 1 }}>{post.last_seen_address}</p>
          {isOwner && <span style={{ fontSize: 11, fontWeight: 700, color: "#0369a1", flexShrink: 0 }}>Update</span>}
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

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {userId !== post.user_id && (
            <button onClick={handleContact} disabled={contacting}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "17px 20px", background: "#111", borderRadius: 18, color: "#fff", cursor: "pointer", border: "none" }}>
              <MessageCircle size={20} strokeWidth={1.8} />
              <span style={{ flex: 1, fontSize: 15, fontWeight: 700, textAlign: "left" }}>
                {contacting ? "Opening chat…" : `Message about ${post.name || post.species}`}
              </span>
            </button>
          )}

          {isOwner && post.status === "lost" && (
            <button onClick={markReunited} disabled={reuniting}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "17px 20px", background: "#f0fff4", border: "1.5px solid #34c759", borderRadius: 18, color: "#34c759", cursor: "pointer" }}>
              <CheckCircle size={20} strokeWidth={1.8} />
              <span style={{ flex: 1, fontSize: 15, fontWeight: 700, textAlign: "left" }}>
                {reuniting ? "Updating…" : "Mark as Reunited"}
              </span>
            </button>
          )}

          {!userId && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", background: "#fafafa", borderRadius: 14, border: "1px solid #f0f0f0" }}>
              <Lock size={14} color="#aaa" strokeWidth={1.8} />
              <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>
                You'll need to <strong style={{ color: "#111" }}>sign in</strong> to send a message.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Photo lightbox */}
      {photoIdx !== null && photos.length > 0 && (
        <div onClick={() => setPhotoIdx(null)} style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.95)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={photos[photoIdx]} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} onClick={e => e.stopPropagation()} />
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

      {/* ── Update Location Bottom Sheet ── */}
      {showLocationSheet && (
        <>
          {/* Backdrop */}
          <div onClick={() => setShowLocationSheet(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200 }} />

          {/* Sheet */}
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 201, background: "#fff", borderRadius: "24px 24px 0 0", padding: "0 0 32px", animation: "slideUp 0.3s ease", maxHeight: "90dvh", overflowY: "auto" }}>
            {/* Handle + header */}
            <div style={{ padding: "12px 20px 16px", borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#111" }}>Update last seen location</h3>
                <button onClick={() => setShowLocationSheet(false)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <X size={20} color="#aaa" />
                </button>
              </div>
            </div>

            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Mode toggle */}
              <div style={{ display: "flex", background: "#f0f0f0", borderRadius: 14, padding: 4, gap: 4 }}>
                <button onClick={() => setLocMapMode(false)}
                  style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: !locMapMode ? "#fff" : "transparent", color: !locMapMode ? "#111" : "#888", boxShadow: !locMapMode ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}>
                  <Keyboard size={14} /> Type address
                </button>
                <button onClick={() => setLocMapMode(true)}
                  style={{ flex: 1, padding: "9px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: locMapMode ? "#fff" : "transparent", color: locMapMode ? "#111" : "#888", boxShadow: locMapMode ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}>
                  <MapIcon size={14} /> Pick on map
                </button>
              </div>

              {locMapMode ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {/* Search */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="text" placeholder="Search zip code or address…" value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && searchLocation()}
                      style={{ flex: 1, padding: "12px 14px", background: "#f5f5f7", borderRadius: 12, fontSize: 14, color: "#111", border: "none", outline: "none" }} />
                    <button onClick={searchLocation} disabled={searching}
                      style={{ padding: "12px 16px", background: "#111", borderRadius: 12, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, color: "#fff", fontSize: 13, fontWeight: 600 }}>
                      {searching ? <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : <MapPin size={14} />} Go
                    </button>
                  </div>
                  {/* Map */}
                  <div style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid #e5e7eb" }}>
                    <MapContainer center={mapCenter} zoom={14} style={{ height: 240, width: "100%" }} zoomControl={false}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="" />
                      <MapClickHandler onPick={handleMapPick} />
                      {flyTarget && <MapFlyTo lat={flyTarget.lat} lng={flyTarget.lng} />}
                      {newLat && newLng && <Marker position={[newLat, newLng]} icon={markerIcon} />}
                    </MapContainer>
                    <div style={{ padding: "10px 14px", background: "#f8faff", display: "flex", alignItems: "center", gap: 8 }}>
                      {geocoding
                        ? <><RefreshCw size={13} color="#aaa" style={{ animation: "spin 1s linear infinite" }} /><span style={{ fontSize: 12, color: "#aaa" }}>Getting address…</span></>
                        : newLocation
                          ? <><MapPin size={13} color="#16a34a" /><span style={{ fontSize: 12, color: "#444", flex: 1 }}>{newLocation}</span></>
                          : <span style={{ fontSize: 12, color: "#aaa" }}>Tap map to drop a pin</span>
                      }
                    </div>
                  </div>
                </div>
              ) : (
                /* Text input mode */
                <div style={{ position: "relative" }}>
                  <MapPin size={18} color="#aaa" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
                  <input type="text" value={newLocation} onChange={e => { setNewLocation(e.target.value); setNewLat(null); setNewLng(null); }}
                    placeholder="Neighborhood, street, or landmark…"
                    style={{ width: "100%", padding: "16px 52px 16px 46px", background: "#f5f5f7", borderRadius: 16, fontSize: 15, color: "#111", border: "none", outline: "none", boxSizing: "border-box" }} />
                  <button onClick={() => {
                    navigator.geolocation.getCurrentPosition(async pos => {
                      const { latitude: lat, longitude: lng } = pos.coords;
                      setNewLat(lat); setNewLng(lng);
                      try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
                        const data = await res.json();
                        const addr = data.address;
                        setNewLocation([addr.road, addr.neighbourhood || addr.suburb, addr.city || addr.town].filter(Boolean).join(", ") || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                      } catch { setNewLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`); }
                    });
                  }} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: 12, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }}>
                    <Navigation size={16} color="#fff" strokeWidth={2} />
                  </button>
                </div>
              )}

              {/* Save button */}
              <button onClick={saveLocation} disabled={savingLocation || !newLocation.trim()}
                style={{ width: "100%", padding: "16px", background: newLocation.trim() ? "#111" : "#e2e8f0", color: newLocation.trim() ? "#fff" : "#aaa", borderRadius: 16, fontSize: 15, fontWeight: 700, border: "none", cursor: newLocation.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {savingLocation ? <><RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> Saving…</> : <><MapPin size={16} /> Save location</>}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
