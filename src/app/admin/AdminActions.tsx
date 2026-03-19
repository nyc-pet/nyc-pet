"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

export default function AdminActions({ postId, compact = false }: { postId: string; compact?: boolean }) {
  const [loading, setLoading] = useState<"approve" | "delete" | null>(null);
  const router = useRouter();

  async function callAdmin(action: "approve" | "delete") {
    setLoading(action);
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, postId }),
    });
    setLoading(null);
    if (!res.ok) {
      const { error } = await res.json();
      alert(`Error: ${error}`);
      return;
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this post permanently?")) return;
    callAdmin("delete");
  }

  if (compact) {
    return (
      <button
        onClick={handleDelete}
        disabled={!!loading}
        className="flex items-center gap-1 bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-600 font-nunito font-semibold text-xs px-3 py-2 rounded-full transition-colors"
      >
        <X className="w-3.5 h-3.5" />
        {loading === "delete" ? "Deleting…" : "Delete"}
      </button>
    );
  }

  return (
    <div className="flex sm:flex-col gap-2 shrink-0">
      <button
        onClick={() => callAdmin("approve")}
        disabled={!!loading}
        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-nunito font-semibold text-sm px-5 py-2.5 rounded-full transition-colors"
      >
        <Check className="w-4 h-4" />
        {loading === "approve" ? "Approving…" : "Approve"}
      </button>
      <button
        onClick={handleDelete}
        disabled={!!loading}
        className="flex items-center gap-1.5 bg-red-100 hover:bg-red-200 disabled:opacity-50 text-red-600 font-nunito font-semibold text-sm px-5 py-2.5 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
        {loading === "delete" ? "Deleting…" : "Reject"}
      </button>
    </div>
  );
}
