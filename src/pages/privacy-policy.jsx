import LandingLegalShell from "@/components/landing/LandingLegalShell";

export default function PrivacyPolicy() {
  return (
    <LandingLegalShell
      title="Privacy Policy"
      seoTitle="Privacy Policy – Designfolio"
      seoDescription="Learn how Designfolio collects, uses, and protects your personal data."
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
        <h2>Introduction</h2>
        <p>
          Welcome to Designfolio. We respect your privacy and are committed to
          protecting your personal data. This privacy policy will inform you
          about how we look after your personal data when you visit our website
          and tell you about your privacy rights.
        </p>
      </section>

      <section>
        <h2>Information We Collect</h2>
        <p>
          We may collect, use, store and transfer different kinds of personal
          data about you:
        </p>
        <ul>
          <li>Identity Data: username, email address</li>
          <li>Technical Data: IP address, browser type, device information</li>
          <li>
            Usage Data: information about how you use our website and services
          </li>
          <li>
            Portfolio Content: work samples, images, and other content you
            upload
          </li>
        </ul>
      </section>

      <section>
        <h2>How We Use Your Information</h2>
        <p>We use your personal data for the following purposes:</p>
        <ul>
          <li>To provide and maintain our service</li>
          <li>To manage your account and portfolio</li>
          <li>To communicate with you about updates and support</li>
          <li>To improve our website and services</li>
          <li>To detect and prevent fraud or abuse</li>
        </ul>
      </section>

      <section>
        <h2>Data Sharing</h2>
        <p>
          We do not sell your personal data. We may share your information with
          trusted third-party service providers who assist us in operating our
          website, conducting our business, or servicing you, so long as those
          parties agree to keep this information confidential.
        </p>
      </section>

      <section>
        <h2>Data Security</h2>
        <p>
          We have implemented appropriate security measures to prevent your
          personal data from being accidentally lost, used, or accessed in an
          unauthorized way. We limit access to your personal data to those
          employees and partners who have a business need to know.
        </p>
      </section>

      <section>
        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Object to processing of your data</li>
          <li>Request transfer of your data</li>
          <li>Withdraw consent at any time</li>
        </ul>
      </section>

      <section>
        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us
          at{" "}
          <a href="mailto:shai@designfolio.me">shai@designfolio.me</a>
        </p>
      </section>
    </LandingLegalShell>
  );
}

export function getStaticProps() {
  return { props: { hideHeader: true } };
}
