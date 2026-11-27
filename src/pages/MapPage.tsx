import { useEffect, useRef, useState } from "react";
import { useTheme } from "../lib/themeContext";
import { useNavigate } from "react-router-dom";
import { Search, X, SlidersHorizontal, Check, LocateFixed, Sun, Moon } from "lucide-react";
import AppHeader from "../components/AppHeader";
import { supabase } from "../lib/supabase";
import type { PetPost } from "../lib/supabase";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const NYC = [40.700, -73.900] as [number, number];

function makePinIcon(color: string) {
  return L.divIcon({
    className: "",
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -44],
    html: `<div style="position:relative;width:32px;height:40px;">
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:36px;height:36px;border-radius:50%;background:${color};opacity:0.2;animation:ping 1.5s ease-out infinite;"></div>
      <svg viewBox="0 0 32 40" style="position:absolute;inset:0;width:32px;height:40px;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.3))">
        <path d="M16 2C9.4 2 4 7.4 4 14c0 9.5 12 24 12 24s12-14.5 12-24C28 7.4 22.6 2 16 2z" fill="${color}"/>
        <circle cx="16" cy="14" r="5" fill="white" opacity="0.9"/>
      </svg>
    </div>`,
  });
}

export default function MapPage() {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [posts, setPosts] = useState<PetPost[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [selected, setSelected] = useState<PetPost | null>(null);
  const [search, setSearch] = useState("");
  const [geocoding, setGeocoding] = useState(false);
  const [areaName, setAreaName] = useState("");
  const [showMenu, _setShowMenu] = useState(false);
  const setShowMenu = (v: boolean) => { _setShowMenu(v); setMenuOpen(v); };
  const [radius, setRadius] = useState<number>(0); // 0 = no filter
  const [showRadiusMenu, setShowRadiusMenu] = useState(false);
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "lost" | "found">("all");
  const tileLayer = useRef<L.TileLayer | null>(null);
  const { setIsDark, setMenuOpen } = useTheme();

  const TILES = {
    dark:  "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=cb880819-d09f-4838-8fa3-7699c1548cf0",
    light: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=cb880819-d09f-4838-8fa3-7699c1548cf0",
  };

  function toggleMapStyle() {
    const map = mapInstance.current;
    if (!map) return;
    const next = !darkMode;
    setDarkMode(next);
    setIsDark(next);
    if (tileLayer.current) map.removeLayer(tileLayer.current);
    tileLayer.current = L.tileLayer(next ? TILES.dark : TILES.light, {
      attribution: '© <a href="https://stadiamaps.com/">Stadia Maps</a>',
      maxZoom: 20,
    }).addTo(map);
    const container = map.getContainer();
    container.style.background = next ? "#242f3e" : "#f0ece8";
  }

  function goToMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        mapInstance.current?.flyTo([lat, lng], 14, { animate: true, duration: 1 });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }

  const RADIUS_OPTIONS = [
    { label: "Any distance", value: 0 },
    { label: "1 mile", value: 1 },
    { label: "5 miles", value: 5 },
    { label: "10 miles", value: 10 },
    { label: "25 miles", value: 25 },
    { label: "50 miles", value: 50 },
    { label: "100 miles", value: 100 },
  ];

  useEffect(() => {
    supabase.from("pet_posts").select("*").eq("approved", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setPosts(data as PetPost[]); });
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, { center: NYC, zoom: 10, zoomControl: false });
    tileLayer.current = L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=cb880819-d09f-4838-8fa3-7699c1548cf0", {
      attribution: '© <a href="https://stadiamaps.com/">Stadia Maps</a>',
      maxZoom: 20,
    }).addTo(map);
    L.control.zoom({ position: "bottomleft" }).addTo(map);
    mapInstance.current = map;
    setMapReady(true);
    return () => { map.remove(); mapInstance.current = null; setMapReady(false); };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    map.eachLayer(layer => { if (layer instanceof L.Marker) map.removeLayer(layer); });
    const filtered = posts.filter(p => {
      const textMatch = !search || /^\d{5}$/.test(search.trim()) || `${p.name} ${p.species} ${p.last_seen_address}`.toLowerCase().includes(search.toLowerCase());
      const radiusMatch = !radius || !searchCenter || !p.lat || !p.lng ? true : haversine(searchCenter[0], searchCenter[1], p.lat, p.lng) <= radius;
      const statusMatch = statusFilter === "all" || p.status === statusFilter;
      return textMatch && radiusMatch && statusMatch;
    });
    filtered.forEach(post => {
      if (!post.lat || !post.lng) return;
      L.marker([post.lat, post.lng], { icon: makePinIcon(post.status === "lost" ? "#ff3b30" : "#34c759") })
        .addTo(map).on("click", () => setSelected(post));
    });
  }, [posts, search, radius, searchCenter, mapReady, statusFilter]);

  async function handleSearch(value: string) {
    setSearch(value);
    if (!value) { setAreaName(""); return; }

    if (/^\d{5}$/.test(value.trim())) {
      setGeocoding(true);
      setAreaName("");
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?postalcode=${value.trim()}&countrycodes=us&format=json&limit=1&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        if (data[0] && mapInstance.current) {
          const center: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          setSearchCenter(center);
          mapInstance.current.flyTo(center, 14, { animate: true, duration: 1 });

          // Build area name: "Floral Park, NY"
          const addr = data[0].address;
          const neighborhood = addr.suburb || addr.village || addr.town || addr.city_district || addr.neighbourhood || "";
          const city = addr.city || addr.town || addr.village || "";
          const state = addr.state_code || addr.state || "";
          const place = neighborhood || city;
          setAreaName(place ? `📍 ${place.toUpperCase()}, ${state}` : `📍 ${data[0].display_name.split(",")[0].toUpperCase()}, ${state}`);
        } else {
          setAreaName("⚠️ Zip code not found");
        }
      } catch {
        setAreaName("⚠️ Could not look up zip code");
      }
      setGeocoding(false);
    } else {
      setAreaName("");
    }
  }

  function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 3958.8; // miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  const timeAgo = (d: string) => {
    const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000);
    if (h < 1) return "Just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", background: "#fff", overflow: "hidden" }}>

      {/* ── Header ── */}
      <AppHeader onMenuOpen={() => setShowMenu(true)} />

      <div style={{ background: "#fff", padding: "0 20px 16px", flexShrink: 0 }}>
        {/* Search bar + settings button row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, position: "relative" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "var(--gray-1,#f5f5f5)", borderRadius: 14, padding: "12px 16px" }}>
            {geocoding
              ? <div style={{ width: 16, height: 16, border: "2px solid #e2e8f0", borderTopColor: "#1c314e", borderRadius: "50%", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
              : <Search size={16} color="#9ca3af" />
            }
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by name, breed or zip code…"
              style={{ flex: 1, fontSize: 14, color: "#000" }}
            />
            {search && <button onClick={() => { setSearch(""); setSearchCenter(null); setAreaName(""); }} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={16} color="#9ca3af" /></button>}
          </div>

          {/* Black settings button */}
          <button
            onClick={() => setShowRadiusMenu(v => !v)}
            style={{
              width: 46, height: 46, borderRadius: 14,
              background: radius > 0 ? "#1c314e" : "#111",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              border: radius > 0 ? "2px solid #34c759" : "none",
              cursor: "pointer",
            }}
          >
            <SlidersHorizontal size={18} color="#fff" />
          </button>

          {/* Radius dropdown */}
          {showRadiusMenu && (
            <div style={{
              position: "absolute", top: 56, right: 0, zIndex: 1500,
              background: "#fff", borderRadius: 20, padding: "8px 0",
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)", minWidth: 180,
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: 1, padding: "8px 18px 4px", textTransform: "uppercase" }}>Search radius</p>
              {RADIUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setRadius(opt.value); setShowRadiusMenu(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 18px", background: "none", border: "none", cursor: "pointer",
                    fontSize: 14, fontWeight: radius === opt.value ? 700 : 500,
                    color: radius === opt.value ? "#1c314e" : "#333",
                  }}
                >
                  {opt.label}
                  {radius === opt.value && <Check size={14} color="#34c759" strokeWidth={3} />}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Tap-outside backdrop to close radius menu */}
      {showRadiusMenu && (
        <div onClick={() => setShowRadiusMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 1400 }} />
      )}

      {/* ── Map container with rounded left & right edges ── */}
      <div style={{
        flex: 1,
        margin: "0 0 0 0",
        borderRadius: "30px 30px 0 0",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.08)",
        marginBottom: 0,
      }}>
        <div ref={mapRef} className={showMenu ? "menu-open" : ""} style={{ width: "100%", height: "100%" }} />

        {/* Map controls — bottom left stack */}
        <div style={{ position: "absolute", bottom: 150, left: 16, zIndex: 1000, display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Dark/Light toggle */}
          <button onClick={toggleMapStyle} style={{
            width: 44, height: 44, borderRadius: 22,
            background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "none", cursor: "pointer",
          }}>
            {darkMode ? <Sun size={18} color="#1c314e" strokeWidth={2} /> : <Moon size={18} color="#1c314e" strokeWidth={2} />}
          </button>

          {/* GPS button */}
          <button onClick={goToMyLocation} style={{
            width: 44, height: 44, borderRadius: 22,
            background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "none", cursor: "pointer",
          }}>
            {locating
              ? <div style={{ width: 18, height: 18, border: "2.5px solid #e2e8f0", borderTopColor: "#1c314e", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              : <LocateFixed size={18} color="#1c314e" strokeWidth={2} />
            }
          </button>
        </div>

        {/* Status filter toggles — top right of map */}
        <div style={{ position: "absolute", top: 16, right: 16, zIndex: 1000, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 6, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", borderRadius: 24, padding: 4, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
            {([
              { key: "all",   label: "All",   dot: null },
              { key: "lost",  label: "Lost",  dot: "#ff3b30" },
              { key: "found", label: "Found", dot: "#34c759" },
            ] as { key: "all"|"lost"|"found"; label: string; dot: string|null }[]).map(({ key, label, dot }) => (
              <button key={key} onClick={() => setStatusFilter(key)}
                style={{ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s",
                  background: statusFilter === key ? "#111" : "transparent",
                  color: statusFilter === key ? "#fff" : "#555",
                }}>
                {dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, display: "inline-block", flexShrink: 0 }} />}
                {label}
                {key !== "all" && <span style={{ fontSize: 10, opacity: 0.75 }}>({posts.filter(p => p.status === key).length})</span>}
              </button>
            ))}
          </div>

          {/* Area name + radius pill */}
          {areaName && (
            <div style={{ padding: "7px 14px", borderRadius: 20, background: "rgba(28,49,78,0.92)", backdropFilter: "blur(8px)", boxShadow: "0 2px 12px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: 0.3 }}>
                {areaName}{radius > 0 ? ` · ${radius}mi` : ""}
              </span>
            </div>
          )}
        </div>

        {/* Selected pet card */}
        {selected && (
          <div style={{ position: "absolute", bottom: 110, left: 16, right: 16, zIndex: 20, background: "white", borderRadius: 24, padding: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.2)", display: "flex", gap: 14, alignItems: "center" }}>
            {selected.photo_url
              ? <img src={selected.photo_url} style={{ width: 72, height: 72, borderRadius: 16, objectFit: "cover", flexShrink: 0 }} />
              : <div style={{ width: 72, height: 72, borderRadius: 16, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>🐾</div>
            }
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: selected.status === "lost" ? "#fff0ef" : "#f0fff4", color: selected.status === "lost" ? "#ff3b30" : "#34c759" }}>
                  {selected.status === "lost" ? "Lost" : "Found"}
                </span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>{timeAgo(selected.created_at)}</span>
              </div>
              <p style={{ fontSize: 16, fontWeight: 800, color: "#000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {selected.name || selected.species}
              </p>
              <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {selected.last_seen_address}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => navigate(`/pet/${selected.id}`)} style={{ padding: "10px 16px", background: "#111", borderRadius: 14, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                View
              </button>
              <button onClick={() => setSelected(null)} style={{ padding: "10px 16px", background: "#f1f5f9", borderRadius: 14, color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Menu handled globally by GlobalMenu in App.tsx */}

      <style>{`
        @keyframes ping { 0% { transform:translate(-50%,-50%) scale(1); opacity:0.4; } 100% { transform:translate(-50%,-50%) scale(2.5); opacity:0; } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(100%) } to { transform:translateY(0) } }
        .leaflet-bottom.leaflet-left { bottom: unset !important; top: 40% !important; left: 16px !important; z-index: 1000 !important; }
        .leaflet-control-zoom { border-radius: 22px !important; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.15) !important; border: none !important; }
        .leaflet-control-zoom a { width: 44px !important; height: 44px !important; line-height: 44px !important; font-size: 20px !important; color: #1c314e !important; background: #fff !important; border: none !important; }
        .leaflet-control-zoom-in { border-bottom: 1px solid #eee !important; }
      `}</style>
    </div>
  );
}
