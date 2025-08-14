import styles from "@/styles/Policy.module.css";

export default function RefundPolicy() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <div className={styles.pageHeader}>
          <div className={styles.pageIcon}>💳</div>
          <h1>Refund Policy</h1>
          <p className={styles.lastUpdated}>Last updated: January 2025</p>
        </div>

        <section>
          <h2>1. Overview</h2>
          <p>
            At Designfolio, we want you to be completely satisfied with our
            service. This refund policy outlines the circumstances under which
            refunds may be provided.
          </p>
        </section>

        <section>
          <h2>2. No Money-Back Guarantee</h2>
          <p>
            Designfolio does not offer a money-back guarantee on subscription
            fees. All payments are final and non-refundable under normal
            circumstances.
          </p>
        </section>

        <section>
          <h2>3. Full Support Commitment</h2>
          <p>
            While we don't offer refunds, we are committed to providing full
            support to resolve any issues you may encounter with our service.
            Our support team will work diligently to:
          </p>
          <ul>
            <li>Address technical problems promptly</li>
            <li>Provide guidance on using platform features</li>
            <li>Assist with portfolio optimization</li>
            <li>Resolve any service-related concerns</li>
          </ul>
        </section>

        <section>
          <h2>4. Exceptional Circumstances</h2>
          <p>
            In rare cases involving significant service failures or technical
            issues that cannot be resolved, we may consider refunds on a
            case-by-case basis at our sole discretion.
          </p>
        </section>

        <section>
          <h2>5. Non-Refundable Items</h2>
          <p>
            The following are not eligible for refunds under any circumstances:
          </p>
          <ul>
            <li>
              Domain registration fees (handled by third-party registrars)
            </li>
            <li>Custom development work or services</li>
            <li>All subscription fees</li>
            <li>Services used in violation of our terms</li>
            <li>Accounts terminated for policy violations</li>
          </ul>
        </section>

        <section>
          <h2>6. Getting Support</h2>
          <h3>How to Request Help:</h3>
          <ol>
            <li>
              Contact our support team at{" "}
              <a href="mailto:shai@designfolio.me">shai@designfolio.me</a>
            </li>
            <li>Describe your issue or concern in detail</li>
            <li>Our team will respond within 24 hours</li>
            <li>We'll work with you to resolve the issue completely</li>
          </ol>
        </section>

        <section>
          <h2>7. Subscription Cancellations</h2>
          <p>
            You may cancel your subscription at any time. Cancellations will
            take effect at the end of the current billing period, and no refund
            will be provided for the remaining subscription time.
          </p>
        </section>

        <section>
          <h2>8. Modifications to Refund Policy</h2>
          <p>
            We reserve the right to modify this refund policy at any time.
            Changes will be effective immediately upon posting on our website.
          </p>
        </section>

        <section>
          <h2>9. Dispute Resolution</h2>
          <p>
            If you have any concerns or disputes, please contact our support
            team first. We are committed to resolving issues fairly and promptly
            through direct communication.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>
            For support requests or questions about this policy, please contact
            us:
          </p>
          <div className={styles.contactInfo}>
            <p>
              Email:{" "}
              <a href="mailto:shai@designfolio.me">shai@designfolio.me</a>
            </p>
            <p>
              Address: DOT Cowork, 1st Floor D Block (Module 115), TIDEL Park,
              4, SH 49A, Tharamani, Chennai, Tamil Nadu 600113, India
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
