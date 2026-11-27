import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Camera, MapPin, Navigation,
  Edit2, Pencil, SquarePen, CheckCircle, HeartCrack, Heart, X, Plus,
  Dog, Cat, Bird, Fish, Rabbit, HelpCircle, MessageCircle, Phone, Lock, Mail,
  Share2, PartyPopper, RefreshCw, Clock, Bell, Home, Map as MapIcon, Keyboard,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});
import { supabase } from "../lib/supabase";

/* ─── Types ─────────────────────────────────────────────── */
type Status  = "lost" | "found";
type SizeOpt = "Tiny" | "Small" | "Medium" | "Large";
type StepKey = "status" | "species" | "name" | "appearance" | "photos" | "location" | "contact" | "preview";

interface Draft {
  status:   Status | null;
  species:  string | null;
  name:     string;
  breed:    string;
  color:    string;
  size:     SizeOpt | null;
  photos:   (File | null)[];
  previews: (string | null)[];
  location:        string;
  borough:         string;
  date:            string;
  notes:           string;
  phone:           string;
  phoneEnabled:    boolean;
  email:           string;
  emailEnabled:    boolean;
  facebook:         string;
  facebookEnabled:  boolean;
  instagram:        string;
  instagramEnabled: boolean;
  tiktok:           string;
  tiktokEnabled:    boolean;
  twitter:          string;
  twitterEnabled:   boolean;
  contactName:      string;
  lat:              number | null;
  lng:              number | null;
}

const BLANK: Draft = {
  status: null, species: null, name: "", breed: "", color: "",
  size: null, photos: [null,null,null,null], previews: [null,null,null,null],
  location: "", borough: "", date: new Date().toISOString().split("T")[0], notes: "",
  phone: "", phoneEnabled: false,
  email: "", emailEnabled: false,
  facebook: "", facebookEnabled: false,
  instagram: "", instagramEnabled: false,
  tiktok: "", tiktokEnabled: false,
  twitter: "", twitterEnabled: false,
  contactName: "",
  lat: null, lng: null,
};

const STEPS: StepKey[] = ["status","species","name","appearance","photos","location","contact","preview"];

const SPECIES_LIST = [
  { label: "Dog",    Icon: Dog,         bg: "#fef3c7", accent: "#f59e0b" },
  { label: "Cat",    Icon: Cat,         bg: "#f0fff4", accent: "#34c759" },
  { label: "Bird",   Icon: Bird,        bg: "#f0f7ff", accent: "#1c314e" },
  { label: "Rabbit", Icon: Rabbit,      bg: "#fdf4ff", accent: "#a855f7" },
  { label: "Fish",   Icon: Fish,        bg: "#ecfeff", accent: "#06b6d4" },
  { label: "Other",  Icon: HelpCircle,  bg: "#f8faff", accent: "#64748b" },
];

const COLORS = ["Black","White","Brown","Golden","Gray","Orange","Cream","Multi"];
const SIZES: SizeOpt[] = ["Tiny","Small","Medium","Large"];

/* ─── Component ─────────────────────────────────────────── */
export default function Report() {
  const navigate = useNavigate();
  const fileRef  = useRef<HTMLInputElement>(null);
  const slotRef  = useRef<number>(0);

  const [draft, setDraft]           = useState<Draft>(BLANK);
  const [stepIdx, setStepIdx]       = useState(0);
  const [animKey, setAnimKey]       = useState(0);
  const [direction, setDirection]   = useState<"fwd"|"bwd">("fwd");
  const [submitting, setSubmitting] = useState(false);
  const [editTarget, setEditTarget] = useState<StepKey | null>(null);

  // Auth
  const [authLoading, setAuthLoading]   = useState(true);
  const [isLoggedIn, setIsLoggedIn]     = useState(false);

  // Draft persistence
  const [showResumeBanner, setShowResumeBanner] = useState(false);

  // Success
  const [submitted, setSubmitted]           = useState(false);
  const [submittedDraft, setSubmittedDraft] = useState<Draft | null>(null);
  const [submittedPostId, setSubmittedPostId] = useState<string | null>(null);

  /* ── Auth check ── */
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
      setAuthLoading(false);
      if (user) {
        const profileName = user.user_metadata?.full_name || user.user_metadata?.name || "";
        if (profileName) setDraft(d => ({ ...d, contactName: d.contactName || profileName }));
      }
    });
  }, []);

  /* ── Restore draft from localStorage (after auth confirmed) ── */
  useEffect(() => {
    if (!isLoggedIn) return;
    try {
      const saved = localStorage.getItem("nyc-pet-draft");
      if (!saved) return;
      const { _step, ...savedDraft } = JSON.parse(saved);
      if (savedDraft.status || savedDraft.name) {
        setDraft(d => ({ ...d, ...savedDraft }));
        if (_step) setStepIdx(_step);
        setShowResumeBanner(true);
        setTimeout(() => setShowResumeBanner(false), 4000);
      }
    } catch {}
  }, [isLoggedIn]);

  /* ── Save draft to localStorage on every change ── */
  const [draftSaved, setDraftSaved] = useState(false);
  const draftSavedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isLoggedIn) return;
    const { photos, previews, ...saveable } = draft;
    localStorage.setItem("nyc-pet-draft", JSON.stringify({ ...saveable, _step: stepIdx }));
    setDraftSaved(true);
    if (draftSavedTimer.current) clearTimeout(draftSavedTimer.current);
    draftSavedTimer.current = setTimeout(() => setDraftSaved(false), 2500);
  }, [draft, stepIdx, isLoggedIn]);

  const step = STEPS[stepIdx];

  function go(delta: number) {
    setDirection(delta > 0 ? "fwd" : "bwd");
    setAnimKey(k => k + 1);
    setStepIdx(i => Math.max(0, Math.min(STEPS.length - 1, i + delta)));
  }

  function jumpTo(s: StepKey) {
    const idx = STEPS.indexOf(s);
    setDirection(idx < stepIdx ? "bwd" : "fwd");
    setAnimKey(k => k + 1);
    setStepIdx(idx);
    setEditTarget(null);
  }

  function pickPhoto(slot: number) {
    slotRef.current = slot;
    fileRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const slot = slotRef.current;
    setDraft(d => {
      const photos   = [...d.photos];
      const previews = [...d.previews];
      photos[slot]   = file;
      previews[slot] = url;
      return { ...d, photos, previews };
    });
    e.target.value = "";
  }

  function removePhoto(slot: number) {
    setDraft(d => {
      const photos   = [...d.photos];
      const previews = [...d.previews];
      photos[slot]   = null;
      previews[slot] = null;
      return { ...d, photos, previews };
    });
  }

  async function getLocation() {
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      try {
        const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await res.json();
        const addr = data.address;
        const loc  = [addr.neighbourhood || addr.suburb, addr.city || addr.town || addr.village].filter(Boolean).join(", ");
        setDraft(d => ({ ...d, location: loc || `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng }));
      } catch {
        setDraft(d => ({ ...d, location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng }));
      }
    });
  }

  async function submit() {
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/login"); return; }

    // Upload photos
    const urls: (string|null)[] = [null,null,null,null];
    for (let i = 0; i < 4; i++) {
      const file = draft.photos[i];
      if (!file) continue;
      const path = `${user.id}/${Date.now()}_${i}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage.from("pet-photos").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("pet-photos").getPublicUrl(path);
        urls[i] = data.publicUrl;
      }
    }

    // Use pinned lat/lng from map picker or GPS; fall back to geocoding the address
    let lat = draft.lat ?? 40.7128;
    let lng = draft.lng ?? -74.0060;
    if (!draft.lat || !draft.lng) {
      try {
        const geo = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(draft.location + ", New York")}&format=json&limit=1`);
        const geoData = await geo.json();
        if (geoData[0]) { lat = parseFloat(geoData[0].lat); lng = parseFloat(geoData[0].lon); }
      } catch {}
    }

    const { data: inserted, error: insertError } = await supabase.from("pet_posts").insert({
      user_id:           user.id,
      contact_name:      draft.contactName.trim() || "Anonymous",
      contact_email:     "",
      status:            draft.status,
      species:           draft.species?.toLowerCase(),
      name:              draft.name,
      breed:             draft.breed || null,
      color:             draft.color || null,
      description:       draft.notes || null,
      last_seen_address: draft.location,
      borough:           draft.borough,
      last_seen_date:    draft.date || new Date().toISOString().split("T")[0],
      lat,
      lng,
      photo_url:         urls[0],
      photo_url_2:       urls[1],
      photo_url_3:       urls[2],
      photo_url_4:       urls[3],
    }).select("id").single();

    if (insertError) {
      alert("Failed to submit report: " + insertError.message);
      setSubmitting(false);
      return;
    }

    // Clear saved draft
    localStorage.removeItem("nyc-pet-draft");

    setSubmitting(false);
    setSubmittedDraft({ ...draft });
    setSubmittedPostId(inserted?.id ?? null);
    setSubmitted(true);
  }

  /* ── step validation ── */
  function canContinue(): boolean {
    if (step === "status")     return !!draft.status;
    if (step === "species")    return !!draft.species;
    if (step === "name")       return draft.name.trim().length > 0;
    if (step === "appearance") return true; // optional
    if (step === "photos")     return true; // optional
    if (step === "location")   return draft.location.trim().length > 0 && draft.borough.trim().length > 0 && draft.borough !== "__other__";
    return true;
  }

  /* ── hero gradient per step ── */
  const heroGrad: Record<StepKey, string> = {
    status:     "linear-gradient(160deg,#1c1c1e 0%,#2c2c2e 100%)",
    species:    "linear-gradient(160deg,#1a3a2a 0%,#2d6a4f 100%)",
    name:       "linear-gradient(160deg,#1c314e 0%,#2d4f78 100%)",
    appearance: "linear-gradient(160deg,#3d1a4e 0%,#6b2d8a 100%)",
    photos:     "linear-gradient(160deg,#1a1a2e 0%,#16213e 100%)",
    location:   "linear-gradient(160deg,#0f3460 0%,#1a4a7a 100%)",
    contact:    "linear-gradient(160deg,#1a1a1a 0%,#2d2d2d 100%)",
    preview:    "linear-gradient(160deg,#111 0%,#333 100%)",
  };

  const heroTitle: Record<StepKey, string> = {
    status:     draft.status === "found" ? "You found a pet!" : "Lost a pet?",
    species:    "What kind of pet?",
    name:       `What's your ${draft.species?.toLowerCase() || "pet"}'s name?`,
    appearance: `Describe ${draft.name || "your pet"}`,
    photos:     `Add photos of ${draft.name || "your pet"}`,
    location:   draft.status === "lost" ? `Where was ${draft.name || "your pet"} last seen?` : `Where did you find ${draft.name || "this pet"}?`,
    contact:    "How can people reach you?",
    preview:    "Review your report",
  };

  const heroSub: Record<StepKey, string> = {
    status:     "Tell us what happened",
    species:    "Select the animal type",
    name:       "What do they respond to?",
    appearance: "Help people recognize them",
    photos:     "Clear photos increase chances",
    location:   "Be as specific as possible",
    contact:    "Your info is always kept private",
    preview:    "Make sure everything looks right",
  };

  /* ─── Early returns ────────────────────────────────────── */
  if (authLoading) return (
    <div style={{ minHeight:"100dvh", display:"flex", alignItems:"center", justifyContent:"center", background:"#fff" }}>
      <div style={{ width:40, height:40, borderRadius:20, border:"3px solid #f0f0f0", borderTopColor:"#111", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!isLoggedIn) return <AuthGate onNavigate={navigate} />;

  if (submitted && submittedDraft) return (
    <SuccessScreen draft={submittedDraft} postId={submittedPostId} onMap={() => navigate("/")} onView={() => submittedPostId ? navigate(`/pet/${submittedPostId}`) : navigate("/")} />
  );

  /* ─── Render ───────────────────────────────────────────── */
  return (
    <div style={{ position: "relative", minHeight: "100dvh", overflow: "hidden", background: "#f8faff" }}>
      <style>{`
        @keyframes slideFwd {
          from { opacity: 0; transform: translateX(32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideBwd {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .step-enter-fwd { animation: slideFwd 0.28s cubic-bezier(.4,0,.2,1) both; }
        .step-enter-bwd { animation: slideBwd 0.28s cubic-bezier(.4,0,.2,1) both; }
      `}</style>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={onFile} />

      {/* Hero header */}
      <div style={{ background: heroGrad[step], position: "relative", display:"flex", flexDirection:"column", justifyContent:"flex-end", minHeight: (step === "species" || step === "name") ? 280 : 220, paddingBottom: 44 }}>

        {/* Back button */}
        <button onClick={() => stepIdx === 0 ? navigate("/") : go(-1)}
          style={{ position:"absolute", top:52, left:20, width:38, height:38, borderRadius:19, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", border:"none", cursor:"pointer" }}>
          <ArrowLeft size={18} color="#fff" />
        </button>

        {/* Close × — goes home */}
        <button onClick={() => navigate("/")}
          style={{ position:"absolute", top:52, right:20, width:38, height:38, borderRadius:19, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", border:"none", cursor:"pointer" }}>
          <X size={18} color="#fff" />
        </button>

        {/* Arch SVG at bottom of hero — merges into content area */}
        <svg
          style={{ position:"absolute", bottom:-1, left:0, width:"100%", display:"block" }}
          viewBox="0 0 390 34" preserveAspectRatio="none" aria-hidden="true"
        >
          <path fill="#fff" d="M0 34 C0 15 15 0 34 0 H136 C159 0 175 28 195 28 C215 28 231 0 254 0 H356 C375 0 390 15 390 34 Z"/>
        </svg>

        {/* Step dots */}
        <div style={{ display:"flex", justifyContent:"center", gap:6, marginBottom:16 }}>
          {STEPS.slice(0,-1).map((_,i) => (
            <div key={i} style={{ width: i === stepIdx ? 20 : 6, height:6, borderRadius:3, background: i <= stepIdx ? "#fff" : "rgba(255,255,255,0.3)", transition:"all 0.3s" }} />
          ))}
        </div>

        <p style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.6)", textTransform:"uppercase", letterSpacing:1.5, marginBottom:8, textAlign:"center" }}>
          {step === "preview" ? "Almost done" : `Step ${stepIdx + 1} of ${STEPS.length - 1}`}
        </p>
        <h1 style={{ fontSize:28, fontWeight:800, color:"#fff", textAlign:"center", lineHeight:1.2 }}>{heroTitle[step]}</h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.65)", textAlign:"center", marginTop:8 }}>{heroSub[step]}</p>
      </div>

      {/* White sheet */}
      <div style={{ background:"#fff", borderRadius:0, marginTop:-1, minHeight:"calc(100dvh - 180px)", position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", justifyContent:"center", paddingTop:12, marginBottom:4 }}>
          <div style={{ width:36, height:4, borderRadius:2, background:"#e2e8f0" }} />
        </div>

        {/* Draft saved toast */}
        <div style={{
          position: "fixed", top: 16, left: "50%", transform: `translateX(-50%) translateY(${draftSaved ? 0 : -80}px)`,
          background: "#111", color: "#fff", borderRadius: 30, padding: "8px 18px",
          fontSize: 13, fontWeight: 600, zIndex: 9999,
          display: "flex", alignItems: "center", gap: 7,
          transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          pointerEvents: "none", whiteSpace: "nowrap",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        }}>
          <span style={{ fontSize: 14 }}>✓</span> Draft saved
        </div>

        {/* Draft restored banner */}
        {showResumeBanner && (
          <div style={{ margin:"0 24px 4px", background:"#f0fff4", borderRadius:14, padding:"11px 16px", display:"flex", alignItems:"center", gap:10 }}>
            <RefreshCw size={14} color="#16a34a" strokeWidth={2} />
            <p style={{ fontSize:13, fontWeight:600, color:"#16a34a" }}>Draft restored — pick up where you left off</p>
          </div>
        )}

        {/* Animated step content */}
        <div key={animKey} className={direction === "fwd" ? "step-enter-fwd" : "step-enter-bwd"}
          style={{ padding:"20px 24px 120px", minHeight:"calc(100dvh - 260px)", display:"flex", flexDirection:"column", justifyContent: (step === "name" || step === "location" || step === "species" || step === "contact") ? "center" : "flex-start" }}>
          {step === "status"     && <StatusStep     draft={draft} setDraft={setDraft} onSelect={() => go(1)} />}
          {step === "species"    && <SpeciesStep    draft={draft} setDraft={setDraft} onSelect={() => go(1)} />}
          {step === "name"       && <NameStep       draft={draft} setDraft={setDraft} />}
          {step === "appearance" && <AppearanceStep draft={draft} setDraft={setDraft} />}
          {step === "photos"     && <PhotosStep     draft={draft} pickPhoto={pickPhoto} removePhoto={removePhoto} />}
          {step === "location"   && <LocationStep   draft={draft} setDraft={setDraft} getLocation={getLocation} />}
          {step === "contact"    && <ContactStep    draft={draft} setDraft={setDraft} />}
          {step === "preview"    && <PreviewStep    draft={draft} jumpTo={jumpTo} />}
        </div>
      </div>

      {/* Bottom continue button (hidden on status/species since they auto-advance, and on preview) */}
      {step !== "status" && step !== "species" && step !== "preview" && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, padding:"16px 24px 32px", background:"linear-gradient(0deg,#fff 60%,transparent)", zIndex:10 }}>
          <button onClick={() => go(1)} disabled={!canContinue()}
            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 6px 6px 28px", background:"#111", borderRadius:60, opacity: canContinue() ? 1 : 0.4, transition:"opacity 0.2s" }}>
            <span style={{ fontSize:16, fontWeight:700, color:"#fff" }}>Continue</span>
            <div style={{ width:48, height:48, borderRadius:24, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <ArrowRight size={20} color="#111" strokeWidth={2.5} />
            </div>
          </button>
        </div>
      )}

      {/* Preview submit button */}
      {step === "preview" && (
        <div style={{ position:"fixed", bottom:0, left:0, right:0, padding:"16px 24px 32px", background:"linear-gradient(0deg,#fff 60%,transparent)", zIndex:10 }}>
          <button onClick={submit} disabled={submitting}
            style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 6px 6px 28px", background: draft.status === "found" ? "#16a34a" : "#dc2626", borderRadius:60, opacity: submitting ? 0.7 : 1 }}>
            <span style={{ fontSize:16, fontWeight:700, color:"#fff" }}>{submitting ? "Submitting…" : "Submit Report"}</span>
            <div style={{ width:48, height:48, borderRadius:24, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <CheckCircle size={22} color={draft.status === "found" ? "#16a34a" : "#dc2626"} strokeWidth={2.5} />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Auth Gate ─────────────────────────────────────────── */
function AuthGate({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div style={{ minHeight:"100dvh", background:"#fff", display:"flex", flexDirection:"column" }}>
      {/* Hero */}
      <div style={{ background:"linear-gradient(160deg,#1c314e 0%,#2d4f78 100%)", padding:"72px 24px 56px", textAlign:"center", position:"relative" }}>
        <button onClick={() => onNavigate("/")}
          style={{ position:"absolute", top:52, left:20, width:38, height:38, borderRadius:19, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <ArrowLeft size={18} color="#fff" />
        </button>
        <img src="/logo.png" alt="nyc.pet" style={{ height:52, filter:"brightness(0) invert(1)", display:"block", margin:"0 auto 20px" }} />
        <h1 style={{ fontSize:28, fontWeight:800, color:"#fff", lineHeight:1.2, marginBottom:10 }}>Sign in to report a pet</h1>
        <p style={{ fontSize:14, color:"rgba(255,255,255,0.7)", lineHeight:1.7 }}>Create a free account so pet owners can reach you through our secure messaging.</p>
      </div>

      {/* White card */}
      <div style={{ background:"#fff", borderRadius:"28px 28px 0 0", marginTop:-24, flex:1, padding:"32px 24px 48px" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:28 }}>
          <div style={{ width:36, height:4, borderRadius:2, background:"#e2e8f0" }} />
        </div>

        {/* Why section */}
        {[
          { icon:<MessageCircle size={18} color="#1c314e" strokeWidth={1.8}/>, text:"People contact you through nyc.pet's secure in-app messaging" },
          { icon:<Lock size={18} color="#1c314e" strokeWidth={1.8}/>, text:"Your phone and email are never shared publicly" },
          { icon:<CheckCircle size={18} color="#1c314e" strokeWidth={1.8}/>, text:"Manage your reports and mark pets as reunited" },
        ].map((r,i) => (
          <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:20 }}>
            <div style={{ width:38, height:38, borderRadius:12, background:"#f0f4ff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {r.icon}
            </div>
            <p style={{ fontSize:14, color:"#444", lineHeight:1.7, paddingTop:8 }}>{r.text}</p>
          </div>
        ))}

        <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:12 }}>
          <button onClick={() => onNavigate("/login")}
            style={{ width:"100%", padding:"17px", background:"#111", color:"#fff", borderRadius:16, fontSize:16, fontWeight:700 }}>
            Sign In
          </button>
          <button onClick={() => onNavigate("/login?mode=signup")}
            style={{ width:"100%", padding:"17px", background:"#f5f5f7", color:"#111", borderRadius:16, fontSize:16, fontWeight:700 }}>
            Create Free Account
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Success Screen ─────────────────────────────────────── */
function SuccessScreen({ draft, postId, onMap, onView }: { draft: Draft; postId: string | null; onMap: () => void; onView: () => void }) {
  return (
    <div style={{ minHeight:"100dvh", background:"#fff", display:"flex", flexDirection:"column" }}>
      <style>{`@keyframes popIn { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }`}</style>

      {/* Dark hero with arch curve */}
      <div style={{ background:"linear-gradient(160deg,#1a3a2a 0%,#2d6a4f 100%)", position:"relative", minHeight:220, display:"flex", flexDirection:"column", justifyContent:"flex-end", paddingBottom:44 }}>
        {/* Back button */}
        <button onClick={onMap} style={{ position:"absolute", top:52, left:20, width:40, height:40, borderRadius:20, background:"rgba(255,255,255,0.15)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <ArrowLeft size={18} color="#fff" strokeWidth={2} />
        </button>

        {/* Hero text */}
        <div style={{ padding:"0 24px 0", textAlign:"center" }}>
          <p style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.6)", letterSpacing:1, textTransform:"uppercase", marginBottom:6 }}>NYC Pet</p>
          <h2 style={{ fontSize:26, fontWeight:900, color:"#fff", lineHeight:1.2 }}>Report submitted</h2>
        </div>

        {/* Arch SVG */}
        <svg style={{ position:"absolute", bottom:-1, left:0, width:"100%", display:"block" }}
          viewBox="0 0 390 34" preserveAspectRatio="none" aria-hidden="true">
          <path fill="#fff" d="M0 34 C0 15 15 0 34 0 H136 C159 0 175 28 195 28 C215 28 231 0 254 0 H356 C375 0 390 15 390 34 Z"/>
        </svg>
      </div>

      {/* Content */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"32px 24px 48px", textAlign:"center" }}>

        {/* Icon */}
        <div style={{ width:88, height:88, borderRadius:44, background:"#f0fff4", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20, animation:"popIn 0.5s cubic-bezier(.4,0,.2,1) both", marginTop:-12 }}>
          <CheckCircle size={44} color="#16a34a" strokeWidth={1.5} />
        </div>

        <p style={{ fontSize:15, color:"#666", lineHeight:1.7, maxWidth:300, marginBottom:28 }}>
          {`${draft.name || "Your pet"}'s report is under review. You'll be notified here once it's approved and live.`}
        </p>

        {/* Status cards */}
        <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:10, marginBottom:32 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", background:"#fffbeb", borderRadius:16, border:"1px solid #fde68a" }}>
            <div style={{ width:36, height:36, borderRadius:12, background:"#fef3c7", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Clock size={18} color="#b45309" strokeWidth={1.8} />
            </div>
            <div style={{ textAlign:"left" }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#92400e" }}>Pending approval</p>
              <p style={{ fontSize:12, color:"#b45309" }}>Usually reviewed within a few hours</p>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", background:"#f0f9ff", borderRadius:16, border:"1px solid #bae6fd" }}>
            <div style={{ width:36, height:36, borderRadius:12, background:"#e0f2fe", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Bell size={18} color="#0369a1" strokeWidth={1.8} />
            </div>
            <div style={{ textAlign:"left" }}>
              <p style={{ fontSize:13, fontWeight:700, color:"#0c4a6e" }}>You'll be notified</p>
              <p style={{ fontSize:12, color:"#0369a1" }}>Check the bell icon when your post goes live</p>
            </div>
          </div>
        </div>

        {/* Action */}
        <button onClick={onMap}
          style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:10, padding:"16px", background:"#111", color:"#fff", borderRadius:16, fontSize:15, fontWeight:700, border:"none", cursor:"pointer" }}>
          <Home size={18} strokeWidth={2} /> Back to Home
        </button>
      </div>
    </div>
  );
}

/* ─── Step: Status ──────────────────────────────────────── */
function StatusStep({ draft, setDraft, onSelect }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>>; onSelect: () => void }) {
  function pick(s: Status) {
    setDraft(d => ({ ...d, status: s }));
    setTimeout(onSelect, 160);
  }
  return (
    <div style={{ position:"relative", display:"flex", flexDirection:"column", gap:14, paddingTop:12 }}>

      {/* Decorative corner image */}
      <img
        src="/dog-cat-right-corner.png"
        alt=""
        style={{ position:"fixed", bottom:0, right:0, width:110, pointerEvents:"none", zIndex:0, opacity:0.92 }}
      />

      {/* Comfort / encouragement message */}
      <div style={{ background:"#f8faff", borderRadius:20, padding:"18px 20px", marginBottom:4 }}>
        {draft.status === "found" ? (
          <>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <Heart size={16} color="#60a5fa" fill="#bfdbfe" strokeWidth={2} />
              <p style={{ fontSize:15, fontWeight:700, color:"#111" }}>Thank you for caring.</p>
            </div>
            <p style={{ fontSize:14, color:"#666", lineHeight:1.7 }}>
              Finding a lost pet and taking action is an incredible act of kindness. You could be reuniting a family today — let's get this posted so the owner can find you.
            </p>
          </>
        ) : (
          <>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
              <Heart size={16} color="#dc2626" fill="#dc2626" strokeWidth={2} />
              <p style={{ fontSize:15, fontWeight:700, color:"#111" }}>We're so sorry — we're here to help.</p>
            </div>
            <p style={{ fontSize:14, color:"#666", lineHeight:1.7 }}>
              We know how frightening it is when a pet goes missing. Take a breath — you're doing the right thing by acting quickly. Our community is ready to help bring them home.
            </p>
          </>
        )}
      </div>

      {[
        { val:"lost"  as Status, label:"My pet is lost", sub:"I'm looking for my pet", icon:<HeartCrack size={28} color="#dc2626" fill="#fecaca" strokeWidth={2}/>, bg:"#fff5f5", border:"#fecaca", accent:"#dc2626" },
        { val:"found" as Status, label:"I found a pet",  sub:"I found someone else's pet", icon:<Heart size={28} color="#60a5fa" fill="#bfdbfe" strokeWidth={1.8}/>, bg:"#eff6ff", border:"#bfdbfe", accent:"#60a5fa" },
      ].map(o => (
        <button key={o.val} onClick={() => pick(o.val)}
          style={{ width:"100%", padding:"24px 20px", background: draft.status === o.val ? o.bg : "#f8faff", borderRadius:24, border:`2px solid ${draft.status === o.val ? o.border : "transparent"}`, display:"flex", alignItems:"center", gap:16, textAlign:"left", transition:"all 0.2s" }}>
          <div style={{ width:60, height:60, borderRadius:20, background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 8px rgba(0,0,0,0.08)", flexShrink:0 }}>
            {o.icon}
          </div>
          <div>
            <p style={{ fontSize:18, fontWeight:800, color:"#111", marginBottom:4 }}>{o.label}</p>
            <p style={{ fontSize:13, color:"#888" }}>{o.sub}</p>
          </div>
          {draft.status === o.val && (
            <div style={{ marginLeft:"auto", width:28, height:28, borderRadius:14, background:o.accent, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <CheckCircle size={16} color="#fff" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

/* ─── Step: Species ─────────────────────────────────────── */
function SpeciesStep({ draft, setDraft, onSelect }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>>; onSelect: () => void }) {
  function pick(label: string) {
    setDraft(d => ({ ...d, species: label }));
    setTimeout(onSelect, 160);
  }
  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, paddingTop:8 }}>
      {SPECIES_LIST.map(s => (
        <button key={s.label} onClick={() => pick(s.label)}
          style={{ aspectRatio:"1", background: draft.species === s.label ? s.bg : "#f8faff", borderRadius:24, border:`2px solid ${draft.species === s.label ? s.accent+"66" : "transparent"}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, transition:"all 0.2s" }}>
          <div style={{ width:52, height:52, borderRadius:18, background: draft.species === s.label ? s.accent+"22" : "#fff", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
            <s.Icon size={26} color={draft.species === s.label ? s.accent : "#aaa"} strokeWidth={1.8} />
          </div>
          <span style={{ fontSize:13, fontWeight:700, color: draft.species === s.label ? s.accent : "#555" }}>{s.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ─── Step: Name ────────────────────────────────────────── */
function NameStep({ draft, setDraft }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> }) {
  return (
    <div style={{ paddingTop:16 }}>
      <input
        autoFocus
        type="text"
        value={draft.name}
        onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
        placeholder={`e.g. Buddy, Luna, Max…`}
        style={{ width:"100%", fontSize:36, fontWeight:800, color:"#111", background:"transparent", border:"none", outline:"none", borderBottom:"3px solid #111", paddingBottom:16, fontFamily:"Fredoka, sans-serif", letterSpacing:0.5, textAlign:"center" }}
      />
    </div>
  );
}

/* ─── Step: Appearance ──────────────────────────────────── */
function AppearanceStep({ draft, setDraft }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24, paddingTop:8 }}>
      {/* Breed */}
      <div>
        <label style={{ fontSize:12, fontWeight:800, color:"#aaa", textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:10 }}>Breed <span style={{ fontWeight:400 }}>(optional)</span></label>
        <input type="text" value={draft.breed} onChange={e => setDraft(d => ({ ...d, breed: e.target.value }))} placeholder="e.g. Labrador, Siamese, Unknown…"
          style={{ width:"100%", padding:"16px 18px", background:"#f5f5f7", borderRadius:16, fontSize:16, color:"#111", border:"none", outline:"none" }} />
      </div>

      {/* Color */}
      <div>
        <label style={{ fontSize:12, fontWeight:800, color:"#aaa", textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:10 }}>Primary Color</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => setDraft(d => ({ ...d, color: c }))}
              style={{ padding:"10px 16px", borderRadius:30, background: draft.color === c ? "#111" : "#f5f5f7", color: draft.color === c ? "#fff" : "#555", fontSize:14, fontWeight:600, border:"none", transition:"all 0.15s" }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <label style={{ fontSize:12, fontWeight:800, color:"#aaa", textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:10 }}>Size</label>
        <div style={{ display:"flex", gap:10 }}>
          {SIZES.map(s => (
            <button key={s} onClick={() => setDraft(d => ({ ...d, size: s }))}
              style={{ flex:1, padding:"14px 8px", borderRadius:16, background: draft.size === s ? "#111" : "#f5f5f7", color: draft.size === s ? "#fff" : "#555", fontSize:14, fontWeight:700, border:"none", transition:"all 0.15s" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label style={{ fontSize:12, fontWeight:800, color:"#aaa", textTransform:"uppercase", letterSpacing:1, display:"block", marginBottom:10 }}>Extra Notes <span style={{ fontWeight:400 }}>(optional)</span></label>
        <textarea value={draft.notes} onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))} placeholder="Any distinguishing features, collar color, behavior…" rows={3}
          style={{ width:"100%", padding:"16px 18px", background:"#f5f5f7", borderRadius:16, fontSize:15, color:"#111", border:"none", outline:"none", resize:"none", fontFamily:"inherit" }} />
      </div>
    </div>
  );
}

/* ─── Step: Photos ──────────────────────────────────────── */
function PhotosStep({ draft, pickPhoto, removePhoto }: { draft: Draft; pickPhoto:(i:number)=>void; removePhoto:(i:number)=>void }) {
  return (
    <div style={{ paddingTop:8 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ position:"relative", aspectRatio:"1", borderRadius:20, overflow:"hidden", background:"#f5f5f7", cursor:"pointer" }} onClick={() => !draft.previews[i] && pickPhoto(i)}>
            {draft.previews[i] ? (
              <>
                <img src={draft.previews[i]!} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                <button onClick={e => { e.stopPropagation(); removePhoto(i); }}
                  style={{ position:"absolute", top:8, right:8, width:28, height:28, borderRadius:14, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <X size={14} color="#fff" />
                </button>
              </>
            ) : (
              <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:"#e2e8f0", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Camera size={20} color="#aaa" strokeWidth={1.8} />
                </div>
                <span style={{ fontSize:12, color:"#aaa", fontWeight:600 }}>Photo {i+1}{i===0?" *":""}</span>
              </div>
            )}
            {draft.previews[i] && (
              <div style={{ position:"absolute", bottom:8, left:8, background:"rgba(0,0,0,0.5)", borderRadius:8, padding:"3px 8px" }}>
                <span style={{ fontSize:11, color:"#fff", fontWeight:700 }}>{i+1}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <p style={{ fontSize:13, color:"#aaa", marginTop:14, textAlign:"center", lineHeight:1.6 }}>
        Clear, well-lit photos significantly increase the chance of reunion
      </p>
    </div>
  );
}

/* ─── Step: Location ────────────────────────────────────── */
/* ── Map click handler (must live inside MapContainer) ── */
function MapClickHandler({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: e => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

function LocationStep({ draft, setDraft, getLocation }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>>; getLocation: () => void }) {
  const [mapMode, setMapMode] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  async function handleMapPick(lat: number, lng: number) {
    setGeocoding(true);
    setDraft(d => ({ ...d, lat, lng }));
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const data = await res.json();
      const addr = data.address;
      const loc  = [addr.road, addr.neighbourhood || addr.suburb, addr.city || addr.town || addr.village].filter(Boolean).join(", ");
      // Auto-detect NYC borough
      const boroughMap: Record<string, string> = {
        "Manhattan": "Manhattan", "Brooklyn": "Brooklyn", "Queens": "Queens",
        "The Bronx": "The Bronx", "Bronx": "The Bronx", "Staten Island": "Staten Island",
      };
      const detectedBorough = Object.keys(boroughMap).find(k =>
        (addr.county || addr.city_district || addr.suburb || "").includes(k)
      );
      setDraft(d => ({
        ...d, lat, lng,
        location: loc || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        borough: detectedBorough ? boroughMap[detectedBorough] : d.borough,
      }));
    } catch {
      setDraft(d => ({ ...d, location: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }));
    }
    setGeocoding(false);
  }

  const center: [number, number] = draft.lat && draft.lng
    ? [draft.lat, draft.lng]
    : [40.7128, -74.0060]; // NYC default

  return (
    <div style={{ paddingTop:16, display:"flex", flexDirection:"column", gap:16 }}>
      {/* Mode toggle */}
      <div style={{ display:"flex", background:"#f0f0f0", borderRadius:14, padding:4, gap:4 }}>
        <button onClick={() => setMapMode(false)}
          style={{ flex:1, padding:"9px", borderRadius:10, border:"none", cursor:"pointer", fontWeight:600, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6, background: !mapMode ? "#fff" : "transparent", color: !mapMode ? "#111" : "#888", boxShadow: !mapMode ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition:"all 0.2s" }}>
          <Keyboard size={14} /> Type address
        </button>
        <button onClick={() => setMapMode(true)}
          style={{ flex:1, padding:"9px", borderRadius:10, border:"none", cursor:"pointer", fontWeight:600, fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6, background: mapMode ? "#fff" : "transparent", color: mapMode ? "#111" : "#888", boxShadow: mapMode ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition:"all 0.2s" }}>
          <MapIcon size={14} /> Pick on map
        </button>
      </div>

      {mapMode ? (
        /* ── Map picker ── */
        <div style={{ borderRadius:16, overflow:"hidden", border:"1.5px solid #e5e7eb" }}>
          <MapContainer center={center} zoom={13} style={{ height:280, width:"100%" }} zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="" />
            <MapClickHandler onPick={handleMapPick} />
            {draft.lat && draft.lng && <Marker position={[draft.lat, draft.lng]} icon={markerIcon} />}
          </MapContainer>
          <div style={{ padding:"10px 14px", background:"#f8faff", display:"flex", alignItems:"center", gap:8 }}>
            {geocoding
              ? <><RefreshCw size={13} color="#aaa" style={{ animation:"spin 1s linear infinite" }} /><span style={{ fontSize:12, color:"#aaa" }}>Getting address…</span></>
              : draft.location
                ? <><MapPin size={13} color="#16a34a" /><span style={{ fontSize:12, color:"#444", flex:1 }}>{draft.location}</span></>
                : <span style={{ fontSize:12, color:"#aaa" }}>Tap anywhere on the map to drop a pin</span>
            }
          </div>
        </div>
      ) : (
        /* ── Text input ── */
        <div style={{ position:"relative" }}>
          <MapPin size={18} color="#aaa" style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)" }} />
          <input
            autoFocus
            type="text"
            value={draft.location}
            onChange={e => setDraft(d => ({ ...d, location: e.target.value, lat: null, lng: null }))}
            placeholder="Neighborhood, street, or landmark…"
            style={{ width:"100%", padding:"16px 52px 16px 46px", background:"#f5f5f7", borderRadius:16, fontSize:15, color:"#111", border:"none", outline:"none" }}
          />
          <button onClick={getLocation} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", width:36, height:36, borderRadius:12, background:"#111", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Navigation size={16} color="#fff" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Borough picker */}
      {(() => {
        const BOROUGHS = ["Manhattan","Brooklyn","Queens","The Bronx","Staten Island"];
        const isOther = draft.borough !== "" && draft.borough !== "__other__" && !BOROUGHS.includes(draft.borough);
        const showOtherInput = isOther || draft.borough === "__other__";
        return (
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:"#555", marginBottom:8 }}>Borough</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom: showOtherInput ? 10 : 0 }}>
              {BOROUGHS.map(b => (
                <button key={b} onClick={() => setDraft(d => ({ ...d, borough: b }))}
                  style={{ padding:"9px 16px", borderRadius:30, fontSize:13, fontWeight:600, border:"none", cursor:"pointer",
                    background: draft.borough === b ? "#111" : "#f0f0f0",
                    color: draft.borough === b ? "#fff" : "#555",
                  }}>
                  {b}
                </button>
              ))}
              <button onClick={() => setDraft(d => ({ ...d, borough: "__other__" }))}
                style={{ padding:"9px 16px", borderRadius:30, fontSize:13, fontWeight:600, border:"none", cursor:"pointer",
                  background: showOtherInput ? "#111" : "#f0f0f0",
                  color: showOtherInput ? "#fff" : "#555",
                }}>
                Other
              </button>
            </div>
            {showOtherInput && (
              <input
                autoFocus
                type="text"
                placeholder="Type your borough or area…"
                value={isOther ? draft.borough : ""}
                onChange={e => setDraft(d => ({ ...d, borough: e.target.value.trim() ? e.target.value : "__other__" }))}
                style={{ width:"100%", padding:"14px 16px", background:"#f5f5f7", borderRadius:16, fontSize:15, color:"#111", border:"none", outline:"none", boxSizing:"border-box" }}
              />
            )}
          </div>
        );
      })()}

      {/* Date picker */}
      <div>
        <p style={{ fontSize:13, fontWeight:700, color:"#555", marginBottom:8 }}>Last seen date</p>
        <input
          type="date"
          value={draft.date}
          max={new Date().toISOString().split("T")[0]}
          onChange={e => setDraft(d => ({ ...d, date: e.target.value }))}
          style={{ width:"100%", padding:"14px 16px", background:"#f5f5f7", borderRadius:16, fontSize:15, color:"#111", border:"none", outline:"none", boxSizing:"border-box" }}
        />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize:13, color:"#aaa", lineHeight:1.6 }}>
        {mapMode ? "Tap the map to drop a pin exactly where the pet was last seen." : "Type an address, or tap the GPS button to use your current location."}
      </p>
    </div>
  );
}

/* ─── Social SVG icons ───────────────────────────────────── */
function FbIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1877f2">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.532-4.697 1.313 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.885v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}
function IgIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="url(#ig)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <defs>
        <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433"/>
          <stop offset="25%" stopColor="#e6683c"/>
          <stop offset="50%" stopColor="#dc2743"/>
          <stop offset="75%" stopColor="#cc2366"/>
          <stop offset="100%" stopColor="#bc1888"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="#dc2743" stroke="none"/>
    </svg>
  );
}
function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#000">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
function TikTokIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#000">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
    </svg>
  );
}

/* ─── Toggle Switch ──────────────────────────────────────── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{ width:48, height:28, borderRadius:14, background: on ? "#111" : "#e2e8f0", position:"relative", flexShrink:0, transition:"background 0.2s" }}>
      <div style={{ width:22, height:22, borderRadius:11, background:"#fff", position:"absolute", top:3, left: on ? 23 : 3, transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
    </button>
  );
}

/* ─── Step: Contact ─────────────────────────────────────── */
function ContactStep({ draft, setDraft }: { draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>> }) {
  const contacts = [
    {
      key: "messaging",
      icon: <MessageCircle size={20} color="#16a34a" strokeWidth={1.8} />,
      iconBg: "#f0fff4",
      label: "In-app messaging",
      sub: "Secure & private — always on",
      alwaysOn: true,
      enabled: true,
      value: "",
      placeholder: "",
      type: "text",
    },
    {
      key: "phone",
      icon: <Phone size={20} color="#555" strokeWidth={1.8} />,
      iconBg: "#f5f5f7",
      label: "Phone number",
      sub: "Only shown when you enable it",
      alwaysOn: false,
      enabled: draft.phoneEnabled,
      value: draft.phone,
      placeholder: "(212) 555-0100",
      type: "tel",
      onChange: (v: string) => setDraft(d => ({ ...d, phone: v })),
      onToggle: () => setDraft(d => ({ ...d, phoneEnabled: !d.phoneEnabled })),
    },
    {
      key: "email",
      icon: <Mail size={20} color="#555" strokeWidth={1.8} />,
      iconBg: "#f5f5f7",
      label: "Email address",
      sub: "Only shown when you enable it",
      alwaysOn: false,
      enabled: draft.emailEnabled,
      value: draft.email,
      placeholder: "you@example.com",
      type: "email",
      onChange: (v: string) => setDraft(d => ({ ...d, email: v })),
      onToggle: () => setDraft(d => ({ ...d, emailEnabled: !d.emailEnabled })),
    },
    {
      key: "facebook",
      icon: <FbIcon size={20} />,
      iconBg: "#eff6ff",
      label: "Facebook",
      sub: "Your profile username",
      alwaysOn: false,
      enabled: draft.facebookEnabled,
      value: draft.facebook,
      placeholder: "facebook.com/yourname",
      type: "text",
      onChange: (v: string) => setDraft(d => ({ ...d, facebook: v })),
      onToggle: () => setDraft(d => ({ ...d, facebookEnabled: !d.facebookEnabled })),
    },
    {
      key: "instagram",
      icon: <IgIcon size={20} />,
      iconBg: "#fff0f7",
      label: "Instagram",
      sub: "Your @username",
      alwaysOn: false,
      enabled: draft.instagramEnabled,
      value: draft.instagram,
      placeholder: "@yourhandle",
      type: "text",
      onChange: (v: string) => setDraft(d => ({ ...d, instagram: v })),
      onToggle: () => setDraft(d => ({ ...d, instagramEnabled: !d.instagramEnabled })),
    },
    {
      key: "tiktok",
      icon: <TikTokIcon size={20} />,
      iconBg: "#f0f0f0",
      label: "TikTok",
      sub: "Your @username",
      alwaysOn: false,
      enabled: draft.tiktokEnabled,
      value: draft.tiktok,
      placeholder: "@yourhandle",
      type: "text",
      onChange: (v: string) => setDraft(d => ({ ...d, tiktok: v })),
      onToggle: () => setDraft(d => ({ ...d, tiktokEnabled: !d.tiktokEnabled })),
    },
    {
      key: "twitter",
      icon: <XIcon size={20} />,
      iconBg: "#f5f5f5",
      label: "X (Twitter)",
      sub: "Your @username",
      alwaysOn: false,
      enabled: draft.twitterEnabled,
      value: draft.twitter,
      placeholder: "@yourhandle",
      type: "text",
      onChange: (v: string) => setDraft(d => ({ ...d, twitter: v })),
      onToggle: () => setDraft(d => ({ ...d, twitterEnabled: !d.twitterEnabled })),
    },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {/* Your Name */}
      <div style={{ background:"#f8faff", borderRadius:20, padding:"16px 18px", border:"1.5px solid #e2e8f0" }}>
        <p style={{ fontSize:13, fontWeight:700, color:"#111", marginBottom:8 }}>Your name</p>
        <input
          type="text"
          placeholder="Anonymous"
          value={draft.contactName}
          onChange={e => setDraft(d => ({ ...d, contactName: e.target.value }))}
          style={{ width:"100%", padding:"12px 14px", background:"#fff", borderRadius:12, fontSize:15, color:"#111", border:"1.5px solid #e2e8f0", outline:"none", boxSizing:"border-box" }}
        />
        <p style={{ fontSize:11, color:"#aaa", marginTop:6 }}>Shown on your post. Leave blank to stay anonymous.</p>
      </div>

      {/* Privacy note */}
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
        <Lock size={13} color="#aaa" strokeWidth={2} />
        <p style={{ fontSize:12, color:"#aaa", fontWeight:600 }}>Your contact info is never shared without your permission</p>
      </div>

      {contacts.map(c => (
        <div key={c.key} style={{ background:"#f8faff", borderRadius:20, padding:"16px 18px", border: c.enabled ? "1.5px solid #e2e8f0" : "1.5px solid transparent", transition:"border 0.2s" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:14, background: c.iconBg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {c.icon}
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:14, fontWeight:700, color:"#111" }}>{c.label}</p>
              <p style={{ fontSize:12, color:"#aaa" }}>{c.sub}</p>
            </div>
            {c.alwaysOn
              ? <div style={{ padding:"5px 10px", background:"#f0fff4", borderRadius:20 }}><span style={{ fontSize:11, fontWeight:700, color:"#16a34a" }}>ON</span></div>
              : <Toggle on={c.enabled} onToggle={c.onToggle!} />
            }
          </div>
          {c.enabled && !c.alwaysOn && (
            <input
              type={c.type}
              value={c.value}
              onChange={e => c.onChange?.(e.target.value)}
              placeholder={c.placeholder}
              style={{ width:"100%", marginTop:12, padding:"13px 16px", background:"#fff", borderRadius:14, fontSize:14, color:"#111", border:"1.5px solid #e2e8f0", outline:"none" }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Step: Preview ─────────────────────────────────────── */
function PreviewStep({ draft, jumpTo }: { draft: Draft; jumpTo: (s: StepKey) => void }) {
  const heroPhoto = draft.previews[0];

  return (
    <div style={{ paddingTop: 4 }}>

      {/* Hero photo */}
      <div onClick={() => jumpTo("photos")} style={{ height: 220, borderRadius: 20, overflow: "hidden", background: "#f0f4f8", position: "relative", marginBottom: 20, cursor: "pointer" }}>
        {heroPhoto
          ? <img src={heroPhoto} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Camera size={36} color="#ccc" strokeWidth={1.5} />
            </div>
        }
        <div style={{ position: "absolute", top: 12, left: 12, background: draft.status === "lost" ? "#dc2626" : "#16a34a", padding: "5px 14px", borderRadius: 30 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: 1 }}>{draft.status}</span>
        </div>
        {/* Edit overlay */}
        <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.5)", borderRadius: 10, padding: "6px 10px", display: "flex", alignItems: "center", gap: 5 }}>
          <Pencil size={12} color="#fff" strokeWidth={2} />
          <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>Edit Photos</span>
        </div>
        {/* Extra photos strip */}
        {draft.previews.filter(Boolean).length > 1 && (
          <div style={{ position: "absolute", bottom: 10, right: 10, display: "flex", gap: 6 }}>
            {draft.previews.slice(1).filter(Boolean).map((p, i) => (
              <img key={i} src={p!} style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", border: "2px solid #fff" }} />
            ))}
          </div>
        )}
      </div>

      {/* Name + species */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#111", margin: 0 }}>{draft.name || "No name"}</h2>
          <p style={{ fontSize: 14, color: "#888", marginTop: 4, margin: 0 }}>{[draft.species, draft.breed].filter(Boolean).join(" · ")}</p>
        </div>
        <button onClick={() => jumpTo("name")} style={{ width: 34, height: 34, borderRadius: 12, background: "#f0f0f0", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <SquarePen size={14} color="#333" strokeWidth={1.8} />
        </button>
      </div>

      {/* Info rows */}
      <div style={{ background: "#fafafa", borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
        {[
          { label: "Posted by", value: draft.contactName || "Anonymous", step: "contact" as StepKey },
          { label: "Color",    value: draft.color,    step: "appearance" as StepKey },
          { label: "Size",     value: draft.size,     step: "appearance" as StepKey },
          { label: "Borough",  value: draft.borough,  step: "location" as StepKey },
          { label: "Location", value: draft.location, step: "location" as StepKey },
          { label: "Date",     value: draft.date,     step: "location" as StepKey },
        ].filter(r => r.value).map((r, i, arr) => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: i < arr.length - 1 ? "1px solid #f0f0f0" : "none" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: "#bbb", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, margin: 0 }}>{r.label}</p>
              <p style={{ fontSize: 14, color: "#333", marginTop: 3, margin: 0 }}>{r.value}</p>
            </div>
            <button onClick={() => jumpTo(r.step)} style={{ width: 28, height: 28, borderRadius: 8, background: "#f0f0f0", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <SquarePen size={12} color="#333" strokeWidth={1.8} />
            </button>
          </div>
        ))}
      </div>

      {/* Notes */}
      {draft.notes && (
        <div style={{ background: "#fafafa", borderRadius: 18, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <p style={{ fontSize: 11, color: "#bbb", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 6px" }}>Notes</p>
            <button onClick={() => jumpTo("appearance")} style={{ width: 28, height: 28, borderRadius: 8, background: "#f0f0f0", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
              <SquarePen size={12} color="#333" strokeWidth={1.8} />
            </button>
          </div>
          <p style={{ fontSize: 14, color: "#333", margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{draft.notes}</p>
        </div>
      )}

      {/* Contact methods */}
      {(() => {
        const contacts = [
          draft.phoneEnabled    && draft.phone    && { label: "Phone",      value: draft.phone },
          draft.emailEnabled    && draft.email    && { label: "Email",      value: draft.email },
          draft.facebookEnabled && draft.facebook && { label: "Facebook",   value: draft.facebook },
          draft.instagramEnabled && draft.instagram && { label: "Instagram", value: draft.instagram },
          draft.tiktokEnabled   && draft.tiktok   && { label: "TikTok",    value: draft.tiktok },
          draft.twitterEnabled  && draft.twitter  && { label: "X / Twitter", value: draft.twitter },
        ].filter(Boolean) as { label: string; value: string }[];

        if (contacts.length === 0) return (
          <div style={{ background: "#fafafa", borderRadius: 18, padding: "14px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 11, color: "#bbb", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, margin: 0 }}>Contact</p>
              <p style={{ fontSize: 13, color: "#aaa", marginTop: 3, margin: 0 }}>In-app messaging only</p>
            </div>
            <button onClick={() => jumpTo("contact")} style={{ width: 28, height: 28, borderRadius: 8, background: "#f0f0f0", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <SquarePen size={12} color="#333" strokeWidth={1.8} />
            </button>
          </div>
        );

        return (
          <div style={{ background: "#fafafa", borderRadius: 18, overflow: "hidden", marginBottom: 20 }}>
            <div style={{ padding: "12px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: 11, color: "#bbb", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, margin: 0 }}>Contact Options</p>
              <button onClick={() => jumpTo("contact")} style={{ width: 28, height: 28, borderRadius: 8, background: "#f0f0f0", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <SquarePen size={12} color="#333" strokeWidth={1.8} />
              </button>
            </div>
            <div style={{ padding: "0 16px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
              {/* In-app messaging always shown */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#111", borderRadius: 12 }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0 }}>In-app Message</p>
                  <p style={{ fontSize: 11, color: "#aaa", margin: 0 }}>Default · always enabled</p>
                </div>
              </div>
              {contacts.map(c => (
                <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#fff", borderRadius: 12, border: "1px solid #f0f0f0" }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 11, color: "#bbb", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, margin: 0 }}>{c.label}</p>
                    <p style={{ fontSize: 13, color: "#333", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Edit hint */}
      <p style={{ fontSize: 12, color: "#bbb", textAlign: "center", marginBottom: 8 }}>Tap ✏️ on any section to edit</p>
    </div>
  );

}
