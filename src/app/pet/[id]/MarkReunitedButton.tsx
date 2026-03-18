"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function MarkReunitedButton({ postId, postUserId }: { postId: string; postUserId: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user && postUserId && user.id === postUserId) {
        setIsOwner(true);
      }
    });
  }, [postUserId]);

  if (!isOwner) return null;

  async function handleMark() {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    setLoading(true);
    const supabase = createClient();
    await supabase.from("pet_posts").update({ status: "reunited" }).eq("id", postId);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleMark}
      disabled={loading}
      className={`w-full py-3 rounded-2xl font-fredoka font-semibold text-base transition-all flex items-center justify-center gap-2 ${
        confirmed
          ? "bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-500/30"
          : "bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30"
      }`}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          <span>🩷</span>
          {confirmed ? "Yes, we found each other!" : "Mark as Reunited"}
        </>
      )}
    </button>
  );
}
