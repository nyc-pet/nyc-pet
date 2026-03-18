import type { Metadata } from "next";
import Link from "next/link";
import { Heart, MapPin, Shield, Users } from "lucide-react";
import PawIcon from "@/components/PawIcon";

export const metadata: Metadata = {
  title: "About — nyc.pet",
  description: "About nyc.pet — NYC's community-powered lost and found platform for pets.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#E2E8F0]">
      {/* Hero */}
      <div className="bg-[#020617] text-white pt-48 pb-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-white text-3xl font-fredoka font-semibold mb-6">
            <PawIcon className="w-7 h-7" /> nyc.pet
          </div>
          <h1 className="font-fredoka text-5xl font-semibold mb-4">About nyc.pet</h1>
          <p className="font-nunito text-white/70 text-lg max-w-xl mx-auto leading-relaxed">
            NYC&apos;s free, community-powered platform helping reunite lost pets with their families across all five boroughs.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">

        {/* Mission */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10">
          <h2 className="font-fredoka text-3xl font-semibold text-[#020617] mb-4 flex items-center gap-2">
            <Heart className="w-7 h-7 text-[#1c314e]" /> Our Mission
          </h2>
          <p className="font-nunito text-gray-600 leading-relaxed mb-4">
            Every year, thousands of pets go missing in New York City. Posters get torn down by rain. Facebook posts get buried in feeds. Craigslist listings get lost in spam.
          </p>
          <p className="font-nunito text-gray-600 leading-relaxed mb-4">
            We built nyc.pet to fix that — a dedicated, free, and easy-to-use platform where New Yorkers can post and browse lost & found pet listings, see exactly where pets were last spotted on a live map, and get reunited faster.
          </p>
          <p className="font-nunito text-gray-600 leading-relaxed">
            No ads. No paywalls. No accounts required to browse. Just a community helping pets get home.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: <MapPin className="w-6 h-6" />, title: "Hyperlocal", desc: "Built specifically for NYC. Every borough, every neighborhood." },
            { icon: <Shield className="w-6 h-6" />, title: "Safe & Trusted", desc: "Magic link auth means only real owners can manage their listings." },
            { icon: <Users className="w-6 h-6" />, title: "Community First", desc: "Free forever. Built by New Yorkers, for New Yorkers and their pets." },
          ].map((v) => (
            <div key={v.title} className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-blue-50 text-[#1c314e] rounded-full flex items-center justify-center mx-auto mb-3">
                {v.icon}
              </div>
              <h3 className="font-fredoka text-lg font-semibold text-[#020617] mb-1">{v.title}</h3>
              <p className="font-nunito text-gray-500 text-sm">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* How it started */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10">
          <h2 className="font-fredoka text-3xl font-semibold text-[#020617] mb-4">How It Started</h2>
          <p className="font-nunito text-gray-600 leading-relaxed mb-4">
            nyc.pet started with a simple domain and a simple idea — New York City has millions of pet owners and no dedicated place to go when a pet goes missing.
          </p>
          <p className="font-nunito text-gray-600 leading-relaxed">
            We wanted to build something that actually works: a clean map view showing exactly where pets were last seen, filtered by borough and species, with a simple form anyone can fill out in under two minutes. No account needed to browse. No fees. Ever.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-[#020617] rounded-3xl p-8 sm:p-10 text-center text-white">
          <h2 className="font-fredoka text-3xl font-semibold mb-3">Get in Touch</h2>
          <p className="font-nunito text-white/70 mb-6">Have a question, suggestion, or want to partner with us?</p>
          <a
            href="mailto:hello@nyc.pet"
            className="inline-flex items-center gap-2 bg-[#1c314e] text-white font-fredoka font-medium px-6 py-3 rounded-full hover:bg-blue-600 transition-colors"
          >
            hello@nyc.pet
          </a>
        </div>

        <div className="text-center pb-4">
          <Link href="/" className="inline-flex items-center gap-2 text-[#1c314e] font-fredoka font-medium hover:underline">
            <PawIcon className="w-4 h-4" /> Back to nyc.pet
          </Link>
        </div>
      </div>
    </main>
  );
}
