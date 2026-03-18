"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-gray-500 font-nunito font-semibold text-sm px-5 py-2.5 rounded-full transition-all"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  );
}
