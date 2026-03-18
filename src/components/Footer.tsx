import Link from "next/link";
import Image from "next/image";
import { Mail, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#020617] text-white">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-3">
              <Image
                src="/new-logo-nyc-pet.png"
                alt="nyc.pet"
                width={220}
                height={82}
                className="h-16 w-auto"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </Link>
            <p className="font-nunito text-white/50 text-sm leading-relaxed max-w-xs">
              NYC&apos;s free community platform for lost & found pets. Helping reunite pets with their families across all five boroughs.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="mailto:hello@nyc.pet" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#1c314e] flex items-center justify-center transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#1c314e] flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#1c314e] flex items-center justify-center transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Browse */}
          <div>
            <h4 className="font-fredoka text-base font-semibold text-white mb-4 tracking-wide">Browse</h4>
            <ul className="space-y-2.5">
              {[
                { label: "All Pets", href: "/" },
                { label: "Lost Pets", href: "/?status=lost" },
                { label: "Found Pets", href: "/?status=found" },
                { label: "Reunited 🎉", href: "/?status=reunited" },
                { label: "Report a Pet", href: "/report" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="font-nunito text-sm text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-fredoka text-base font-semibold text-white mb-4 tracking-wide">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", href: "/about" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Contact Us", href: "/contact" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="font-nunito text-sm text-white/50 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Trust badges */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-nunito text-xs text-white/30">
            © {new Date().getFullYear()} nyc.pet — Made with ❤️ for NYC pet lovers. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="font-nunito text-xs text-white/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> Free to use
            </span>
            <span className="font-nunito text-xs text-white/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> No ads
            </span>
            <span className="font-nunito text-xs text-white/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> NYC based
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
