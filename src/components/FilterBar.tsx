"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const BOROUGHS = ["All", "Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];
const SPECIES = ["All", "Dog", "Cat", "Bird", "Rabbit", "Other"];
const STATUSES = [
  { value: "all", label: "All", labelFull: "Lost & Found" },
  { value: "lost", label: "Lost", labelFull: "Lost" },
  { value: "found", label: "Found", labelFull: "Found" },
  { value: "reunited", label: "Reunited 🎉", labelFull: "Reunited 🎉" },
];

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? "all";
  const borough = searchParams.get("borough") ?? "All";
  const species = searchParams.get("species") ?? "All";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all" || value === "All") {
        params.delete(key);
      } else {
        params.set(key, value.toLowerCase());
      }
      router.push(`/?${params.toString()}#listings`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Status pills */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1.5">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => updateFilter("status", s.value)}
            className={`flex-1 font-nunito font-bold text-xs sm:text-sm px-2 sm:px-4 py-2 rounded-full transition-all whitespace-nowrap ${
              status === s.value
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:bg-white/60 hover:text-gray-800"
            }`}
          >
            <span className="sm:hidden">{s.label}</span>
            <span className="hidden sm:inline">{s.labelFull}</span>
          </button>
        ))}
      </div>

      {/* Borough + Species row */}
      <div className="flex gap-2">
        <div className="flex-1 bg-gray-100 rounded-full p-1.5">
          <select
            value={borough}
            onChange={(e) => updateFilter("borough", e.target.value)}
            className="w-full font-nunito font-bold text-xs sm:text-sm px-3 py-2 rounded-full bg-transparent text-gray-600 focus:outline-none cursor-pointer"
          >
            {BOROUGHS.map((b) => (
              <option key={b} value={b}>{b === "All" ? "All Boroughs" : b}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 bg-gray-100 rounded-full p-1.5">
          <select
            value={species.charAt(0).toUpperCase() + species.slice(1)}
            onChange={(e) => updateFilter("species", e.target.value)}
            className="w-full font-nunito font-bold text-xs sm:text-sm px-3 py-2 rounded-full bg-transparent text-gray-600 focus:outline-none cursor-pointer"
          >
            {SPECIES.map((s) => (
              <option key={s} value={s}>{s === "All" ? "All Animals" : s + "s"}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
