"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Send, CheckCircle } from "lucide-react";
import PawIcon from "@/components/PawIcon";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`;
    const mailto = `mailto:hello@nyc.pet?subject=${encodeURIComponent(form.subject || "Contact from nyc.pet")}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSent(true);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#020617] pt-48 pb-16 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Mail className="w-5 h-5 text-blue-400" />
          <span className="font-nunito text-blue-400 text-xs font-semibold tracking-widest uppercase">Get in Touch</span>
        </div>
        <h1 className="font-fredoka text-5xl sm:text-6xl font-semibold text-white mb-3">Contact Us</h1>
        <p className="font-nunito text-white/50 text-base max-w-md mx-auto">
          Have a question, found a bug, or just want to say hi? We&apos;d love to hear from you.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* Sidebar info */}
        <div className="space-y-8">
          <div>
            <Link href="/" className="flex items-center gap-2 text-[#1c314e] text-xl font-fredoka font-semibold mb-4">
              <PawIcon className="w-5 h-5" /> nyc.pet
            </Link>
            <p className="font-nunito text-sm text-gray-500 leading-relaxed">
              We&apos;re a small community project dedicated to helping NYC pet owners reconnect with their lost companions.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="font-nunito font-semibold text-sm text-gray-800">Email us directly</p>
                <a href="mailto:hello@nyc.pet" className="font-nunito text-sm text-blue-500 hover:underline">hello@nyc.pet</a>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <p className="font-nunito text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2">Response time</p>
            <p className="font-nunito text-sm text-gray-600">We typically respond within 24–48 hours on business days.</p>
          </div>

          <div className="space-y-2">
            <p className="font-nunito text-xs font-semibold text-gray-400 uppercase tracking-wide">Quick links</p>
            {[
              { label: "About Us", href: "/about" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Privacy Policy", href: "/privacy" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="block font-nunito text-sm text-gray-500 hover:text-blue-500 transition-colors">
                {l.label} →
              </Link>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          {sent ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="font-fredoka text-3xl font-semibold text-gray-900 mb-2">Message Sent!</h2>
              <p className="font-nunito text-gray-500 mb-6">Your email client should have opened with your message pre-filled. We&apos;ll get back to you soon.</p>
              <button
                onClick={() => setSent(false)}
                className="font-nunito font-semibold text-sm text-blue-500 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-nunito text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Jane Smith"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 font-nunito text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder:text-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-nunito text-sm font-semibold text-gray-700 mb-1.5">Your Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="jane@example.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 font-nunito text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-nunito text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-nunito text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                >
                  <option value="">Select a subject…</option>
                  <option>General Question</option>
                  <option>Report a Bug</option>
                  <option>Remove a Post</option>
                  <option>Partnership / Media</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block font-nunito text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Tell us how we can help…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 font-nunito text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder:text-gray-300 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#1c314e] hover:bg-blue-600 text-white font-fredoka font-semibold text-lg py-4 rounded-2xl transition-all shadow-md hover:shadow-lg"
              >
                Send Message
                <Send className="w-5 h-5" />
              </button>

              <p className="font-nunito text-xs text-gray-400 text-center">
                This will open your email client with your message pre-filled to{" "}
                <span className="text-blue-400">hello@nyc.pet</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
