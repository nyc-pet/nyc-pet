"use client";

import dynamic from "next/dynamic";
import type { PetPost } from "@/lib/types";

const PetMap = dynamic(() => import("@/components/PetMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
      Loading map…
    </div>
  ),
});

export default function PetMapWrapper({
  posts,
  interactive = true,
}: {
  posts: PetPost[];
  interactive?: boolean;
}) {
  return (
    <div className="relative w-full h-full">
      <PetMap posts={posts} />
      {/* On mobile, block touch so the page scrolls instead of the map */}
      {!interactive && (
        <div className="absolute inset-0 sm:hidden" style={{ touchAction: "pan-y" }} />
      )}
    </div>
  );
}
