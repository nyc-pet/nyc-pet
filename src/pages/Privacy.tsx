import InfoPage from "../components/InfoPage";

export default function Privacy() {
  return (
    <InfoPage
      title="Privacy Policy"
      subtitle="Last updated November 2026"

      showLogo
      centerHeader
    >
      <Section title="What We Collect">
        We collect your email address when you create an account. We collect the information you voluntarily provide in pet reports — including pet name, location, photos, and optional contact info.
      </Section>

      <Section title="How We Use It">
        Your information is used solely to operate the nyc.pet platform: displaying reports, enabling messaging between users, and allowing you to manage your account. We do not sell or share your personal data with third parties.
      </Section>

      <Section title="Authentication">
        We use Supabase for secure authentication and data storage. Your password is never stored in plain text. See <a href="https://supabase.com/privacy" target="_blank" rel="noreferrer" style={{ color: "#1c314e", fontWeight: 700 }}>Supabase's Privacy Policy</a> for details on how they handle your data.
      </Section>

      <Section title="Bot Protection">
        When creating an account, we may use Cloudflare Turnstile for bot protection. Turnstile may collect limited technical data to verify you are human. See <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer" style={{ color: "#1c314e", fontWeight: 700 }}>Cloudflare's Privacy Policy</a> for details.
      </Section>

      <Section title="Photos & Media">
        Photos you upload are stored securely and displayed only within your pet report. You retain ownership of all photos you upload. We do not use your photos for advertising or any purpose beyond displaying your report.
      </Section>

      <Section title="Location Data">
        Location information (zip code, neighborhood, or map pin) is shared only within your pet report to help reunite pets with their owners. We do not track your real-time location.
      </Section>

      <Section title="Messaging">
        In-app messages between users are stored securely on our servers solely to deliver them. We do not read, sell, or analyze private messages.
      </Section>

      <Section title="Data Retention">
        You may delete your reports at any time from your Profile page. To fully delete your account and all associated data, use the Delete Account option in your Profile settings or contact us at <strong>hello@nyc.pet</strong>.
      </Section>

      <Section title="Cookies">
        We use minimal session cookies required for authentication. We do not use tracking or advertising cookies.
      </Section>

      <Section title="Children's Privacy">
        nyc.pet is not directed at children under 13. We do not knowingly collect personal information from children.
      </Section>

      <Section title="Changes to This Policy">
        We may update this policy from time to time. We'll update the date at the top of this page when we do. Continued use of nyc.pet after changes constitutes acceptance.
      </Section>

      <Section title="Contact">
        Questions about your privacy? Email us at <strong>hello@nyc.pet</strong>.
      </Section>
    </InfoPage>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 15, fontWeight: 800, color: "#111", marginBottom: 8 }}>{title}</h2>
      <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8, margin: 0 }}>{children}</p>
    </div>
  );
}
