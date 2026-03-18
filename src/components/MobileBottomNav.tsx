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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
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
                <div className="w-12 h-12 rounded-full bg-[#1c314e] flex items-center justify-center shadow-lg -mt-5 border-4 border-white">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-nunito font-semibold text-[10px] text-[#1c314e] -mt-1">
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
                active ? "text-[#1c314e]" : "text-gray-400"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${active ? "scale-110" : ""}`} />
                {tab.live && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 border border-white" />
                )}
              </div>
              <span className={`font-nunito font-semibold text-[10px] ${active ? "text-[#1c314e]" : "text-gray-400"}`}>
                {tab.label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-[#1c314e]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
