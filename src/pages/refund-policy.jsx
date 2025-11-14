import FooterBottom from "@/components/footerBottom";
import { Card } from "@/components/ui/card";


export default function Index() {
  return (
    <div className="pt-16 sm:pt-20 bg-background-landing ">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="p-8 sm:p-12">
          <h1 className="text-4xl font-bold mb-6" data-testid="text-page-title">
            Refund & Cancellation Policy
          </h1>

          <div className="space-y-6 text-foreground">
            <p className="text-sm text-muted-foreground" data-testid="text-effective-date">
              Effective Date: October 31, 2025
            </p>

            <p className="leading-relaxed" data-testid="text-intro">
              At Designfolio Labs LLP, we value transparency and fairness in every transaction. This Refund & Cancellation Policy outlines how payments, refunds, and cancellations are handled for all products and services offered under the Designfolio brand.
            </p>

            <section>
              <h2 className="text-2xl font-semibold mb-3" data-testid="text-section-nature">
                1. Nature of Our Product
              </h2>
              <p className="leading-relaxed" data-testid="text-nature-content">
                Designfolio is a SaaS-based website builder that provides users with instant access to premium tools and templates after successful payment. Because access is delivered immediately upon purchase, the product is considered a digital good that cannot be returned or revoked once delivered.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3" data-testid="text-section-payment">
                2. Payment Terms
              </h2>
              <ul className="list-disc pl-6 space-y-2" data-testid="list-payment-terms">
                <li>All payments are one-time lifetime purchases made securely through Razorpay.</li>
                <li>Once a payment is successfully completed, the user gains instant access to the Designfolio Pro features.</li>
                <li>No recurring or subscription-based charges are applied unless explicitly introduced and agreed to by the user in the future.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3" data-testid="text-section-refunds">
                3. Refund Policy
              </h2>
              <p className="leading-relaxed mb-3 font-semibold" data-testid="text-no-refund">
                All purchases are non-refundable.
              </p>
              <p className="leading-relaxed mb-3" data-testid="text-refund-reason">
                Since the product is digital and access is provided immediately, Designfolio does not issue refunds once an account has been activated.
              </p>
              <p className="leading-relaxed mb-2" data-testid="text-exceptional-cases">
                Refunds will only be considered in exceptional cases such as:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-3" data-testid="list-exceptional-cases">
                <li>Duplicate payments due to a technical error.</li>
                <li>Payment deducted but access not delivered within 24 hours.</li>
              </ul>
              <p className="leading-relaxed mb-3" data-testid="text-refund-request">
                If any such case arises, users must email{" "}
                <a
                  href="mailto:shai@designfolio.me"
                  className="text-primary-landing  cursor-pointer hover:underline"
                  data-testid="link-refund-email"
                >
                  shai@designfolio.me
                </a>
                {" "}within 48 hours of the transaction, including payment proof and account details. Each request will be reviewed individually.
              </p>
              <p className="leading-relaxed" data-testid="text-cancellation-access">
                Timeline for refund: 5 Working Days
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3" data-testid="text-section-cancellations">
                4. Cancellations
              </h2>
              <p className="leading-relaxed mb-3" data-testid="text-cancellation-intro">
                As Designfolio operates on a lifetime access model, there is no recurring billing and therefore no cancellation of subscriptions.
              </p>
              <p className="leading-relaxed" data-testid="text-cancellation-access">
                Users may choose to discontinue using the service at any time; however, no refunds or partial credits will be issued for unused access.
              </p>

            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3" data-testid="text-section-disputes">
                5. Payment Disputes
              </h2>
              <p className="leading-relaxed" data-testid="text-disputes-content">
                If a payment dispute or chargeback is initiated with a bank or payment provider, Designfolio Labs LLP reserves the right to suspend the associated account until the matter is resolved. We encourage customers to contact us first to resolve any payment-related issues quickly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3" data-testid="text-section-contact">
                6. Contact for Payment Support
              </h2>
              <p className="leading-relaxed mb-3" data-testid="text-contact-intro">
                For all payment or refund-related queries:
              </p>
              <div className="space-y-1 pl-6" data-testid="contact-details">
                <p className="leading-relaxed" data-testid="text-contact-email">
                  📩 Email:{" "}
                  <a
                    href="mailto:shai@designfolio.me"
                    className="text-primary-landing  cursor-pointer hover:underline"
                    data-testid="link-support-email"
                  >
                    shai@designfolio.me
                  </a>
                </p>
                <p className="leading-relaxed" data-testid="text-response-time">
                  🕒 Response Time: Within 48 hours (Mon – Fri)
                </p>
                <p className="leading-relaxed" data-testid="text-address">
                  🏢 Address: No. 87, 1st Floor, 4th Cross St, Phase-1, Tirumalai Nagar, Perungudi, Chennai, Tamil Nadu 600096
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3" data-testid="text-section-updates">
                7. Policy Updates
              </h2>
              <p className="leading-relaxed" data-testid="text-updates-content">
                This policy may be updated from time to time to reflect changes in business or legal requirements. The latest version will always be available at{" "}
                <a
                  href="https://designfolio.me/refund-policy"
                  className="text-primary-landing  cursor-pointer hover:underline"
                  data-testid="link-policy-url"
                >
                  designfolio.me/refund-policy
                </a>
                .
              </p>
            </section>
          </div>
        </Card>
      </div>
      <FooterBottom />
    </div>

  );
}

Index.theme = "light";