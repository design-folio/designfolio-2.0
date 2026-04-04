import LandingLegalShell from "@/components/landing/LandingLegalShell";

export default function TermsAndConditions() {
  return (
    <LandingLegalShell
      title="Terms & Conditions"
      seoTitle="Terms & Conditions – Designfolio"
      seoDescription="Read the Terms & Conditions for using Designfolio's portfolio builder platform."
    >
      <p className="text-sm text-[--lp-text-muted]">
        Last updated:{" "}
        {new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>

      <section>
        <h2>Agreement to Terms</h2>
        <p>
          By accessing and using Designfolio, you accept and agree to be bound
          by the terms and provision of this agreement. If you do not agree to
          abide by the above, please do not use this service.
        </p>
      </section>

      <section>
        <h2>Use of Service</h2>
        <p>
          Designfolio provides a platform for creating and hosting portfolio
          websites. You agree to:
        </p>
        <ul>
          <li>
            Provide accurate and complete information when creating your account
          </li>
          <li>Maintain the security of your account credentials</li>
          <li>Not use the service for any illegal or unauthorized purpose</li>
          <li>Not violate any laws in your jurisdiction</li>
          <li>
            Not upload content that infringes on intellectual property rights
          </li>
          <li>Not transmit viruses, malware, or any harmful code</li>
        </ul>
      </section>

      <section>
        <h2>Content Ownership</h2>
        <p>
          You retain all ownership rights to the content you upload to
          Designfolio. By uploading content, you grant us a license to store,
          display, and distribute your content as necessary to provide our
          services. We do not claim ownership of your portfolio content.
        </p>
      </section>

      <section>
        <h2>Account Termination</h2>
        <p>
          We reserve the right to terminate or suspend your account and access
          to the service immediately, without prior notice or liability, for any
          reason whatsoever, including without limitation if you breach the
          Terms. Upon termination, your right to use the service will
          immediately cease.
        </p>
      </section>

      <section>
        <h2>Limitation of Liability</h2>
        <p>
          Designfolio and its affiliates will not be liable for any indirect,
          incidental, special, consequential, or punitive damages resulting from
          your use or inability to use the service. We provide the service "as
          is" without warranties of any kind.
        </p>
      </section>

      <section>
        <h2>Modifications to Terms</h2>
        <p>
          We reserve the right to modify or replace these Terms at any time. If
          a revision is material, we will provide at least 30 days notice prior
          to any new terms taking effect. Your continued use of the service
          after such modifications constitutes acceptance of the updated terms.
        </p>
      </section>

      <section>
        <h2>Contact Information</h2>
        <p>
          If you have any questions about these Terms & Conditions, please
          contact us at{" "}
          <a href="mailto:shai@designfolio.me">shai@designfolio.me</a>
        </p>
      </section>
    </LandingLegalShell>
  );
}

export function getStaticProps() {
  return { props: { hideHeader: true } };
}
