import type { Metadata } from "next";
import Link from "next/link";
import PawIcon from "@/components/PawIcon";

export const metadata: Metadata = {
  title: "Privacy Policy — nyc.pet",
  description: "Privacy Policy for nyc.pet — how we collect, use, and protect your information.",
};

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: `We collect your email address when you sign in via magic link. When you post a listing, we collect the information you provide including pet details, last seen location, your name, email, and optionally your phone number and a photo. We also collect standard server logs including IP addresses and browser information.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your email to authenticate your account and send you a sign-in link. Your contact information on listings is displayed publicly so other users can reach you about a pet. We do not use your information for marketing purposes unless you explicitly opt in. We do not sell, rent, or share your personal data with third parties.`,
  },
  {
    title: "3. Public Information",
    content: `Information you include in a pet listing — including your name, email address, phone number, and pet photo — is publicly visible on the platform. Please only include information you are comfortable sharing publicly. You can delete your listings at any time to remove this information.`,
  },
  {
    title: "4. Cookies & Local Storage",
    content: `We use cookies and local storage to maintain your authentication session. These are essential for the platform to function. We do not use advertising cookies or third-party tracking cookies. You can clear cookies at any time through your browser settings, which will sign you out.`,
  },
  {
    title: "5. Data Storage & Security",
    content: `Your data is stored securely using Supabase, hosted on AWS infrastructure. We use industry-standard encryption for data in transit (HTTPS) and at rest. While we take reasonable steps to protect your data, no system is 100% secure and we cannot guarantee absolute security.`,
  },
  {
    title: "6. Data Retention",
    content: `Pet listings remain active until you mark them as reunited or delete them. We may automatically archive listings older than 90 days. You can request deletion of your account and all associated data by emailing privacy@nyc.pet. We will process deletion requests within 30 days.`,
  },
  {
    title: "7. Children's Privacy",
    content: `nyc.pet is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.`,
  },
  {
    title: "8. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify users of significant changes by posting a notice on the platform. Continued use of nyc.pet after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "9. Contact Us",
    content: `If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us at privacy@nyc.pet. For users in the European Union, you have additional rights under GDPR including the right to access, correct, or delete your personal data.`,
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#E2E8F0]">
      <div className="bg-[#020617] text-white pt-48 pb-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-white text-3xl font-fredoka font-semibold mb-4">
            <PawIcon className="w-7 h-7" /> nyc.pet
          </div>
          <h1 className="font-fredoka text-5xl font-semibold mb-3">Privacy Policy</h1>
          <p className="font-nunito text-white/60 text-sm">Last updated: March 17, 2026</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 space-y-8">
          <p className="font-nunito text-gray-500 text-sm leading-relaxed border-l-4 border-[#1c314e] pl-4 bg-blue-50 py-3 pr-4 rounded-r-xl">
            Your privacy matters to us. This policy explains what data we collect, why we collect it, and how we protect it.
          </p>
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="font-fredoka text-xl font-semibold text-[#020617] mb-2">{section.title}</h2>
              <p className="font-nunito text-gray-600 text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 bg-[#1c314e] text-white font-fredoka font-medium px-6 py-3 rounded-full hover:bg-blue-600 transition-colors">
              <PawIcon className="w-4 h-4" /> Back to nyc.pet
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
