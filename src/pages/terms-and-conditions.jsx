import FooterBottom from "@/components/footerBottom";
import { Card } from "@/components/ui/card";

export default function Index() {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="pt-16 sm:pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Card className="p-8 sm:p-12">
            <h1 className="text-4xl font-bold mb-6" data-testid="text-page-title">
              Terms & Conditions
            </h1>

            <div className="space-y-6 text-foreground">
              <p className="text-sm text-muted-foreground" data-testid="text-last-updated">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>

              <section>
                <h2 className="text-2xl font-semibold mb-3" data-testid="text-section-agreement">
                  Agreement to Terms
                </h2>
                <p className="leading-relaxed" data-testid="text-agreement-content">
                  By accessing and using Designfolio, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" data-testid="text-section-service">
                  Use of Service
                </h2>
                <p className="leading-relaxed mb-3" data-testid="text-service-intro">
                  Designfolio provides a platform for creating and hosting portfolio websites. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2" data-testid="list-service-terms">
                  <li>Provide accurate and complete information when creating your account</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Not use the service for any illegal or unauthorized purpose</li>
                  <li>Not violate any laws in your jurisdiction</li>
                  <li>Not upload content that infringes on intellectual property rights</li>
                  <li>Not transmit viruses, malware, or any harmful code</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" data-testid="text-section-content">
                  Content Ownership
                </h2>
                <p className="leading-relaxed" data-testid="text-content-ownership">
                  You retain all ownership rights to the content you upload to Designfolio. By uploading content, you grant us a license to store, display, and distribute your content as necessary to provide our services. We do not claim ownership of your portfolio content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" data-testid="text-section-account">
                  Account Termination
                </h2>
                <p className="leading-relaxed" data-testid="text-termination-content">
                  We reserve the right to terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the service will immediately cease.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" data-testid="text-section-liability">
                  Limitation of Liability
                </h2>
                <p className="leading-relaxed" data-testid="text-liability-content">
                  Designfolio and its affiliates will not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service. We provide the service "as is" without warranties of any kind.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" data-testid="text-section-modifications">
                  Modifications to Terms
                </h2>
                <p className="leading-relaxed" data-testid="text-modifications-content">
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. Your continued use of the service after such modifications constitutes acceptance of the updated terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3" data-testid="text-section-contact">
                  Contact Information
                </h2>
                <p className="leading-relaxed" data-testid="text-contact-content">
                  If you have any questions about these Terms & Conditions, please contact us at{" "}
                  <a
                    href="mailto:shai@designfolio.me"
                    className="text-primary-landing  hover:underline cursor-pointer"
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
  );
}

Index.theme = "light";
