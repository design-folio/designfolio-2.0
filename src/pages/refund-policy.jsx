import LandingLegalShell from "@/components/landing/LandingLegalShell";

export default function RefundPolicy() {
  return (
    <LandingLegalShell
      title="Refund & Cancellation Policy"
      seoTitle="Refund Policy – Designfolio"
      seoDescription="Designfolio's refund and cancellation policy for all purchases."
    >
      <p className="text-sm text-[--lp-text-muted]">Effective Date: October 31, 2025</p>

      <p>
        At Designfolio Labs LLP, we value transparency and fairness in every
        transaction. This Refund & Cancellation Policy outlines how payments,
        refunds, and cancellations are handled for all products and services
        offered under the Designfolio brand.
      </p>

      <section>
        <h2>1. Nature of Our Product</h2>
        <p>
          Designfolio is a SaaS-based website builder that provides users with
          instant access to premium tools and templates after successful payment.
          Because access is delivered immediately upon purchase, the product is
          considered a digital good that cannot be returned or revoked once
          delivered.
        </p>
      </section>

      <section>
        <h2>2. Payment Terms</h2>
        <ul>
          <li>
            All payments are one-time lifetime purchases made securely through
            Razorpay.
          </li>
          <li>
            Once a payment is successfully completed, the user gains instant
            access to the Designfolio Pro features.
          </li>
          <li>
            No recurring or subscription-based charges are applied unless
            explicitly introduced and agreed to by the user in the future.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Refund Policy</h2>
        <p className="font-semibold">All purchases are non-refundable.</p>
        <p>
          Since the product is digital and access is provided immediately,
          Designfolio does not issue refunds once an account has been activated.
        </p>
        <p>Refunds will only be considered in exceptional cases such as:</p>
        <ul>
          <li>Duplicate payments due to a technical error.</li>
          <li>Payment deducted but access not delivered within 24 hours.</li>
        </ul>
        <p>
          If any such case arises, users must email{" "}
          <a href="mailto:shai@designfolio.me">shai@designfolio.me</a> within 48
          hours of the transaction, including payment proof and account details.
          Each request will be reviewed individually.
        </p>
        <p>Timeline for refund: 5 Working Days</p>
      </section>

      <section>
        <h2>4. Cancellations</h2>
        <p>
          As Designfolio operates on a lifetime access model, there is no
          recurring billing and therefore no cancellation of subscriptions.
        </p>
        <p>
          Users may choose to discontinue using the service at any time;
          however, no refunds or partial credits will be issued for unused
          access.
        </p>
      </section>

      <section>
        <h2>5. Payment Disputes</h2>
        <p>
          If a payment dispute or chargeback is initiated with a bank or payment
          provider, Designfolio Labs LLP reserves the right to suspend the
          associated account until the matter is resolved. We encourage
          customers to contact us first to resolve any payment-related issues
          quickly.
        </p>
      </section>

      <section>
        <h2>6. Contact for Payment Support</h2>
        <p>For all payment or refund-related queries:</p>
        <ul>
          <li>
            📩 Email:{" "}
            <a href="mailto:shai@designfolio.me">shai@designfolio.me</a>
          </li>
          <li>🕒 Response Time: Within 48 hours (Mon – Fri)</li>
          <li>
            🏢 Address: No. 87, 1st Floor, 4th Cross St, Phase-1, Tirumalai
            Nagar, Perungudi, Chennai, Tamil Nadu 600096
          </li>
        </ul>
      </section>

      <section>
        <h2>7. Policy Updates</h2>
        <p>
          This policy may be updated from time to time to reflect changes in
          business or legal requirements. The latest version will always be
          available at{" "}
          <a href="https://designfolio.me/refund-policy">
            designfolio.me/refund-policy
          </a>
          .
        </p>
      </section>
    </LandingLegalShell>
  );
}

export function getStaticProps() {
  return { props: { hideHeader: true } };
}
