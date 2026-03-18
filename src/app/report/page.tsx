"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase-browser";
import type { PetSpecies, PetStatus } from "@/lib/types";
import { Upload, MapPin, Camera, User, Mail, Phone, Calendar, Heart, AlertTriangle } from "lucide-react";
import PawIcon from "@/components/PawIcon";

const BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];

const ReportMap = dynamic(() => import("./ReportMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-sm font-nunito">
      Loading map…
    </div>
  ),
});

const inputClass = "w-full border border-gray-200 rounded-2xl px-4 py-3.5 font-nunito text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder:text-gray-300 bg-white transition-all";
const labelClass = "block font-nunito text-sm font-semibold text-gray-700 mb-1.5";

function SectionCard({ step, title, icon, children }: { step: number; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
        <span className="w-8 h-8 rounded-full bg-[#1c314e] text-white font-fredoka font-semibold text-sm flex items-center justify-center shrink-0">
          {step}
        </span>
        <span className="text-[#1c314e]">{icon}</span>
        <h2 className="font-fredoka text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function ReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(null);
  const [photos, setPhotos] = useState<Array<{ file: File; preview: string }>>([]);

  const [form, setForm] = useState({
    status: "lost" as PetStatus,
    species: "dog" as PetSpecies,
    name: "",
    breed: "",
    color: "",
    description: "",
    last_seen_date: "",
    last_seen_address: "",
    borough: "Manhattan",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = 3 - photos.length;
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...toAdd]);
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mapPosition) {
      alert("Please click on the map to mark where the pet was last seen.");
      return;
    }
    setLoading(true);
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login?redirectTo=/report");
      return;
    }

    async function uploadPhoto(file: File): Promise<string | null> {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("pet-photos").upload(fileName, file);
      if (error) return null;
      return supabase.storage.from("pet-photos").getPublicUrl(fileName).data.publicUrl;
    }

    const urls = await Promise.all(photos.map((p) => uploadPhoto(p.file)));
    const [photo_url, photo_url_2, photo_url_3] = urls;

    const { data, error } = await supabase
      .from("pet_posts")
      .insert({
        ...form,
        lat: mapPosition[0],
        lng: mapPosition[1],
        photo_url: photo_url ?? null,
        photo_url_2: photo_url_2 ?? null,
        photo_url_3: photo_url_3 ?? null,
        user_id: user.id,
        breed: form.breed || null,
        name: form.name || null,
        contact_phone: form.contact_phone || null,
        approved: false,
      })
      .select()
      .single();

    setLoading(false);
    if (error) {
      alert(`Error: ${error.message}\n\nCode: ${error.code}`);
      console.error(error);
      return;
    }
    setSubmitted(true);
  }

  const speciesOptions: { value: PetSpecies; emoji: string; label: string }[] = [
    { value: "dog",    emoji: "🐕", label: "Dog" },
    { value: "cat",    emoji: "🐈", label: "Cat" },
    { value: "bird",   emoji: "🐦", label: "Bird" },
    { value: "rabbit", emoji: "🐇", label: "Rabbit" },
    { value: "other",  emoji: "🐾", label: "Other" },
  ];

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">🕐</span>
          </div>
          <h2 className="font-fredoka text-3xl font-semibold text-gray-900 mb-2">Report Submitted!</h2>
          <p className="font-nunito text-gray-500 text-sm leading-relaxed mb-6">
            Your report is <span className="font-semibold text-yellow-600">pending review</span>. Our team will approve it shortly and it will appear on the live map once approved.
          </p>
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl px-4 py-3 mb-6">
            <p className="font-nunito text-yellow-700 text-xs font-semibold">⏱ Usually approved within a few hours</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/profile")}
              className="w-full bg-[#1c314e] hover:bg-[#1c314e]/80 text-white font-fredoka font-semibold text-base py-3 rounded-2xl transition-colors"
            >
              View My Reports
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-fredoka font-semibold text-base py-3 rounded-2xl transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-[#020617] pt-28 pb-12 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <PawIcon className="w-5 h-5 text-blue-400" />
          <span className="font-nunito text-blue-400 text-xs font-semibold tracking-widest uppercase">NYC Lost & Found</span>
        </div>
        <h1 className="font-fredoka text-5xl font-semibold text-white mb-2">Report a Pet</h1>
        <p className="font-nunito text-white/50 text-base max-w-md mx-auto">
          Fill out the form below — the more detail you add, the better the chances of a reunion.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 pb-20">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Step 1 — What happened */}
          <SectionCard step={1} title="What happened?" icon={<Heart className="w-4 h-4" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(["lost", "found"] as PetStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, status: s }))}
                  className={`flex flex-col items-center gap-2 py-5 rounded-2xl border-2 font-fredoka font-semibold text-base transition-all ${
                    form.status === s
                      ? s === "lost"
                        ? "border-red-500 bg-red-50 text-red-600 shadow-md"
                        : "border-green-500 bg-green-50 text-green-600 shadow-md"
                      : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                  }`}
                >
                  <span className="text-3xl">{s === "lost" ? "😢" : "🤗"}</span>
                  {s === "lost" ? "I Lost My Pet" : "I Found a Pet"}
                </button>
              ))}
            </div>

            {form.status === "lost" && (
              <div className="mt-4 flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="font-nunito text-xs text-red-600">Your listing will be visible to the whole NYC community immediately after posting.</p>
              </div>
            )}
          </SectionCard>

          {/* Step 2 — About the pet */}
          <SectionCard step={2} title="About the Pet" icon={<PawIcon className="w-4 h-4" />}>
            {/* Species */}
            <div className="mb-5">
              <label className={labelClass}>Animal Type</label>
              <div className="flex gap-2 flex-wrap">
                {speciesOptions.map(({ value, emoji, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, species: value }))}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full border-2 font-nunito font-semibold text-sm transition-all ${
                      form.species === value
                        ? "border-[#1c314e] bg-blue-50 text-blue-600"
                        : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                    }`}
                  >
                    <span>{emoji}</span> {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}>Pet Name <span className="font-normal text-gray-400">(optional)</span></label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Bella" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Breed <span className="font-normal text-gray-400">(optional)</span></label>
                <input name="breed" value={form.breed} onChange={handleChange} placeholder="e.g. Golden Retriever" className={inputClass} />
              </div>
            </div>

            <div className="mb-4">
              <label className={labelClass}>Color / Markings *</label>
              <input name="color" value={form.color} onChange={handleChange} required placeholder="e.g. Brown with white chest" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Any distinguishing features, collar, tags, microchip, behavior, last known location details…"
                className={`${inputClass} resize-none`}
              />
            </div>
          </SectionCard>

          {/* Step 3 — Where */}
          <SectionCard step={3} title="Where & When" icon={<MapPin className="w-4 h-4" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}><Calendar className="inline w-3.5 h-3.5 mr-1 text-blue-400" />Date Last Seen *</label>
                <input type="date" name="last_seen_date" value={form.last_seen_date} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Borough *</label>
                <select name="borough" value={form.borough} onChange={handleChange} className={inputClass}>
                  {BOROUGHS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className={labelClass}>Last Seen Address *</label>
              <input name="last_seen_address" value={form.last_seen_address} onChange={handleChange} required placeholder="e.g. Prospect Park, Brooklyn" className={inputClass} />
            </div>

            <div>
              <label className={`${labelClass} flex items-center gap-1.5`}>
                <MapPin className="w-4 h-4 text-blue-400" />
                Pin on Map *
                <span className="font-normal text-gray-400 text-xs">(click to place marker)</span>
              </label>
              <div className="rounded-2xl overflow-hidden border border-gray-200">
                <ReportMap position={mapPosition} onPick={setMapPosition} />
              </div>
              {mapPosition ? (
                <p className="font-nunito text-xs text-green-600 mt-2 flex items-center gap-1">
                  ✓ Location pinned at {mapPosition[0].toFixed(5)}, {mapPosition[1].toFixed(5)}
                </p>
              ) : (
                <p className="font-nunito text-xs text-gray-400 mt-2">Tap anywhere on the map to drop a pin.</p>
              )}
            </div>
          </SectionCard>

          {/* Step 4 — Photos */}
          <SectionCard step={4} title="Photos" icon={<Camera className="w-4 h-4" />}>
            <p className="font-nunito text-sm text-gray-500 mb-4">
              Add up to 3 photos. The first photo will be the main one shown on listings.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {photos.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                  >
                    ✕
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-2 left-2 bg-[#1c314e] text-white text-xs font-nunito font-semibold px-2.5 py-0.5 rounded-full">
                      Main
                    </span>
                  )}
                </div>
              ))}
              {photos.length < 3 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="font-nunito text-xs text-gray-400">Add photo</span>
                  <input type="file" accept="image/*" multiple onChange={handlePhoto} className="hidden" />
                </label>
              )}
              {/* Empty placeholder slots */}
              {Array.from({ length: Math.max(0, 2 - photos.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 flex items-center justify-center">
                  <span className="font-nunito text-xs text-gray-300">Photo {photos.length + i + 2}</span>
                </div>
              ))}
            </div>
            <p className="font-nunito text-xs text-gray-400 mt-3 text-center">{photos.length} / 3 photos added</p>
          </SectionCard>

          {/* Step 5 — Contact */}
          <SectionCard step={5} title="Your Contact Info" icon={<User className="w-4 h-4" />}>
            <p className="font-nunito text-sm text-gray-500 mb-4">
              This will be shown to people who may have spotted your pet.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}><User className="inline w-3.5 h-3.5 mr-1 text-blue-400" />Name *</label>
                <input name="contact_name" value={form.contact_name} onChange={handleChange} required placeholder="Your name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}><Mail className="inline w-3.5 h-3.5 mr-1 text-blue-400" />Email *</label>
                <input type="email" name="contact_email" value={form.contact_email} onChange={handleChange} required placeholder="you@email.com" className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}><Phone className="inline w-3.5 h-3.5 mr-1 text-blue-400" />Phone <span className="font-normal text-gray-400">(optional)</span></label>
              <input type="tel" name="contact_phone" value={form.contact_phone} onChange={handleChange} placeholder="(212) 555-0000" className={inputClass} />
            </div>
          </SectionCard>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1c314e] hover:bg-blue-600 disabled:bg-blue-300 text-white font-fredoka font-semibold text-xl py-5 rounded-2xl transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <PawIcon className="w-5 h-5" />
                Submit Report
              </>
            )}
          </button>
          <p className="font-nunito text-xs text-gray-400 text-center">Your listing will be live immediately after submitting.</p>

        </form>
      </div>
    </main>
  );
}
