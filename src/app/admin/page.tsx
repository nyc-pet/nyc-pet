export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase-server";
import type { PetPost } from "@/lib/types";
import { MapPin, Calendar } from "lucide-react";
import AdminActions from "./AdminActions";

const ADMIN_EMAIL = "rr@rubayath.com";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) redirect("/");

  const { data: pending } = await supabase
    .from("pet_posts")
    .select("*")
    .eq("approved", false)
    .order("created_at", { ascending: true });

  const { data: allApproved } = await supabase
    .from("pet_posts")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });

  const posts = (pending ?? []) as PetPost[];
  const approvedPosts = (allApproved ?? []) as PetPost[];

  const SPECIES_EMOJI: Record<string, string> = {
    dog: "🐕", cat: "🐈", bird: "🐦", rabbit: "🐇", other: "🐾",
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#020617] pt-32 pb-10 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="font-nunito text-white/40 text-xs uppercase tracking-widest mb-1">Admin Panel</p>
          <h1 className="font-fredoka text-4xl font-semibold text-white">Review Queue</h1>
          <p className="font-nunito text-white/50 text-sm mt-1">{posts.length} post{posts.length !== 1 ? "s" : ""} pending approval</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

        {/* Pending */}
        <section>
          <h2 className="font-fredoka text-2xl font-semibold text-gray-900 mb-4">Pending Review</h2>
          {posts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
              <p className="text-4xl mb-3">✅</p>
              <p className="font-fredoka text-xl font-semibold text-gray-700">All caught up!</p>
              <p className="font-nunito text-gray-400 text-sm mt-1">No posts waiting for approval.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const emoji = SPECIES_EMOJI[post.species] ?? "🐾";
                const date = new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={post.id} className="bg-white rounded-3xl border border-yellow-100 shadow-sm overflow-hidden flex flex-col sm:flex-row">
                    {/* Photo */}
                    <div className="relative w-full sm:w-40 h-40 bg-gray-100 shrink-0">
                      {post.photo_url ? (
                        <Image src={post.photo_url} alt={post.name ?? post.species} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">{emoji}</div>
                      )}
                      <span className={`absolute top-2 left-2 text-xs font-fredoka font-semibold px-2.5 py-1 rounded-full ${post.status === "lost" ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
                        {post.status}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-fredoka text-xl font-semibold text-gray-900">
                          {post.name ?? (post.species.charAt(0).toUpperCase() + post.species.slice(1))}
                          {post.breed && <span className="text-gray-400 font-normal text-base ml-2">{post.breed}</span>}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 font-nunito text-xs text-gray-400">
                            <MapPin className="w-3 h-3 text-blue-400" /> {post.borough}
                          </span>
                          <span className="flex items-center gap-1 font-nunito text-xs text-gray-400">
                            <Calendar className="w-3 h-3" /> {date}
                          </span>
                        </div>
                        <p className="font-nunito text-sm text-gray-500 mt-2 line-clamp-2">{post.description}</p>
                        <div className="mt-2 space-y-0.5">
                          <p className="font-nunito text-xs text-gray-400">📧 {post.contact_email}</p>
                          {post.contact_phone && <p className="font-nunito text-xs text-gray-400">📞 {post.contact_phone}</p>}
                          <p className="font-nunito text-xs text-gray-400">📍 {post.last_seen_address}</p>
                        </div>
                      </div>

                      <AdminActions postId={post.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* All Approved Posts */}
        <section>
          <h2 className="font-fredoka text-2xl font-semibold text-gray-900 mb-4">
            All Live Posts
            <span className="ml-2 font-nunito text-base font-normal text-gray-400">({approvedPosts.length})</span>
          </h2>
          {approvedPosts.length === 0 ? (
            <p className="font-nunito text-gray-400 text-sm">No approved posts yet.</p>
          ) : (
            <div className="space-y-3">
              {approvedPosts.map((post) => {
                const emoji = SPECIES_EMOJI[post.species] ?? "🐾";
                const date = new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                return (
                  <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row items-stretch">
                    {/* Photo */}
                    <div className="relative w-full sm:w-20 h-20 bg-gray-100 shrink-0">
                      {post.photo_url ? (
                        <Image src={post.photo_url} alt={post.name ?? post.species} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">{emoji}</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-fredoka font-semibold text-xs px-2 py-0.5 rounded-full ${post.status === "lost" ? "bg-red-100 text-red-600" : post.status === "found" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                            {post.status}
                          </span>
                          <span className="font-fredoka font-semibold text-gray-800 truncate">
                            {post.name ?? (post.species.charAt(0).toUpperCase() + post.species.slice(1))}
                            {post.breed && <span className="text-gray-400 font-normal"> · {post.breed}</span>}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="font-nunito text-xs text-gray-400"><MapPin className="w-3 h-3 inline mr-0.5 text-blue-400" />{post.borough}</span>
                          <span className="font-nunito text-xs text-gray-400"><Calendar className="w-3 h-3 inline mr-0.5" />{date}</span>
                          <span className="font-nunito text-xs text-gray-400">📧 {post.contact_email}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`/pet/${post.id}`}
                          target="_blank"
                          className="font-nunito font-semibold text-xs px-3 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                        >
                          View
                        </a>
                        <a
                          href={`/profile/edit/${post.id}`}
                          className="font-nunito font-semibold text-xs px-3 py-2 rounded-full bg-[#1c314e] hover:bg-[#1c314e]/80 text-white transition-colors"
                        >
                          Edit
                        </a>
                        <AdminActions postId={post.id} compact />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
