import type { Metadata } from "next";
import Link from "next/link";
import PawIcon from "@/components/PawIcon";

export const metadata: Metadata = {
  title: "Terms of Service — nyc.pet",
  description: "Terms of Service for nyc.pet — Lost & Found Pets in New York City.",
};

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using nyc.pet ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. We reserve the right to update these terms at any time, and continued use of the Service constitutes acceptance of any changes.`,
  },
  {
    title: "2. Description of Service",
    content: `nyc.pet is a community platform that allows users to post and browse listings for lost and found pets in New York City. The Service is provided free of charge and is intended solely to help reunite pets with their owners. We do not guarantee the accuracy, completeness, or reliability of any listing posted on the platform.`,
  },
  {
    title: "3. User Accounts & Magic Link Authentication",
    content: `To post a listing, you must authenticate via a magic link sent to your email address. You are responsible for maintaining the security of your email account and any access links. You may not share your authentication link with others. We reserve the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    title: "4. User Content",
    content: `By posting content on nyc.pet (including text, photos, and contact information), you grant us a non-exclusive, royalty-free license to display and distribute that content on the platform. You represent that you have the right to post such content and that it does not violate any third-party rights. You are solely responsible for the accuracy of your listings. Do not post false, misleading, or fraudulent information.`,
  },
  {
    title: "5. Prohibited Conduct",
    content: `You agree not to: (a) post false or misleading listings; (b) use the platform for commercial solicitation or advertising unrelated to lost/found pets; (c) harass, threaten, or harm other users; (d) collect personal information from other users without consent; (e) attempt to circumvent security measures; (f) use the Service for any unlawful purpose. Violations may result in immediate removal of content and termination of access.`,
  },
  {
    title: "6. Privacy & Personal Information",
    content: `When you post a listing, your name, email address, and optionally your phone number are visible to other users. Only post contact information you are comfortable sharing publicly. We use your email solely to authenticate your account and send notifications related to your listings. We do not sell your personal information to third parties. Please review our Privacy Policy for full details.`,
  },
  {
    title: "7. Pet Listings & Safety",
    content: `nyc.pet is not responsible for the outcome of any pet transactions or interactions between users. When meeting someone in connection with a listing, we strongly recommend meeting in a public place. We are not liable for any harm, loss, or injury arising from interactions facilitated through the platform. Never share your home address in a public listing.`,
  },
  {
    title: "8. Photo Uploads",
    content: `By uploading a photo, you confirm that you own the rights to that image or have permission to use it. Do not upload photos of people without their consent. Photos must be appropriate and relevant to the pet listing. We reserve the right to remove any photos that violate these guidelines.`,
  },
  {
    title: "9. Disclaimer of Warranties",
    content: `nyc.pet is provided "as is" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of viruses. We make no guarantees that any lost pet will be found or that any found pet will be claimed.`,
  },
  {
    title: "10. Limitation of Liability",
    content: `To the fullest extent permitted by law, nyc.pet and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of the Service, including but not limited to loss of data, personal injury, or financial loss. Our total liability shall not exceed $100.`,
  },
  {
    title: "11. Governing Law",
    content: `These Terms shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved in the courts located in New York County, New York.`,
  },
  {
    title: "12. Contact",
    content: `If you have any questions about these Terms of Service, please contact us at legal@nyc.pet.`,
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#E2E8F0]">
      {/* Header */}
      <div className="bg-[#020617] text-white pt-48 pb-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-white text-3xl font-fredoka font-semibold mb-4">
            <PawIcon className="w-7 h-7" />
            nyc.pet
          </div>
          <h1 className="font-fredoka text-5xl font-semibold mb-3">Terms of Service</h1>
          <p className="font-nunito text-white/60 text-sm">
            Last updated: March 17, 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-12 space-y-8">

          <p className="font-nunito text-gray-500 text-sm leading-relaxed border-l-4 border-[#1c314e] pl-4 bg-blue-50 py-3 pr-4 rounded-r-xl">
            Please read these Terms of Service carefully before using nyc.pet. These terms govern your use of our platform and outline your rights and responsibilities as a user.
          </p>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h2 className="font-fredoka text-xl font-semibold text-[#020617] mb-2">
                {section.title}
              </h2>
              <p className="font-nunito text-gray-600 text-sm leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}

          <div className="border-t border-gray-100 pt-8 text-center">
            <p className="font-nunito text-gray-400 text-sm mb-4">
              By using nyc.pet, you acknowledge that you have read and understood these Terms.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#1c314e] text-white font-fredoka font-medium px-6 py-3 rounded-full hover:bg-blue-600 transition-colors"
            >
              <PawIcon className="w-4 h-4" /> Back to nyc.pet
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
