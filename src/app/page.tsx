export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import type { PetPost } from "@/lib/types";
import PetCard from "@/components/PetCard";
import FilterBar from "@/components/FilterBar";
import PetMapWrapper from "@/components/PetMapWrapper";
import { Search, MapPin, Heart, ArrowUpRight } from "lucide-react";
import PawIcon from "@/components/PawIcon";

async function getPosts(status?: string, borough?: string, species?: string): Promise<PetPost[]> {
  const supabase = await createClient();
  let query = supabase
    .from("pet_posts")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);
  if (borough && borough !== "all") query = query.ilike("borough", borough);
  if (species && species !== "all") query = query.eq("species", species);

  const { data, error } = await query.limit(50);
  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
  return (data ?? []) as PetPost[];
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; borough?: string; species?: string }>;
}) {
  const params = await searchParams;
  const posts = await getPosts(params.status, params.borough, params.species);
  const activePosts = posts.filter((p) => p.status !== "reunited");
  const lostCount = posts.filter((p) => p.status === "lost").length;
  const foundCount = posts.filter((p) => p.status === "found").length;
  const reunitedCount = posts.filter((p) => p.status === "reunited").length;

  return (
    <main>
      {/* ── HERO — desktop only ── */}
      <section className="hidden sm:flex relative min-h-screen flex-col justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.png')" }}
        />
        {/* Teal-to-dark overlay so text is readable on right side */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/30 to-black/75" />

        {/* Content — centered */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white pt-24 pb-20">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-5 font-nunito tracking-widest uppercase">
            <MapPin className="w-3.5 h-3.5" /> New York City
          </div>

          <p className="font-nunito text-xs sm:text-sm font-semibold tracking-widest text-white/70 uppercase mb-3">
            Help Bring Them Home
          </p>

          <h1 className="font-fredoka font-semibold leading-none mb-5 drop-shadow-lg"
            style={{ fontSize: "clamp(2.5rem, 10vw, 7rem)" }}>
            FIND YOUR<br />PET <PawIcon size={60} color="white" className="inline-block -mt-2 align-middle sm:hidden" />
            <PawIcon size={80} color="white" className="hidden sm:inline-block -mt-3 align-middle" />
          </h1>

          <p className="font-nunito text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            <span className="text-white/60">NYC&apos;s </span>
            <span className="text-white font-bold">community-powered</span>
            <span className="text-white/60"> lost &amp; found for pets across </span>
            <span className="inline-flex items-center gap-1 bg-white/15 border border-white/20 text-white font-semibold px-3 py-0.5 rounded-full text-sm sm:text-base">all five boroughs</span>
            <span className="text-white/60">.</span>
          </p>

          {/* Mobile CTAs — shown only on small screens */}
          <div className="flex flex-col gap-3 sm:hidden mb-2">
            <Link
              href="#listings"
              className="flex items-center justify-center gap-2 bg-white text-[#1c314e] font-fredoka font-semibold text-lg px-8 py-4 rounded-2xl shadow-xl"
            >
              <Search className="w-5 h-5" /> Find a Pet
            </Link>
            <Link
              href="/report"
              className="flex items-center justify-center gap-2 bg-[#1c314e] text-white font-fredoka font-semibold text-lg px-8 py-4 rounded-2xl shadow-xl border border-white/20"
            >
              <Heart className="w-5 h-5" /> Report a Pet
            </Link>
            <Link
              href="/map"
              className="flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white font-fredoka font-semibold text-base px-8 py-3 rounded-2xl"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              View Live Map
            </Link>
          </div>

          {/* Desktop search bar — hidden on mobile */}
          <div className="hidden sm:flex bg-white rounded-full shadow-2xl p-2 items-stretch gap-2 max-w-3xl mx-auto">
            {/* Borough */}
            <div className="flex items-center gap-4 flex-1 px-5 py-3.5 hover:bg-gray-50 rounded-full transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-[#1c314e]" />
              </div>
              <div className="text-left">
                <p className="font-fredoka font-semibold text-gray-800 text-base leading-tight">Borough</p>
                <p className="font-nunito text-sm text-gray-400">All NYC boroughs</p>
              </div>
            </div>
            {/* Species */}
            <div className="flex items-center gap-4 flex-1 px-5 py-3.5 hover:bg-gray-50 rounded-full transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <span className="text-2xl">🐾</span>
              </div>
              <div className="text-left">
                <p className="font-fredoka font-semibold text-gray-800 text-base leading-tight">Animal</p>
                <p className="font-nunito text-sm text-gray-400">Dogs, cats &amp; more</p>
              </div>
            </div>
            {/* Status */}
            <div className="flex items-center gap-4 flex-1 px-5 py-3.5 hover:bg-gray-50 rounded-full transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Search className="w-6 h-6 text-[#1c314e]" />
              </div>
              <div className="text-left">
                <p className="font-fredoka font-semibold text-gray-800 text-base leading-tight">Status</p>
                <p className="font-nunito text-sm text-gray-400">Lost or found</p>
              </div>
            </div>
            {/* CTA */}
            <Link
              href="/#listings"
              className="flex items-center justify-center gap-2 bg-[#1c314e] hover:bg-blue-600 text-white font-fredoka font-semibold text-lg px-8 py-3.5 rounded-full transition-colors shrink-0 shadow-md"
            >
              <Search className="w-5 h-5" />
              Find My Pet
            </Link>
          </div>
        </div>

        {/* Scroll mouse indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="font-nunito font-semibold text-sm tracking-widest uppercase text-white">Scroll</span>
          <div className="w-7 h-11 rounded-full border-2 border-white flex justify-center pt-2">
            <div className="w-1.5 h-2.5 bg-white rounded-full animate-scroll-dot" />
          </div>
        </div>
      </section>

      {/* ── STATS — desktop only ── */}
      <section className="hidden sm:block bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-3 divide-x divide-gray-100">
          <div className="text-center px-2 sm:px-4">
            <p className="font-fredoka text-2xl sm:text-4xl font-semibold text-red-500">{lostCount}</p>
            <p className="font-nunito text-xs sm:text-sm text-gray-500 mt-0.5">Missing Pets</p>
          </div>
          <div className="text-center px-2 sm:px-4">
            <p className="font-fredoka text-2xl sm:text-4xl font-semibold text-green-500">{foundCount}</p>
            <p className="font-nunito text-xs sm:text-sm text-gray-500 mt-0.5">Found Pets</p>
          </div>
          <div className="text-center px-2 sm:px-4">
            <p className="font-fredoka text-2xl sm:text-4xl font-semibold text-[#1c314e]">{reunitedCount}</p>
            <p className="font-nunito text-xs sm:text-sm text-gray-500 mt-0.5">Reunited 🎉</p>
          </div>
        </div>
      </section>

      {/* ── MAP ── */}
      <section className="relative w-full sm:mt-0 h-screen sm:h-[700px] overflow-hidden bg-[#020617]">
        {/* Map as full background */}
        <div className="absolute inset-0 z-0 isolate">
          <PetMapWrapper posts={activePosts} interactive={false} />
        </div>


        {/* Top-right overlay — title + stats in a frosted card */}
        <div className="absolute top-[110px] right-4 z-20 pointer-events-none max-w-[calc(100vw-2rem)]">
          <div className="bg-[#1c314e] border border-blue-400/30 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              {/* Title */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
                  </span>
                  <span className="font-nunito text-green-400 text-xs font-semibold tracking-widest uppercase">Live Map</span>
                </div>
                <h2 className="font-fredoka text-2xl sm:text-4xl font-semibold text-white leading-tight">
                  Pets Near You
                </h2>
                <p className="font-nunito text-white/60 text-xs mt-0.5">All five NYC boroughs</p>
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-14 bg-white/15" />

              {/* Stats */}
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="font-fredoka text-xl sm:text-2xl font-semibold text-red-400">{lostCount}</p>
                  <p className="font-nunito text-xs text-white/50">Lost</p>
                </div>
                <div className="w-px h-8 bg-white/15" />
                <div className="text-center">
                  <p className="font-fredoka text-xl sm:text-2xl font-semibold text-green-400">{foundCount}</p>
                  <p className="font-nunito text-xs text-white/50">Found</p>
                </div>
                <div className="w-px h-8 bg-white/15" />
                <div className="text-center">
                  <p className="font-fredoka text-xl sm:text-2xl font-semibold text-blue-400">{reunitedCount}</p>
                  <p className="font-nunito text-xs text-white/50">Reunited</p>
                </div>
              </div>
            </div>

            {/* CTA button */}
            <Link
              href="/#listings"
              className="pointer-events-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-[#1c314e] font-fredoka font-semibold text-sm py-2.5 rounded-xl transition-colors"
            >
              View Listings
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Bottom-left overlay — legend */}
        <div className="absolute left-5 z-20 bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg flex items-center gap-4 pointer-events-none" style={{ bottom: "max(20px, env(safe-area-inset-bottom, 20px) + 100px)" }}>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            <span className="font-nunito text-xs font-semibold text-gray-700">Lost</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
            <span className="font-nunito text-xs font-semibold text-gray-700">Found</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <span className="font-nunito text-xs text-gray-500">{activePosts.length} active pins</span>
        </div>

        {/* Scroll indicator — uses safe-area to always clear iOS Safari bar */}
        <div className="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 pointer-events-none sm:hidden" style={{ bottom: "max(28px, env(safe-area-inset-bottom, 28px) + 200px)" }}>
          <div className="w-9 h-14 rounded-full border-2 border-white/50 flex items-start justify-center pt-2.5">
            <div className="w-2 h-3.5 rounded-full bg-white/90 animate-scroll-dot" />
          </div>
          <span className="font-nunito text-xs font-semibold tracking-widest uppercase text-white/50">Scroll</span>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-[#E2E8F0] border-y border-[#DBEAFE] py-12">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-fredoka text-3xl font-semibold text-center text-gray-900 mb-8">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: "📝", title: "Post a Report", desc: "Lost your pet or found one? Submit a listing in under 2 minutes." },
              { icon: "🗺️", title: "Browse the Map", desc: "See all reports pinned on a live NYC map filtered by borough." },
              { icon: "🎉", title: "Get Reunited", desc: "Connect with the owner and mark the pet as reunited!" },
            ].map((step) => (
              <div key={step.title} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-blue-100">
                <div className="text-4xl mb-3">{step.icon}</div>
                <h3 className="font-fredoka text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="font-nunito text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LISTINGS ── */}
      <section id="listings" className="max-w-6xl mx-auto px-6 py-12 scroll-mt-24">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-fredoka text-3xl font-semibold text-gray-900">
            Recent Reports
          </h2>
        </div>

        <div className="mb-6">
          <Suspense>
            <FilterBar />
          </Suspense>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-6xl mb-4">🐾</p>
            <p className="font-fredoka text-2xl font-semibold text-gray-500">No reports yet</p>
            <p className="font-nunito text-sm mt-2 text-gray-400">Be the first to report a lost or found pet in NYC.</p>
            <Link href="/report" className="inline-block mt-6 bg-blue-500 text-white font-fredoka font-medium px-6 py-3 rounded-full hover:bg-blue-600 transition-colors">
              + Report a Pet
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PetCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#1c314e] py-16 text-center text-white">
        <h2 className="font-fredoka text-4xl font-semibold mb-3">Missing a pet?</h2>
        <p className="font-nunito text-white/90 text-lg mb-8">Post a listing now and reach thousands of NYC pet lovers.</p>
        <Link
          href="/report"
          className="inline-flex items-center gap-2 bg-white text-[#1c314e] font-fredoka font-semibold px-8 py-3 rounded-full hover:bg-blue-50 transition-colors text-lg shadow-md"
        >
          <Heart className="w-5 h-5" /> Report a Pet
        </Link>
      </section>
    </main>
  );
}
