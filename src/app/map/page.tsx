export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { createClient } from "@/lib/supabase-server";
import type { PetPost } from "@/lib/types";
import PetCard from "@/components/PetCard";
import MapFilterBar from "@/components/MapFilterBar";
import PetMapWrapper from "@/components/PetMapWrapper";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

async function getPosts(
  status?: string,
  borough?: string,
  species?: string
): Promise<PetPost[]> {
  const supabase = await createClient();
  let query = supabase
    .from("pet_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);
  if (borough && borough !== "all") query = query.ilike("borough", borough);
  if (species && species !== "all") query = query.eq("species", species);

  const { data, error } = await query.limit(100);
  if (error) return [];
  return (data ?? []) as PetPost[];
}

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; borough?: string; species?: string }>;
}) {
  const params      = await searchParams;
  const posts       = await getPosts(params.status, params.borough, params.species);
  const activePosts = posts.filter((p) => p.status !== "reunited");
  const lostCount   = posts.filter((p) => p.status === "lost").length;
  const foundCount  = posts.filter((p) => p.status === "found").length;

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "calc(100vh - 88px)", marginTop: "88px" }}
    >
      {/* ── FULL-WIDTH MAP ── */}
      <div className="flex-1 relative min-w-0 overflow-hidden">
        <PetMapWrapper posts={activePosts} />

        {/* Floating legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-4 pointer-events-none">
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
      </div>

      {/* ── BOTTOM PANEL ── */}
      <div className="shrink-0 bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">

        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-5 pt-4 pb-2 gap-2 sm:gap-4">
          <div className="flex items-center gap-3">
            <h2 className="font-fredoka text-lg font-semibold text-gray-900">Pet Reports</h2>
            <div className="flex items-center gap-1.5">
              <span className="bg-red-100 text-red-600 font-nunito font-semibold text-xs px-2.5 py-0.5 rounded-full">{lostCount} Lost</span>
              <span className="bg-green-100 text-green-600 font-nunito font-semibold text-xs px-2.5 py-0.5 rounded-full">{foundCount} Found</span>
              <span className="bg-gray-100 text-gray-500 font-nunito font-semibold text-xs px-2.5 py-0.5 rounded-full">{posts.length} total</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Suspense>
              <MapFilterBar />
            </Suspense>
            <Link
              href="/report"
              className="flex items-center gap-1.5 bg-[#1c314e] hover:bg-[#1c314e]/80 text-white font-fredoka font-semibold text-sm pl-4 pr-1.5 py-2 rounded-full transition-all shrink-0"
            >
              Report a Pet
              <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>

        {/* Horizontal scrolling cards */}
        <div className="overflow-x-auto pb-4 px-5">
          {posts.length === 0 ? (
            <p className="font-fredoka text-sm font-semibold text-gray-400 py-2">No reports found — try adjusting your filters</p>
          ) : (
            <div className="flex justify-center gap-4" style={{ minWidth: "max-content", margin: "0 auto" }}>
              {posts.map((post) => (
                <div key={post.id} className="w-72 shrink-0">
                  <PetCard post={post} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
