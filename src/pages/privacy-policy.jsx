import { Card } from "@/components/ui/card"
import FooterBottom from "@/components/footerBottom"
import { useEffect } from "react"

export default function Index() {
  useEffect(() => {
    document.documentElement.classList.add('landing-page');
  }, []);

  return (
    <div className="min-h-screen w-full bg-background-landing">
      <div className="pt-16 sm:pt-20">
        <div className="max-w-[848px] mx-auto px-6 py-12">
          <Card className="p-8 sm:p-12">
            <h1
              className="text-4xl font-bold mb-6"
              data-testid="text-page-title"
            >
              Privacy Policy
            </h1>

            <div className="space-y-6 text-foreground">
              <p
                className="text-sm text-muted-foreground"
                data-testid="text-last-updated"
              >
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}
              </p>

              <section>
                <h2
                  className="text-2xl font-semibold mb-3"
                  data-testid="text-section-intro"
                >
                  Introduction
                </h2>
                <p className="leading-relaxed" data-testid="text-intro-content">
                  Welcome to Designfolio. We respect your privacy and are
                  committed to protecting your personal data. This privacy
                  policy will inform you about how we look after your personal
                  data when you visit our website and tell you about your
                  privacy rights.
                </p>
              </section>

              <section>
                <h2
                  className="text-2xl font-semibold mb-3"
                  data-testid="text-section-collection"
                >
                  Information We Collect
                </h2>
                <p
                  className="leading-relaxed mb-3"
                  data-testid="text-collection-intro"
                >
                  We may collect, use, store and transfer different kinds of
                  personal data about you:
                </p>
                <ul
                  className="list-disc pl-6 space-y-2"
                  data-testid="list-collected-data"
                >
                  <li>Identity Data: username, email address</li>
                  <li>
                    Technical Data: IP address, browser type, device information
                  </li>
                  <li>
                    Usage Data: information about how you use our website and
                    services
                  </li>
                  <li>
                    Portfolio Content: work samples, images, and other content
                    you upload
                  </li>
                </ul>
              </section>

              <section>
                <h2
                  className="text-2xl font-semibold mb-3"
                  data-testid="text-section-usage"
                >
                  How We Use Your Information
                </h2>
                <p
                  className="leading-relaxed mb-3"
                  data-testid="text-usage-intro"
                >
                  We use your personal data for the following purposes:
                </p>
                <ul
                  className="list-disc pl-6 space-y-2"
                  data-testid="list-usage-purposes"
                >
                  <li>To provide and maintain our service</li>
                  <li>To manage your account and portfolio</li>
                  <li>To communicate with you about updates and support</li>
                  <li>To improve our website and services</li>
                  <li>To detect and prevent fraud or abuse</li>
                </ul>
              </section>

              <section>
                <h2
                  className="text-2xl font-semibold mb-3"
                  data-testid="text-section-sharing"
                >
                  Data Sharing
                </h2>
                <p
                  className="leading-relaxed"
                  data-testid="text-sharing-content"
                >
                  We do not sell your personal data. We may share your
                  information with trusted third-party service providers who
                  assist us in operating our website, conducting our business,
                  or servicing you, so long as those parties agree to keep this
                  information confidential.
                </p>
              </section>

              <section>
                <h2
                  className="text-2xl font-semibold mb-3"
                  data-testid="text-section-security"
                >
                  Data Security
                </h2>
                <p
                  className="leading-relaxed"
                  data-testid="text-security-content"
                >
                  We have implemented appropriate security measures to prevent
                  your personal data from being accidentally lost, used, or
                  accessed in an unauthorized way. We limit access to your
                  personal data to those employees and partners who have a
                  business need to know.
                </p>
              </section>

              <section>
                <h2
                  className="text-2xl font-semibold mb-3"
                  data-testid="text-section-rights"
                >
                  Your Rights
                </h2>
                <p
                  className="leading-relaxed mb-3"
                  data-testid="text-rights-intro"
                >
                  You have the right to:
                </p>
                <ul
                  className="list-disc pl-6 space-y-2"
                  data-testid="list-user-rights"
                >
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to processing of your data</li>
                  <li>Request transfer of your data</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section>
                <h2
                  className="text-2xl font-semibold mb-3"
                  data-testid="text-section-contact"
                >
                  Contact Us
                </h2>
                <p
                  className="leading-relaxed"
                  data-testid="text-contact-content"
                >
                  If you have any questions about this Privacy Policy, please
                  contact us at{" "}
                  <a
                    href="mailto:shai@designfolio.me"
                    className="text-blue-600 cursor-pointer hover:underline"
                    data-testid="link-contact-email"
                  >
                    shai@designfolio.me
                  </a>
                </p>
              </section>
            </div>
          </Card>
        </div>
        <FooterBottom />
      </div>
    </div>
  )
}

Index.theme = "light";