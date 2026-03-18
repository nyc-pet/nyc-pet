export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-server";
import type { PetPost } from "@/lib/types";
import { Plus, MapPin, Calendar, Pencil, ArrowUpRight } from "lucide-react";
import PawIcon from "@/components/PawIcon";
import LogoutButton from "./LogoutButton";

const STATUS_CONFIG: Record<string, { label: string; pill: string }> = {
  lost:     { label: "Lost",       pill: "bg-red-500 text-white" },
  found:    { label: "Found",      pill: "bg-green-500 text-white" },
  reunited: { label: "Reunited 🎉", pill: "bg-blue-500 text-white" },
};

const SPECIES_EMOJI: Record<string, string> = {
  dog: "🐕", cat: "🐈", bird: "🐦", rabbit: "🐇", other: "🐾",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirectTo=/profile");

  const { data } = await supabase
    .from("pet_posts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const posts = (data ?? []) as PetPost[];
  const activePosts = posts.filter((p) => p.status !== "reunited");
  const reunitedPosts = posts.filter((p) => p.status === "reunited");
  const initial = user.email?.charAt(0).toUpperCase() ?? "?";

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-[#020617] pt-48 pb-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-[#1c314e] flex items-center justify-center shadow-xl shadow-blue-500/30">
              <span className="font-fredoka font-semibold text-white text-4xl uppercase">{initial}</span>
            </div>
            <div>
              <p className="font-nunito text-white/40 text-xs uppercase tracking-widest mb-1">My Account</p>
              <h1 className="font-fredoka text-3xl font-semibold text-white">{user.email?.split("@")[0]}</h1>
              <p className="font-nunito text-white/40 text-sm">{user.email}</p>
            </div>
          </div>

          {/* Stats + logout */}
          <div className="flex flex-col items-end gap-3">
            <LogoutButton />
            <div className="flex items-center gap-3">
              <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-3 text-center">
                <p className="font-fredoka text-2xl font-semibold text-white">{posts.length}</p>
                <p className="font-nunito text-xs text-white/40">Total Posts</p>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-3 text-center">
                <p className="font-fredoka text-2xl font-semibold text-red-400">{activePosts.length}</p>
                <p className="font-nunito text-xs text-white/40">Active</p>
              </div>
              <div className="bg-white/10 border border-white/10 rounded-2xl px-5 py-3 text-center">
                <p className="font-fredoka text-2xl font-semibold text-pink-400">{reunitedPosts.length}</p>
                <p className="font-nunito text-xs text-white/40">Reunited</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* New Post CTA */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-fredoka text-2xl font-semibold text-gray-900">My Reports</h2>
          <Link
            href="/report"
            className="flex items-center gap-2 bg-[#1c314e] hover:bg-blue-600 text-white font-fredoka font-semibold text-base px-5 py-2.5 rounded-full transition-all shadow-md"
          >
            <Plus className="w-4 h-4" /> New Report
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-16 text-center">
            <p className="text-6xl mb-4">🐾</p>
            <h3 className="font-fredoka text-2xl font-semibold text-gray-800 mb-2">No reports yet</h3>
            <p className="font-nunito text-gray-400 text-sm mb-6">Post your first lost or found pet listing to get started.</p>
            <Link href="/report" className="inline-flex items-center gap-2 bg-[#1c314e] hover:bg-blue-600 text-white font-fredoka font-semibold text-base px-6 py-3 rounded-full transition-all">
              <Plus className="w-4 h-4" /> Create a Report
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const s = STATUS_CONFIG[post.status] ?? STATUS_CONFIG.lost;
              const emoji = SPECIES_EMOJI[post.species] ?? "🐾";
              const date = new Date(post.last_seen_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              const posted = new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

              return (
                <div key={post.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow">
                  {/* Photo */}
                  <div className="relative w-full sm:w-36 h-36 bg-gray-100 shrink-0">
                    {post.photo_url ? (
                      <Image src={post.photo_url} alt={post.name ?? post.species} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">{emoji}</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-fredoka font-semibold text-xs px-2.5 py-1 rounded-full ${s.pill}`}>{s.label}</span>
                        <span className="font-nunito text-xs text-gray-400">Posted {posted}</span>
                      </div>
                      <h3 className="font-fredoka text-xl font-semibold text-gray-900 truncate">
                        {post.name ?? (post.species.charAt(0).toUpperCase() + post.species.slice(1))}
                        {post.breed && <span className="text-gray-400 font-normal text-base ml-2">{post.breed}</span>}
                      </h3>
                      <div className="flex items-center gap-4 mt-1.5">
                        <span className="flex items-center gap-1 font-nunito text-xs text-gray-400">
                          <MapPin className="w-3 h-3 text-blue-400" /> {post.borough}
                        </span>
                        <span className="flex items-center gap-1 font-nunito text-xs text-gray-400">
                          <Calendar className="w-3 h-3" /> {date}
                        </span>
                      </div>
                      <p className="font-nunito text-sm text-gray-400 mt-1.5 line-clamp-1">{post.description}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <Link
                        href={`/profile/edit/${post.id}`}
                        className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-nunito font-semibold text-sm px-4 py-2.5 rounded-full transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <Link
                        href={`/pet/${post.id}`}
                        className="flex items-center gap-1.5 bg-[#1c314e] hover:bg-blue-600 text-white font-nunito font-semibold text-sm px-4 py-2.5 rounded-full transition-colors"
                      >
                        View <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
