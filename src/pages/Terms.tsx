import InfoPage from "../components/InfoPage";

export default function Terms() {
  return (
    <InfoPage
      title="Terms of Service"
      subtitle="Last updated November 2026"

      showLogo
      centerHeader
    >
      <Section title="1. Acceptance of Terms">
        By creating an account or using nyc.pet, you agree to these Terms of Service. If you do not agree, please do not use the platform.
      </Section>

      <Section title="2. Who Can Use nyc.pet">
        nyc.pet is open to anyone. You must provide accurate information when creating an account. You are responsible for maintaining the security of your account.
      </Section>

      <Section title="3. Reporting Pets">
        You may only submit reports for real lost or found pets. False, misleading, or fraudulent reports are strictly prohibited and may result in account suspension. You must have the right to share any photos you upload.
      </Section>

      <Section title="4. Privacy & Contact Information">
        nyc.pet uses in-app messaging to protect your privacy. Any optional contact information you provide (phone, email, social media) is shared at your own discretion. We do not sell or share your personal data with third parties.
      </Section>

      <Section title="5. User Content">
        By submitting a report, you grant nyc.pet a non-exclusive license to display your content on the platform for the purpose of reuniting pets with their owners. You retain ownership of your photos and information.
      </Section>

      <Section title="6. Prohibited Conduct">
        You agree not to use nyc.pet to harass, defraud, or harm others; post spam or irrelevant content; impersonate other users; or violate any applicable law. Violations may result in immediate account termination.
      </Section>

      <Section title="7. Disclaimer">
        nyc.pet is a free community tool provided as-is. We make no guarantees about the accuracy of reports or successful reunions. We are not liable for any damages arising from use of the platform.
      </Section>

      <Section title="8. Changes to These Terms">
        We may update these terms from time to time. Continued use of nyc.pet after changes constitutes acceptance of the new terms.
      </Section>

      <Section title="9. Contact">
        Questions about these terms? Email us at <strong>hello@nyc.pet</strong>.
      </Section>

      {/* Privacy Policy */}
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid #f0f0f0" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111", marginBottom: 16 }}>Privacy Policy</h2>
      </div>

      <Section title="What We Collect">
        We collect your email address when you create an account. We collect the information you voluntarily provide in pet reports (name, location, photos, contact info). We use Supabase for authentication and data storage.
      </Section>

      <Section title="How We Use It">
        Your information is used solely to operate the nyc.pet platform — displaying reports, enabling messaging between users, and allowing you to manage your account.
      </Section>

      <Section title="Cloudflare Turnstile">
        When creating an account, we use Cloudflare Turnstile for bot protection. Turnstile may collect limited technical data to verify you are human. See{" "}
        <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer"
          style={{ color: "#1c314e", fontWeight: 700 }}>
          Cloudflare's Privacy Policy
        </a>
        {" "}for details.
      </Section>

      <Section title="Data Retention">
        You may delete your reports at any time from your Profile page. To delete your account, contact us at hello@nyc.pet.
      </Section>
    </InfoPage>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 15, fontWeight: 800, color: "#111", marginBottom: 8 }}>{title}</h2>
      <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8 }}>{children}</p>
    </div>
  );
}
