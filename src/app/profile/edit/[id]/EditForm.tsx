"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import type { PetPost, PetSpecies, PetStatus } from "@/lib/types";
import { Upload, MapPin, Camera, User, Mail, Phone, Calendar, ArrowLeft, Trash2 } from "lucide-react";
import PawIcon from "@/components/PawIcon";

const BOROUGHS = ["Manhattan", "Brooklyn", "Queens", "Staten Island", "Bronx"];

const ReportMap = dynamic(() => import("@/app/report/ReportMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-sm font-nunito">
      Loading map…
    </div>
  ),
});

const inputClass = "w-full border border-gray-200 rounded-2xl px-4 py-3.5 font-nunito text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder:text-gray-300 bg-white transition-all";
const labelClass = "block font-nunito text-sm font-semibold text-gray-700 mb-1.5";

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50">
        <span className="text-[#1c314e]">{icon}</span>
        <h2 className="font-fredoka text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function EditForm({ post }: { post: PetPost }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mapPosition, setMapPosition] = useState<[number, number]>([post.lat, post.lng]);
  const [newPhotos, setNewPhotos] = useState<Array<{ file: File; preview: string }>>([]);

  const existingPhotos = [post.photo_url, post.photo_url_2, post.photo_url_3].filter(Boolean) as string[];
  const [keptPhotos, setKeptPhotos] = useState<string[]>(existingPhotos);

  const [form, setForm] = useState({
    status: post.status as PetStatus,
    species: post.species as PetSpecies,
    name: post.name ?? "",
    breed: post.breed ?? "",
    color: post.color,
    description: post.description,
    last_seen_date: post.last_seen_date,
    last_seen_address: post.last_seen_address,
    borough: post.borough,
    contact_name: post.contact_name,
    contact_email: post.contact_email,
    contact_phone: post.contact_phone ?? "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleNewPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const remaining = 3 - keptPhotos.length - newPhotos.length;
    const files = Array.from(e.target.files ?? []).slice(0, remaining);
    const toAdd = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setNewPhotos((prev) => [...prev, ...toAdd]);
    e.target.value = "";
  }

  const totalPhotos = keptPhotos.length + newPhotos.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();

    async function uploadPhoto(file: File): Promise<string | null> {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("pet-photos").upload(fileName, file);
      if (error) return null;
      return supabase.storage.from("pet-photos").getPublicUrl(fileName).data.publicUrl;
    }

    const uploadedUrls = await Promise.all(newPhotos.map((p) => uploadPhoto(p.file)));
    const allUrls = [...keptPhotos, ...uploadedUrls.filter(Boolean) as string[]].slice(0, 3);
    const [photo_url, photo_url_2, photo_url_3] = allUrls;

    const { error } = await supabase
      .from("pet_posts")
      .update({
        ...form,
        lat: mapPosition[0],
        lng: mapPosition[1],
        photo_url: photo_url ?? null,
        photo_url_2: photo_url_2 ?? null,
        photo_url_3: photo_url_3 ?? null,
        breed: form.breed || null,
        name: form.name || null,
        contact_phone: form.contact_phone || null,
      })
      .eq("id", post.id);

    setLoading(false);
    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }
    router.push("/profile");
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("pet_posts").delete().eq("id", post.id);
    router.push("/profile");
  }

  const speciesOptions: { value: PetSpecies; emoji: string; label: string }[] = [
    { value: "dog", emoji: "🐕", label: "Dog" },
    { value: "cat", emoji: "🐈", label: "Cat" },
    { value: "bird", emoji: "🐦", label: "Bird" },
    { value: "rabbit", emoji: "🐇", label: "Rabbit" },
    { value: "other", emoji: "🐾", label: "Other" },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-[#020617] pt-28 pb-12 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <PawIcon className="w-5 h-5 text-blue-400" />
          <span className="font-nunito text-blue-400 text-xs font-semibold tracking-widest uppercase">Edit Report</span>
        </div>
        <h1 className="font-fredoka text-5xl font-semibold text-white mb-2">
          {post.name ?? (post.species.charAt(0).toUpperCase() + post.species.slice(1))}
        </h1>
        <p className="font-nunito text-white/50 text-sm">Update your listing details below.</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 pb-20">
        <Link href="/profile" className="inline-flex items-center gap-2 font-nunito text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to profile
        </Link>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Status */}
          <SectionCard title="Status" icon={<PawIcon className="w-4 h-4" />}>
            <div className="grid grid-cols-3 gap-3">
              {(["lost", "found", "reunited"] as PetStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, status: s }))}
                  className={`py-3 rounded-2xl border-2 font-fredoka font-semibold text-sm transition-all ${
                    form.status === s
                      ? s === "lost" ? "border-red-500 bg-red-50 text-red-600"
                        : s === "found" ? "border-green-500 bg-green-50 text-green-600"
                        : "border-pink-500 bg-pink-50 text-pink-600"
                      : "border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200"
                  }`}
                >
                  {s === "lost" ? "😢 Lost" : s === "found" ? "🤗 Found" : "🩷 Reunited"}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* About */}
          <SectionCard title="About the Pet" icon={<PawIcon className="w-4 h-4" />}>
            <div className="mb-5">
              <label className={labelClass}>Animal Type</label>
              <div className="flex gap-2 flex-wrap">
                {speciesOptions.map(({ value, emoji, label }) => (
                  <button key={value} type="button" onClick={() => setForm((prev) => ({ ...prev, species: value }))}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full border-2 font-nunito font-semibold text-sm transition-all ${
                      form.species === value ? "border-[#1c314e] bg-blue-50 text-blue-600" : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                    }`}>
                    {emoji} {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
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
              <input name="color" value={form.color} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={4} className={`${inputClass} resize-none`} />
            </div>
          </SectionCard>

          {/* Where & When */}
          <SectionCard title="Where & When" icon={<MapPin className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4 mb-4">
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
              <input name="last_seen_address" value={form.last_seen_address} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}><MapPin className="inline w-3.5 h-3.5 mr-1 text-blue-400" />Pin on Map *</label>
              <div className="rounded-2xl overflow-hidden border border-gray-200">
                <ReportMap position={mapPosition} onPick={setMapPosition} />
              </div>
              <p className="font-nunito text-xs text-green-600 mt-2">✓ {mapPosition[0].toFixed(5)}, {mapPosition[1].toFixed(5)}</p>
            </div>
          </SectionCard>

          {/* Photos */}
          <SectionCard title="Photos" icon={<Camera className="w-4 h-4" />}>
            <p className="font-nunito text-sm text-gray-500 mb-4">Remove or add photos. Max 3 total.</p>
            <div className="grid grid-cols-3 gap-3">
              {/* Existing kept photos */}
              {keptPhotos.map((url, i) => (
                <div key={url} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setKeptPhotos((p) => p.filter((u) => u !== url))}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-xs">✕</button>
                  {i === 0 && <span className="absolute bottom-2 left-2 bg-[#1c314e] text-white text-xs font-nunito font-semibold px-2.5 py-0.5 rounded-full">Main</span>}
                </div>
              ))}
              {/* New photos */}
              {newPhotos.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-blue-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.preview} alt="New" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setNewPhotos((prev) => prev.filter((_, j) => j !== i))}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-xs">✕</button>
                  <span className="absolute bottom-2 left-2 bg-blue-400 text-white text-xs font-nunito font-semibold px-2.5 py-0.5 rounded-full">New</span>
                </div>
              ))}
              {/* Add slot */}
              {totalPhotos < 3 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="font-nunito text-xs text-gray-400">Add photo</span>
                  <input type="file" accept="image/*" multiple onChange={handleNewPhoto} className="hidden" />
                </label>
              )}
              {Array.from({ length: Math.max(0, 2 - totalPhotos) }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 flex items-center justify-center">
                  <span className="font-nunito text-xs text-gray-300">Photo {totalPhotos + i + 2}</span>
                </div>
              ))}
            </div>
            <p className="font-nunito text-xs text-gray-400 mt-3 text-center">{totalPhotos} / 3 photos</p>
          </SectionCard>

          {/* Contact */}
          <SectionCard title="Contact Info" icon={<User className="w-4 h-4" />}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className={labelClass}><User className="inline w-3.5 h-3.5 mr-1 text-blue-400" />Name *</label>
                <input name="contact_name" value={form.contact_name} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}><Mail className="inline w-3.5 h-3.5 mr-1 text-blue-400" />Email *</label>
                <input type="email" name="contact_email" value={form.contact_email} onChange={handleChange} required className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}><Phone className="inline w-3.5 h-3.5 mr-1 text-blue-400" />Phone <span className="font-normal text-gray-400">(optional)</span></label>
              <input type="tel" name="contact_phone" value={form.contact_phone} onChange={handleChange} className={inputClass} />
            </div>
          </SectionCard>

          {/* Save */}
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1c314e] hover:bg-blue-600 disabled:bg-blue-300 text-white font-fredoka font-semibold text-xl py-5 rounded-2xl transition-all shadow-lg">
            {loading ? <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving…</> : <><PawIcon className="w-5 h-5" /> Save Changes</>}
          </button>

          {/* Delete */}
          <button type="button" onClick={handleDelete} disabled={deleting}
            className={`w-full flex items-center justify-center gap-2 font-fredoka font-semibold text-base py-4 rounded-2xl transition-all border-2 ${
              confirmDelete ? "border-red-500 bg-red-500 text-white" : "border-red-200 text-red-400 hover:border-red-400 hover:text-red-500"
            }`}>
            <Trash2 className="w-4 h-4" />
            {deleting ? "Deleting…" : confirmDelete ? "Confirm — permanently delete this post" : "Delete this post"}
          </button>
          {confirmDelete && <p className="font-nunito text-xs text-center text-red-400">This cannot be undone. Click again to confirm.</p>}

        </form>
      </div>
    </main>
  );
}
