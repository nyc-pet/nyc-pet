"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X, LogOut, Search } from "lucide-react";
import Image from "next/image";
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
  const bg     = solid ? "shadow-sm" : "bg-transparent";
  const logo   = solid ? "text-[#1c314e]" : "text-white";
  const pill   = solid ? "bg-gray-100" : "bg-white/20 backdrop-blur-sm";
  const link   = solid ? "text-gray-600 hover:bg-white hover:text-gray-900" : "text-white hover:bg-white/20";
  const active = solid ? "bg-white text-gray-900 shadow-sm" : "bg-white text-gray-800 shadow-sm";
  const cta    = solid ? "bg-[#1c314e] text-white hover:bg-[#1c314e]/80" : "bg-white text-[#1c314e] hover:bg-blue-50";
  const ctaIcon= solid ? "bg-white/20 text-white" : "bg-[#1c314e] text-white group-hover:bg-[#1c314e]/80";
  const ham    = solid ? "bg-gray-100 text-gray-700 hover:bg-gray-200" : "bg-white/20 text-white hover:bg-white/30";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bg}`}
        style={solid ? { background: "linear-gradient(135deg, #ffffff 0%, #b8d4ee 100%)" } : {}}
      >
        <div className="w-full px-6 flex items-center justify-between gap-4 py-2">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src="/new-logo-nyc-pet.png"
              alt="nyc.pet"
              width={200}
              height={74}
              className="h-14 w-auto transition-all duration-300"
              style={{ filter: solid ? "brightness(0)" : "brightness(0) invert(1)" }}
            />
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
        className={`fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Slide-in drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] z-[9999] flex flex-col transition-transform duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
        style={{ background: "linear-gradient(160deg, #0f1f33 0%, #020617 60%)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-12 pb-6">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <Image
              src="/new-logo-nyc-pet.png"
              alt="nyc.pet"
              width={200}
              height={74}
              className="h-20 w-auto"
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </Link>
          <button onClick={() => setMenuOpen(false)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big CTA buttons */}
        <div className="px-6 pb-6 grid grid-cols-2 gap-3">
          <Link href="/#listings" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 bg-white/10 hover:bg-white/15 rounded-2xl px-4 py-4 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-fredoka font-semibold text-white text-base leading-tight">Find Pets</p>
              <p className="font-nunito text-white/40 text-xs">Browse listings</p>
            </div>
          </Link>
          <Link href="/map" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-3 bg-white/10 hover:bg-white/15 rounded-2xl px-4 py-4 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400" />
              </span>
            </div>
            <div>
              <p className="font-fredoka font-semibold text-white text-base leading-tight">Live Map</p>
              <p className="font-nunito text-white/40 text-xs">NYC pets</p>
            </div>
          </Link>
          <Link href="/report" onClick={() => setMenuOpen(false)}
            className="col-span-2 flex items-center justify-between bg-[#1c314e] hover:bg-[#1c314e]/80 rounded-2xl px-5 py-4 transition-colors">
            <div>
              <p className="font-fredoka font-semibold text-white text-lg leading-tight">Report a Pet</p>
              <p className="font-nunito text-white/50 text-xs">Lost or found a pet?</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
          </Link>
        </div>

        {/* Divider */}
        <div className="mx-6 border-t border-white/10" />

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div>
            <p className="font-nunito text-xs font-bold tracking-widest uppercase text-white/25 mb-3">Browse</p>
            <div className="space-y-0.5">
              {browseLinks.map((l) => (
                <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between font-fredoka font-semibold text-xl text-white/60 hover:text-white py-3 border-b border-white/5 transition-colors group">
                  {l.label}
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="font-nunito text-xs font-bold tracking-widest uppercase text-white/25 mb-3">Company</p>
            <div className="space-y-0.5">
              {companyLinks.map((l) => (
                <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between font-fredoka font-semibold text-xl text-white/60 hover:text-white py-3 border-b border-white/5 transition-colors group">
                  {l.label}
                  <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer / Auth */}
        <div className="px-6 py-6 border-t border-white/10">
          {userEmail ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#1c314e] border-2 border-white/20 flex items-center justify-center shrink-0">
                  <span className="font-fredoka font-semibold text-white text-lg uppercase">{userEmail.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-fredoka font-semibold text-white text-base">My Account</p>
                  <p className="font-nunito text-white/40 text-xs truncate">{userEmail}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/profile" onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-nunito font-semibold text-sm py-3 rounded-2xl transition-colors">
                  My Profile
                </Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 font-nunito font-semibold text-sm py-3 rounded-2xl transition-colors">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-nunito font-semibold text-base py-3.5 rounded-2xl transition-all"
            >
              Sign In to your account
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
