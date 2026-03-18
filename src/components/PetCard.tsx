import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, ArrowUpRight } from "lucide-react";
import type { PetPost } from "@/lib/types";

const STATUS_STYLES: Record<string, { pill: string; dot: string; label: string }> = {
  lost:     { pill: "bg-red-500 text-white",   dot: "bg-red-400",   label: "Lost" },
  found:    { pill: "bg-green-500 text-white",  dot: "bg-green-400", label: "Found" },
  reunited: { pill: "bg-blue-500 text-white",   dot: "bg-blue-400",  label: "Reunited 🎉" },
};

const SPECIES_EMOJI: Record<string, string> = {
  dog: "🐕",
  cat: "🐈",
  bird: "🐦",
  rabbit: "🐇",
  other: "🐾",
};

export default function PetCard({ post }: { post: PetPost }) {
  const s = STATUS_STYLES[post.status] ?? STATUS_STYLES.lost;
  const emoji = SPECIES_EMOJI[post.species] ?? "🐾";
  const dateFormatted = new Date(post.last_seen_date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <Link
      href={`/pet/${post.id}`}
      className="group block bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-56 bg-gray-100 overflow-hidden">
        {post.photo_url ? (
          <Image
            src={post.photo_url}
            alt={post.name ?? post.species}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-7xl bg-gradient-to-br from-gray-50 to-gray-100">
            {emoji}
          </div>
        )}

        {/* Status badge */}
        <span className={`absolute top-3 left-3 flex items-center gap-1.5 text-xs font-fredoka font-semibold px-3 py-1.5 rounded-full shadow ${s.pill}`}>
          <span className={`w-1.5 h-1.5 rounded-full bg-white/70 inline-block`} />
          {s.label}
        </span>

        {/* Arrow icon on hover */}
        <span className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ArrowUpRight className="w-4 h-4 text-gray-700" />
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Name + breed */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-fredoka font-semibold text-gray-900 text-xl leading-tight">
            {post.name
              ? <>{post.name} <span className="text-gray-400 font-normal">· {post.species.charAt(0).toUpperCase() + post.species.slice(1)}</span></>
              : post.species.charAt(0).toUpperCase() + post.species.slice(1)
            }
          </h3>
          {post.breed && (
            <span className="shrink-0 text-xs font-nunito font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
              {post.breed}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="font-nunito text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
          {post.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-nunito text-xs font-semibold text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-[#1c314e]" />
              {post.borough}
            </span>
            <span className="flex items-center gap-1.5 font-nunito text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              {dateFormatted}
            </span>
          </div>
          <span className="font-nunito text-xs font-semibold text-[#1c314e] group-hover:underline">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
