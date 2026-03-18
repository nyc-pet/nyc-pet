"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const BOROUGHS = ["All", "Manhattan", "Brooklyn", "Queens", "Bronx", "Staten Island"];
const SPECIES  = ["All", "Dog", "Cat", "Bird", "Rabbit", "Other"];
const STATUSES = [
  { value: "all",      label: "All" },
  { value: "lost",     label: "Lost" },
  { value: "found",    label: "Found" },
  { value: "reunited", label: "Reunited" },
];

export default function MapFilterBar() {
  const router      = useRouter();
  const searchParams = useSearchParams();

  const status  = searchParams.get("status")  ?? "all";
  const borough = searchParams.get("borough") ?? "All";
  const species = searchParams.get("species") ?? "All";

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all" || value === "All") {
        params.delete(key);
      } else {
        params.set(key, value.toLowerCase());
      }
      router.push(`/map?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex items-center gap-2">
      {/* Status pills */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            onClick={() => update("status", s.value)}
            className={`font-nunito font-semibold text-xs px-3 py-1.5 rounded-full transition-all whitespace-nowrap ${
              status === s.value
                ? "bg-white shadow text-gray-900"
                : "text-gray-500 hover:bg-white/60"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Borough */}
      <div className="bg-gray-100 rounded-full px-3 py-1.5">
        <select
          value={borough}
          onChange={(e) => update("borough", e.target.value)}
          className="font-nunito font-semibold text-xs bg-transparent text-gray-600 focus:outline-none cursor-pointer"
        >
          {BOROUGHS.map((b) => (
            <option key={b} value={b}>{b === "All" ? "All Boroughs" : b}</option>
          ))}
        </select>
      </div>

      {/* Species */}
      <div className="bg-gray-100 rounded-full px-3 py-1.5">
        <select
          value={species.charAt(0).toUpperCase() + species.slice(1)}
          onChange={(e) => update("species", e.target.value)}
          className="font-nunito font-semibold text-xs bg-transparent text-gray-600 focus:outline-none cursor-pointer"
        >
          {SPECIES.map((s) => (
            <option key={s} value={s}>{s === "All" ? "All Animals" : s + "s"}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
