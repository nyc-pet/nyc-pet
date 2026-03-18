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

export default function PetMapWrapper({ posts }: { posts: PetPost[] }) {
  return <PetMap posts={posts} />;
}
