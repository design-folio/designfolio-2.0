import styles from "@/styles/Policy.module.css";
export default function Index() {
  return (
    <main className={`${styles.main} mt-20`}>
      <div className={styles.content}>
        <div className={styles.pageHeader}>
          <div className={styles.pageIcon}>🔒</div>
          <h1>Privacy Policy</h1>
          <p className={styles.lastUpdated}>Last updated: January 2025</p>
        </div>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to Designfolio ("we," "our," or "us"). We are committed to
            protecting your privacy and personal information. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your
            information when you use our no-code portfolio website builder
            service.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <h3>Personal Information</h3>
          <ul>
            <li>Name and contact information (email address)</li>
            <li>Account credentials (username, password)</li>
            <li>Portfolio content (text, images, links)</li>
            <li>
              Payment information (processed securely through third-party
              providers)
            </li>
          </ul>

          <h3>Usage Information</h3>
          <ul>
            <li>Website analytics and usage patterns</li>
            <li>Device information and browser type</li>
            <li>IP address and location data</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To provide and maintain our portfolio building service</li>
            <li>To process transactions and manage your account</li>
            <li>To communicate with you about our services</li>
            <li>To improve our platform and user experience</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2>4. Information Sharing</h2>
          <p>
            We do not sell, trade, or otherwise transfer your personal
            information to third parties except:
          </p>
          <ul>
            <li>With your explicit consent</li>
            <li>
              To trusted service providers who assist in operating our platform
            </li>
            <li>When required by law or to protect our rights</li>
            <li>In connection with a business transfer or merger</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal
            information against unauthorized access, alteration, disclosure, or
            destruction. However, no internet transmission is 100% secure.
          </p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access and update your personal information</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Export your portfolio data</li>
          </ul>
        </section>

        <section>
          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
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

Index.theme = "light";
