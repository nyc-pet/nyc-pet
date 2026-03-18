"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X, LogOut, Search } from "lucide-react";
import PawIcon from "./PawIcon";
import { createClient } from "@/lib/supabase-browser";

// Pages where the navbar should always be solid (no hero behind it)
const SOLID_NAV_PATHS = ["/map", "/login", "/report", "/profile", "/about", "/contact", "/terms", "/privacy"];

const browseLinks = [
  { label: "All Pets",    href: "/#listings" },
  { label: "Lost Pets",   href: "/?status=lost#listings" },
  { label: "Found Pets",  href: "/?status=found#listings" },
  { label: "Reunited 🎉", href: "/?status=reunited#listings" },
];

const companyLinks = [
  { label: "About Us",        href: "/about" },
  { label: "Contact Us",      href: "/contact" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy",  href: "/privacy" },
];

interface Props {
  userEmail: string | null;
}

export default function NavbarClient({ userEmail }: Props) {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [isMobile,  setIsMobile]  = useState(false);
  const router   = useRouter();
  const pathname = usePathname();

  const isSolid = SOLID_NAV_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    const onResize = () => setIsMobile(window.innerWidth < 640);
    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  const solid  = isSolid || scrolled || isMobile;
  const bg     = solid ? "bg-white shadow-md border-b border-gray-100" : "bg-transparent";
  const logo   = solid ? "text-[#1c314e]" : "text-white";
  const pill   = solid ? "bg-gray-100" : "bg-white/20 backdrop-blur-sm";
  const link   = solid ? "text-gray-600 hover:bg-white hover:text-gray-900" : "text-white hover:bg-white/20";
  const active = solid ? "bg-white text-gray-900 shadow-sm" : "bg-white text-gray-800 shadow-sm";
  const cta    = solid ? "bg-[#1c314e] text-white hover:bg-[#1c314e]/80" : "bg-white text-[#1c314e] hover:bg-blue-50";
  const ctaIcon= solid ? "bg-white/20 text-white" : "bg-[#1c314e] text-white group-hover:bg-[#1c314e]/80";
  const ham    = solid ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-white/20 text-white hover:bg-white/30";

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bg}`}>
        <div className="w-full px-6 flex items-center justify-between gap-4 py-5">

          {/* Logo */}
          <Link href="/" className={`flex items-center gap-2.5 text-3xl font-fredoka font-semibold tracking-wide shrink-0 drop-shadow transition-colors ${logo}`}>
            <PawIcon size={32} color={solid ? "dark" : "white"} />
            nyc.pet
          </Link>

          {/* Center nav pills */}
          <div className={`hidden md:flex items-center gap-1 rounded-full p-1.5 transition-colors ${pill}`}>
            <Link href="/" className={`font-nunito font-bold text-sm px-4 py-2 rounded-full transition-all ${pathname === "/" ? active : link}`}>
              Home
            </Link>
            <Link href="/map" className={`font-nunito font-bold text-sm px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${pathname === "/map" ? active : link}`}>
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
              </span>
              Live Map
            </Link>
            {browseLinks.slice(1).map((l) => {
              const isActive = l.href.startsWith("/?status=") &&
                new URLSearchParams(l.href.split("?")[1]?.split("#")[0]).get("status") ===
                new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("status") &&
                pathname === "/";
              return (
                <Link key={l.href} href={l.href} className={`font-nunito font-bold text-sm px-4 py-2 rounded-full transition-all ${isActive ? active : link}`}>
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Right CTA */}
          <div className={`flex items-center gap-1 rounded-full p-1.5 shrink-0 transition-colors ${pill}`}>
            {userEmail ? (
              <Link href="/profile" className={`flex items-center gap-2 px-2 py-2 rounded-full transition-all ${link}`} title={`Profile: ${userEmail}`}>
                <div className="w-8 h-8 rounded-full bg-[#1c314e] flex items-center justify-center shrink-0">
                  <span className="font-fredoka font-semibold text-white text-sm uppercase">
                    {userEmail.charAt(0)}
                  </span>
                </div>
              </Link>
            ) : (
              <Link
                href="/login"
                className={`font-nunito font-bold text-sm px-4 py-2 rounded-full transition-all hidden sm:block ${link}`}
              >
                Sign In
              </Link>
            )}
            <Link
              href="/report"
              className={`flex items-center gap-2 font-fredoka font-semibold text-sm pl-3 sm:pl-5 pr-1.5 py-2 rounded-full transition-all shadow-md hover:shadow-lg group ${cta}`}
            >
              <span className="sm:hidden">Report</span>
              <span className="hidden sm:inline">Report a Pet</span>
              <span className={`rounded-full w-7 h-7 flex items-center justify-center transition-colors ${ctaIcon}`}>
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </Link>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={`flex items-center justify-center px-3 py-2 rounded-full transition-colors ${ham}`}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Backdrop */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Slide-in drawer from right */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-80 z-50 bg-[#020617] flex flex-col transition-transform duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-white text-xl font-fredoka font-semibold">
            <PawIcon size={20} color="white" />
            nyc.pet
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-8">

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-2">
            <Link href="/#listings" onClick={() => setMenuOpen(false)}
              className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl py-4 px-2 transition-colors">
              <Search className="w-5 h-5" />
              <span className="font-nunito font-semibold text-xs text-center leading-tight">Find Pets</span>
            </Link>
            <Link href="/report" onClick={() => setMenuOpen(false)}
              className="flex flex-col items-center gap-2 bg-[#1c314e] hover:bg-[#1c314e]/80 text-white rounded-2xl py-4 px-2 transition-colors">
              <ArrowUpRight className="w-5 h-5" />
              <span className="font-nunito font-semibold text-xs text-center leading-tight">Report a Pet</span>
            </Link>
            <Link href="/map" onClick={() => setMenuOpen(false)}
              className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-2xl py-4 px-2 transition-colors">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
              </span>
              <span className="font-nunito font-semibold text-xs text-center leading-tight">View Map</span>
            </Link>
          </div>

          <div>
            <p className="font-nunito text-xs font-semibold tracking-widest uppercase text-white/30 mb-4">Browse</p>
            <ul className="space-y-1">
              {browseLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} onClick={() => setMenuOpen(false)} className="font-nunito font-semibold text-lg text-white/70 hover:text-white py-2.5 block transition-colors border-b border-white/5">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-nunito text-xs font-semibold tracking-widest uppercase text-white/30 mb-4">Company</p>
            <ul className="space-y-1">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} onClick={() => setMenuOpen(false)} className="font-nunito font-semibold text-lg text-white/70 hover:text-white py-2.5 block transition-colors border-b border-white/5">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Drawer footer */}
        <div className="px-6 py-6 border-t border-white/10 flex flex-col gap-3">
          {/* Auth row */}
          {userEmail ? (
            <div className="bg-white/10 rounded-2xl p-3 space-y-2">
              <div className="flex items-center gap-3 px-1">
                <div className="w-9 h-9 rounded-full bg-[#1c314e] flex items-center justify-center shrink-0">
                  <span className="font-fredoka font-semibold text-white uppercase">{userEmail.charAt(0)}</span>
                </div>
                <span className="font-nunito text-sm text-white/60 truncate">{userEmail}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/profile" onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-nunito font-semibold text-sm py-2.5 rounded-xl transition-colors">
                  My Profile
                </Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white/60 font-nunito font-semibold text-sm py-2.5 rounded-xl transition-colors">
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-nunito font-semibold text-base py-3 rounded-2xl transition-all"
            >
              Sign In to your account
            </Link>
          )}

          <Link
            href="/report"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-between bg-[#1c314e] hover:bg-blue-600 text-white font-fredoka font-semibold text-lg px-6 py-4 rounded-2xl transition-all"
          >
            Report a Pet
            <span className="bg-white/20 rounded-full w-9 h-9 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
