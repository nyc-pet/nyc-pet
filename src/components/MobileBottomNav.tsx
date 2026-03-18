"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, MapPin, PlusCircle } from "lucide-react";

const TABS = [
  {
    label: "Find Pets",
    href: "/#listings",
    icon: Search,
    match: (p: string) => p === "/",
  },
  {
    label: "Report",
    href: "/report",
    icon: PlusCircle,
    match: (p: string) => p === "/report" || p.startsWith("/report"),
    cta: true,
  },
  {
    label: "Live Map",
    href: "/map",
    icon: MapPin,
    match: (p: string) => p === "/map",
    live: true,
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-[30px] overflow-hidden"
      style={{ background: "linear-gradient(160deg, #0f1f33 0%, #020617 60%)" }}
    >
      <div className="flex items-stretch h-16">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;

          if (tab.cta) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex-1 flex flex-col items-center justify-center gap-1 relative"
              >
                <div className="w-12 h-12 rounded-full bg-[#1c314e] border-2 border-white/20 flex items-center justify-center shadow-lg -mt-5">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-nunito font-semibold text-[10px] text-white/70 -mt-1">
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                active ? "text-white" : "text-white/40"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${active ? "scale-110" : ""}`} />
                {tab.live && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 border border-white/20" />
                )}
              </div>
              <span className={`font-nunito font-semibold text-[10px] ${active ? "text-white" : "text-white/40"}`}>
                {tab.label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-white/50" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
