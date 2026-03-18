export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import type { PetPost } from "@/lib/types";
import { MapPin, Calendar, Phone, Mail, User, ArrowLeft, Share2, Heart, AlertTriangle } from "lucide-react";
import MarkReunitedButton from "./MarkReunitedButton";
import PetDetailMapWrapper from "./PetDetailMapWrapper";
import PhotoGallery from "./PhotoGallery";

const STATUS_CONFIG: Record<string, { label: string; pill: string; bg: string; border: string; accent: string }> = {
  lost:     { label: "Lost",      pill: "bg-red-500 text-white",   bg: "bg-red-50",   border: "border-red-100",   accent: "text-red-500" },
  found:    { label: "Found",     pill: "bg-green-500 text-white", bg: "bg-green-50", border: "border-green-100", accent: "text-green-600" },
  reunited: { label: "Reunited 🎉", pill: "bg-blue-500 text-white",  bg: "bg-blue-50",  border: "border-blue-100",  accent: "text-blue-500" },
};

const SPECIES_EMOJI: Record<string, string> = {
  dog: "🐕", cat: "🐈", bird: "🐦", rabbit: "🐇", other: "🐾",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("pet_posts").select("*").eq("id", id).single();
  if (!data) return { title: "Pet Not Found — nyc.pet" };
  const post = data as PetPost;
  return {
    title: `${post.status === "lost" ? "Lost" : "Found"} ${post.species}${post.name ? ` · ${post.name}` : ""} in ${post.borough} — nyc.pet`,
  };
}

export default async function PetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase.from("pet_posts").select("*").eq("id", id).single();
  if (error || !data) notFound();

  const post = data as PetPost;
  const s = STATUS_CONFIG[post.status] ?? STATUS_CONFIG.lost;
  const emoji = SPECIES_EMOJI[post.species] ?? "🐾";
  const allPhotos = [post.photo_url, post.photo_url_2, post.photo_url_3].filter(Boolean) as string[];
  const dateFormatted = new Date(post.last_seen_date).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
  const postedOn = new Date(post.created_at).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── HERO IMAGE + GALLERY ── */}
      <div className="relative">
        <Link href="/" className="absolute top-24 left-6 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white font-nunito font-semibold text-sm px-4 py-2.5 rounded-full transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <PhotoGallery
          photos={allPhotos}
          alt={post.name ?? post.species}
          emoji={emoji}
          petName={post.name
            ? `${post.name} · ${post.species.charAt(0).toUpperCase() + post.species.slice(1)}`
            : post.species.charAt(0).toUpperCase() + post.species.slice(1)
          }
          postedOn={postedOn}
          statusLabel={s.label}
          statusPill={s.pill}
          breed={post.breed}
        />
      </div>

      {/* ── BODY ── */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 pb-16 relative z-10">

        {/* Reunited banner */}
        {post.status === "reunited" && (
          <div className="bg-blue-500 text-white rounded-2xl p-6 mb-6 text-center shadow-lg">
            <p className="text-4xl mb-2">🎉</p>
            <p className="font-fredoka text-2xl font-semibold">This pet has been reunited with their family!</p>
            <p className="font-nunito text-blue-100 text-sm mt-1">Thank you to everyone who helped make this happen.</p>
          </div>
        )}

        {/* Lost alert banner */}
        {post.status === "lost" && (
          <div className="bg-red-500 text-white rounded-2xl px-6 py-4 mb-6 flex items-center gap-3 shadow-lg">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-fredoka text-lg font-semibold">This pet is missing — please help!</p>
              <p className="font-nunito text-red-100 text-sm">If you&apos;ve seen this pet, contact the owner below immediately.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Quick facts */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-fredoka text-xl font-semibold text-gray-900 mb-4">Pet Details</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-2xl p-4 ${s.bg} ${s.border} border`}>
                  <p className="font-nunito text-xs text-gray-400 uppercase tracking-wide mb-1">Animal</p>
                  <p className="font-fredoka text-lg font-semibold text-gray-800 capitalize">{post.species} {emoji}</p>
                </div>
                <div className={`rounded-2xl p-4 ${s.bg} ${s.border} border`}>
                  <p className="font-nunito text-xs text-gray-400 uppercase tracking-wide mb-1">Color</p>
                  <p className="font-fredoka text-lg font-semibold text-gray-800">{post.color}</p>
                </div>
                <div className="rounded-2xl p-4 bg-gray-50 border border-gray-100 flex items-start gap-3 col-span-2 sm:col-span-1">
                  <Calendar className="w-5 h-5 text-[#1c314e] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-nunito text-xs text-gray-400 uppercase tracking-wide mb-0.5">Last Seen Date</p>
                    <p className="font-nunito font-semibold text-gray-800 text-sm leading-snug">{dateFormatted}</p>
                  </div>
                </div>
                <div className="rounded-2xl p-4 bg-gray-50 border border-gray-100 flex items-start gap-3 col-span-2 sm:col-span-1">
                  <MapPin className="w-5 h-5 text-[#1c314e] mt-0.5 shrink-0" />
                  <div>
                    <p className="font-nunito text-xs text-gray-400 uppercase tracking-wide mb-0.5">Borough</p>
                    <p className="font-nunito font-semibold text-gray-800 text-sm">{post.borough}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-fredoka text-xl font-semibold text-gray-900 mb-3">About this Pet</h2>
              <p className="font-nunito text-gray-600 leading-relaxed">{post.description}</p>
            </div>

            {/* Map */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-fredoka text-xl font-semibold text-gray-900 mb-1">Last Seen Location</h2>
              <p className="font-nunito text-sm text-gray-400 flex items-center gap-1.5 mb-4">
                <MapPin className="w-3.5 h-3.5" /> {post.last_seen_address}
              </p>
              <div className="h-72 rounded-2xl overflow-hidden border border-gray-100">
                <PetDetailMapWrapper lat={post.lat} lng={post.lng} status={post.status} />
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5">

            {/* Contact card */}
            {post.status !== "reunited" && (
              <div className="bg-[#020617] rounded-3xl p-6 shadow-lg lg:sticky lg:top-28">
                <div className="flex items-center gap-2 mb-1">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
                  </span>
                  <span className="font-nunito text-green-400 text-xs font-semibold tracking-widest uppercase">Active Report</span>
                </div>
                <h2 className="font-fredoka text-2xl font-semibold text-white mb-1">Contact Owner</h2>
                <p className="font-nunito text-white/50 text-xs mb-5">Reach out directly if you have information.</p>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3">
                    <User className="w-4 h-4 text-white/50 shrink-0" />
                    <span className="font-nunito text-white font-semibold text-sm">{post.contact_name}</span>
                  </div>
                  <a
                    href={`mailto:${post.contact_email}`}
                    className="flex items-center gap-3 bg-[#1c314e] hover:bg-blue-600 rounded-2xl px-4 py-3 transition-colors group"
                  >
                    <Mail className="w-4 h-4 text-white shrink-0" />
                    <span className="font-nunito text-white font-semibold text-sm truncate">{post.contact_email}</span>
                  </a>
                  {post.contact_phone && (
                    <a
                      href={`tel:${post.contact_phone}`}
                      className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-2xl px-4 py-3 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-white/70 shrink-0" />
                      <span className="font-nunito text-white font-semibold text-sm">{post.contact_phone}</span>
                    </a>
                  )}
                </div>

                <MarkReunitedButton postId={post.id} postUserId={post.user_id ?? null} />

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-white/30" />
                  <p className="font-nunito text-white/30 text-xs">Share this post to help spread the word</p>
                </div>
              </div>
            )}

            {/* Share card */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-fredoka text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#1c314e]" /> Spread the Word
              </h3>
              <p className="font-nunito text-sm text-gray-500 mb-4">
                The more people who know, the better the chances of a reunion.
              </p>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Help find ${post.name ?? "this " + post.species} in ${post.borough}, NYC! 🐾 #NYCPet #LostPet`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white font-nunito font-semibold text-sm py-3 rounded-2xl transition-colors"
              >
                Share on X / Twitter
              </a>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
