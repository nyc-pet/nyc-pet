import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, MapPin, Clock, Bookmark, X } from "lucide-react";
import AppHeader from "../components/AppHeader";
import { supabase } from "../lib/supabase";
import type { PetPost } from "../lib/supabase";

const FILTERS = ["All", "Lost", "Found"];

function timeAgo(d: string) {
  const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 3958.8; // miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function distLabel(miles: number) {
  if (miles < 0.1) return "Nearby";
  if (miles < 1) return `${(miles * 5280 / 100 | 0) * 100} ft`;
  return `${miles.toFixed(1)} mi`;
}

export default function Discover() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PetPost[]>([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [zipLat, setZipLat] = useState<number | null>(null);
  const [zipLng, setZipLng] = useState<number | null>(null);
  const [zipLabel, setZipLabel] = useState("");
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    supabase.from("pet_posts").select("*").eq("approved", true).order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setPosts(data as PetPost[]); setLoading(false); });
    navigator.geolocation?.getCurrentPosition(pos => {
      setUserLat(pos.coords.latitude);
      setUserLng(pos.coords.longitude);
    });
  }, []);

  // Geocode zip codes
  useEffect(() => {
    const zip = search.trim();
    if (!/^\d{5}$/.test(zip)) {
      setZipLat(null); setZipLng(null); setZipLabel("");
      return;
    }
    setGeocoding(true);
    fetch(`https://nominatim.openstreetmap.org/search?format=json&postalcode=${zip}&countrycodes=us&limit=1`, {
      headers: { "Accept-Language": "en" }
    })
      .then(r => r.json())
      .then(data => {
        if (data[0]) {
          setZipLat(parseFloat(data[0].lat));
          setZipLng(parseFloat(data[0].lon));
          setZipLabel(data[0].display_name.split(",")[0] + ", " + zip);
        } else {
          setZipLat(null); setZipLng(null); setZipLabel("ZIP not found");
        }
      })
      .finally(() => setGeocoding(false));
  }, [search]);

  const ZIP_RADIUS_MI = 10;

  const filtered = posts.filter(p => {
    if (filter !== "All" && p.status !== filter.toLowerCase()) return false;
    // Zip code mode — filter by distance
    if (/^\d{5}$/.test(search.trim())) {
      if (zipLat && zipLng && p.lat && p.lng) {
        return haversine(zipLat, zipLng, p.lat, p.lng) <= ZIP_RADIUS_MI;
      }
      return false;
    }
    if (search && !`${p.name} ${p.species} ${p.breed} ${p.last_seen_address}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const hero = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="page" style={{ background: "var(--bg)", display: "flex", flexDirection: "column", height: "100dvh", overflow: "hidden" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Sticky header + search/filter */}
      <div style={{ flexShrink: 0, background: "var(--white)" }}>
      <AppHeader />

      <div style={{ padding: "0 20px", background: "var(--white)" }}>
        {/* Search */}
        <div style={{ display: "flex", gap: 10, marginBottom: zipLabel ? 10 : 20 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "var(--gray-1)", borderRadius: 14, padding: "12px 16px" }}>
            {geocoding
              ? <div style={{ width: 16, height: 16, border: "2px solid #e2e8f0", borderTopColor: "#111", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
              : <Search size={16} color="var(--gray-4)" />
            }
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, breed or zip code…"
              style={{ flex: 1, fontSize: 14, color: "#000" }}
            />
            {search && (
              <button onClick={() => { setSearch(""); setZipLat(null); setZipLng(null); setZipLabel(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <X size={15} color="#aaa" />
              </button>
            )}
          </div>
          <button style={{ width: 46, height: 46, borderRadius: 14, background: "#111", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "none", cursor: "pointer" }}>
            <SlidersHorizontal size={18} color="#fff" />
          </button>
        </div>

        {/* Zip code result pill */}
        {zipLabel && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0f4ff", borderRadius: 20, padding: "5px 12px" }}>
              <MapPin size={12} color="#4f6ef7" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#4f6ef7" }}>
                {zipLabel === "ZIP not found" ? "ZIP not found" : `Within ${ZIP_RADIUS_MI} mi of ${zipLabel}`}
              </span>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, paddingBottom: 16 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 18px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 600,
              background: filter === f ? "#111" : "var(--gray-1)",
              color: filter === f ? "#fff" : "var(--gray-4)",
              transition: "all 0.2s",
            }}>{f}</button>
          ))}
          <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 600, color: "var(--gray-4)", alignSelf: "center" }}>See All</span>
        </div>
      </div>
      </div>{/* end sticky header */}

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 0" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--gray-4)" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--gray-3)" }}>No pets found</p>
            <p style={{ fontSize: 13, color: "var(--gray-3)", marginTop: 8 }}>Try adjusting your search</p>
          </div>
        ) : (
          <>
            {/* Section header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 17, fontWeight: 800, color: "#000" }}>Recent Reports</p>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-4)" }}>{filtered.length} pets</span>
            </div>

            {/* Hero card */}
            {hero && <HeroCard post={hero} onClick={() => navigate(`/pet/${hero.id}`)} userLat={userLat} userLng={userLng} />}

            {/* List */}
            {rest.length > 0 && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "24px 0 16px" }}>
                  <p style={{ fontSize: 17, fontWeight: 800, color: "#000" }}>All Reports</p>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--gray-4)" }}>See All</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 100 }}>
                  {rest.map(p => <ListCard key={p.id} post={p} onClick={() => navigate(`/pet/${p.id}`)} userLat={userLat} userLng={userLng} />)}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function HeroCard({ post, onClick, userLat, userLng }: { post: PetPost; onClick: () => void; userLat: number | null; userLng: number | null }) {
  const isLost = post.status === "lost";
  const dist = (userLat && userLng && post.lat && post.lng) ? haversine(userLat, userLng, post.lat, post.lng) : null;
  return (
    <div onClick={onClick} style={{ borderRadius: 24, overflow: "hidden", position: "relative", height: 320, cursor: "pointer", marginBottom: 4 }}>
      {/* Photo */}
      {post.photo_url
        ? <img src={post.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #e2e8f0, #f1f5f9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>🐾</div>
      }

      {/* Bookmark */}
      <button onClick={e => e.stopPropagation()} style={{ position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: 18, background: "rgba(255,255,255,0.9)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}>
        <Bookmark size={16} color="#111" />
      </button>

      {/* Bottom info pill */}
      <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", borderRadius: 20, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        {/* Date badge */}
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "#111", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 9, color: "#fff", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {new Date(post.created_at).toLocaleString("en", { month: "short" })}
          </span>
          <span style={{ fontSize: 15, color: "#fff", fontWeight: 800, lineHeight: 1 }}>
            {new Date(post.created_at).getDate()}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {post.name || post.species}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
            <MapPin size={11} color="var(--gray-4)" />
            <p style={{ fontSize: 12, color: "var(--gray-4)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {post.last_seen_address}
            </p>
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
          <div style={{ padding: "5px 12px", borderRadius: 20, background: isLost ? "#fff0ef" : "#f0fff4" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: isLost ? "var(--lost)" : "var(--found)" }}>
              {isLost ? "Lost" : "Found"}
            </span>
          </div>
          {dist !== null && (
            <div style={{ padding:"3px 10px", borderRadius:20, background:"#f1f5f9", display:"flex", alignItems:"center", gap:4 }}>
              <MapPin size={10} color="#94a3b8" />
              <span style={{ fontSize:11, fontWeight:700, color:"#64748b" }}>{distLabel(dist)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ListCard({ post, onClick, userLat, userLng }: { post: PetPost; onClick: () => void; userLat: number | null; userLng: number | null }) {
  const isLost = post.status === "lost";
  const dist = (userLat && userLng && post.lat && post.lng) ? haversine(userLat, userLng, post.lat, post.lng) : null;
  return (
    <div onClick={onClick} style={{ display: "flex", gap: 14, background: "var(--white)", borderRadius: 20, overflow: "hidden", cursor: "pointer", boxShadow: "var(--shadow-sm)" }}>
      <div style={{ width: 96, height: 100, flexShrink: 0, background: "var(--gray-1)", position: "relative" }}>
        {post.photo_url
          ? <img src={post.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🐾</div>
        }
      </div>
      <div style={{ flex: 1, padding: "14px 14px 14px 0", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: isLost ? "#fff0ef" : "#f0fff4", color: isLost ? "var(--lost)" : "var(--found)" }}>
            {isLost ? "Lost" : "Found"}
          </span>
        </div>
        <p style={{ fontSize: 15, fontWeight: 700, color: "#000" }}>{post.name || post.species}</p>
        <p style={{ fontSize: 12, color: "var(--gray-4)", marginTop: 2 }}>{post.breed || post.species}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
          <MapPin size={11} color="var(--gray-3)" />
          <p style={{ fontSize: 11, color: "var(--gray-4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {post.last_seen_address}
          </p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:4, flexWrap:"wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Clock size={11} color="var(--gray-3)" />
            <p style={{ fontSize: 11, color: "var(--gray-3)" }}>{timeAgo(post.created_at)}</p>
          </div>
          {dist !== null && (
            <div style={{ display:"flex", alignItems:"center", gap:3 }}>
              <MapPin size={10} color="#94a3b8" />
              <span style={{ fontSize:11, fontWeight:700, color:"#64748b" }}>{distLabel(dist)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
