import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import LandingLegalShell from "@/components/landing/LandingLegalShell";
import { Check, X } from "lucide-react";
import { usePostHogEvent } from "@/hooks/usePostHogEvent";
import { POSTHOG_EVENT_NAMES } from "@/lib/posthogEventNames";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PRO_PLANS = [
  { label: "Monthly", inr: "₹999", usd: "$19", save: null, testId: "monthly" },
  { label: "Quarterly", inr: "₹2,499", usd: "$39", save: "17%", testId: "quarterly" },
  // { label: 'Yearly', inr: '₹10,999', usd: '$149', save: '50%', testId: 'yearly' },
  { label: "Lifetime", inr: "₹8,999", usd: "$99", save: null, testId: "yearly" },
];

const comparisonRows = [
  {
    feature: "Case Studies",
    free: "2 only",
    pro: "Unlimited",
    testId: "case-studies",
  },
  {
    feature: "Projects",
    free: "1 project",
    pro: "Unlimited",
    testId: "projects",
  },
  {
    feature: "Custom Domain",
    free: { type: "unavailable", text: "Not available" },
    pro: { type: "included", text: "Included" },
    testId: "custom-domain",
  },
  {
    feature: "Premium Templates",
    free: "Starter templates only",
    pro: "All templates",
    testId: "templates",
  },
  {
    feature: "Themes",
    free: "Limited",
    pro: "All current + future themes",
    testId: "themes",
  },
  {
    feature: "Branding Removal",
    free: { type: "unavailable", text: "Branding visible" },
    pro: { type: "included", text: "Remove branding" },
    testId: "branding",
  },
  {
    feature: "Analytics (Views Tracking)",
    free: { type: "unavailable", text: "Not available" },
    pro: { type: "included", text: "Included" },
    testId: "analytics",
  },
  {
    feature: "AI Job Search & Matching",
    free: { type: "unavailable", text: "Not included" },
    pro: { type: "included", text: "Included" },
    testId: "ai-job-search",
  },
  {
    feature: "Tailored Resumes & Cover Letters",
    free: { type: "unavailable", text: "Not included" },
    pro: { type: "included", text: "Included" },
    testId: "ai-resumes",
  },
  {
    feature: "Mock Interviews",
    free: { type: "unavailable", text: "Not included" },
    pro: { type: "included", text: "Included" },
    testId: "mock-interviews",
  },
  {
    feature: "AI Case Study Analysis",
    free: "2 only",
    pro: "Unlimited",
    testId: "ai-case-study",
  },
  {
    feature: "Support",
    free: "Standard",
    pro: "Priority",
    testId: "support",
  },
];

function Cell({ value, accent }) {
  if (typeof value === "object") {
    return (
      <div className="flex items-center justify-center gap-1.5">
        {value.type === "unavailable" ? (
          <X className="h-3.5 w-3.5 text-[--lp-text-muted] shrink-0" />
        ) : (
          <Check className="h-3.5 w-3.5 text-[--lp-accent] shrink-0" />
        )}
        <span className="text-[13px]">{value.text}</span>
      </div>
    );
  }
  return <div className={`text-center ${accent ? "font-medium" : ""}`}>{value}</div>;
}

export default function Pricing() {
  const phEvent = usePostHogEvent();

  useEffect(() => {
    phEvent(POSTHOG_EVENT_NAMES.PRICING_VIEWED);
  }, []);

  return (
    <LandingLegalShell
      title="Pricing"
      seoTitle="Pricing – Designfolio"
      seoDescription="Simple monthly, quarterly, and yearly plans. Get Pro to access all Designfolio features."
    >
      <p data-testid="text-intro">
        Choose the plan that works best for you. Get Pro access with all features included.
      </p>

      {/* Pro pricing band */}
      <div className="space-y-2">
        <p className="text-[12px] font-semibold uppercase tracking-wide text-[--lp-text-muted]">
          Pro pricing
        </p>
        <div
          className="grid grid-cols-3 rounded-xl border border-[--lp-border] overflow-hidden text-center"
          data-testid="pro-pricing"
        >
          {PRO_PLANS.map((p, idx) => (
            <div
              key={p.testId}
              className={`flex flex-col items-center justify-center gap-3 py-4 px-3 ${idx > 0 ? "border-l border-[--lp-border]" : ""}`}
              data-testid={`plan-${p.testId}`}
            >
              <div className="flex items-center gap-2 h-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[--lp-text-muted]">
                  {p.label}
                </span>
                {p.save && (
                  <span className="text-[10px] font-bold text-[--lp-accent]">Save {p.save}</span>
                )}
              </div>

              <div className="flex items-end justify-center gap-5">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[17px] font-bold text-[--lp-text] tabular-nums leading-none">
                    {p.inr}
                  </span>
                  <span className="text-[9px] font-medium uppercase tracking-wider text-[--lp-text-muted]">
                    India
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[15px] font-semibold text-[--lp-text] tabular-nums leading-none">
                    {p.usd}
                  </span>
                  <span className="text-[9px] font-medium uppercase tracking-wider text-[--lp-text-muted]">
                    Global
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="rounded-xl border border-[--lp-border] overflow-hidden"
        data-testid="table-pricing-comparison"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-[--lp-border] bg-[--lp-bg]">
                <th
                  className="text-left py-3 px-4 font-semibold text-[--lp-text]"
                  data-testid="header-feature"
                >
                  Feature
                </th>
                <th
                  className="text-center py-3 px-4 font-semibold text-[--lp-text]"
                  data-testid="header-free"
                >
                  Free
                </th>
                <th
                  className="text-center py-3 px-4 font-semibold text-[--lp-text]"
                  data-testid="header-pro"
                >
                  Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr
                  key={row.testId}
                  className={`border-b border-[--lp-border] last:border-0 ${i % 2 === 0 ? "bg-[--lp-bg]" : "bg-[--lp-card]"}`}
                  data-testid={`row-${row.testId}`}
                >
                  <td
                    className="py-3 px-4 font-medium text-[--lp-text] align-top"
                    data-testid={`feature-${row.testId}`}
                  >
                    {row.feature}
                  </td>
                  <td
                    className="py-3 px-4 text-[--lp-text-muted] align-top"
                    data-testid={`free-${row.testId}`}
                  >
                    <Cell value={row.free} />
                  </td>
                  <td
                    className="py-3 px-4 text-[--lp-text] align-top"
                    data-testid={`pro-${row.testId}`}
                  >
                    <Cell value={row.pro} accent />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <Button
          asChild
          variant="darker"
          size="lg"
          className="rounded-full !no-underline !text-[--lp-fg-white] hover:!text-[#fdfcf8]"
          data-testid="button-get-started-free"
        >
          <Link href="/claim-link">Get Started for Free</Link>
        </Button>
      </div>

      <h2
        className="!text-[18px] !font-semibold !text-[--lp-text] !mt-6 !mb-2"
        data-testid="text-section-faq"
      >
        Frequently Asked Questions
      </h2>

      <Accordion type="single" collapsible className="w-full !space-y-0 -mt-2">
        <AccordionItem
          value="item-1"
          className="border-[--lp-border]"
          data-testid="accordion-faq-plans"
        >
          <AccordionTrigger
            className="text-[15px] text-[--lp-text] hover:no-underline"
            data-testid="text-faq-plans"
          >
            What&apos;s the difference between Monthly, Quarterly, and Yearly?
          </AccordionTrigger>
          <AccordionContent className="text-[--lp-text-muted]" data-testid="text-faq-plans-answer">
            The Pro features are identical on all three plans. Longer billing periods simply cost
            less per month — you save around 30% on Quarterly and 50% on Yearly compared to paying
            monthly.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="item-2"
          className="border-[--lp-border]"
          data-testid="accordion-faq-cancel"
        >
          <AccordionTrigger
            className="text-[15px] text-[--lp-text] hover:no-underline"
            data-testid="text-faq-cancel"
          >
            Can I cancel anytime?
          </AccordionTrigger>
          <AccordionContent className="text-[--lp-text-muted]" data-testid="text-faq-cancel-answer">
            Yes. You keep access to Pro until the end of your current billing cycle. No questions
            asked.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="item-3"
          className="border-[--lp-border]"
          data-testid="accordion-faq-downgrade"
        >
          <AccordionTrigger
            className="text-[15px] text-[--lp-text] hover:no-underline"
            data-testid="text-faq-downgrade"
          >
            What happens to my portfolio if I downgrade to Free?
          </AccordionTrigger>
          <AccordionContent
            className="text-[--lp-text-muted]"
            data-testid="text-faq-downgrade-answer"
          >
            Your portfolio stays live. You&apos;ll be limited to 2 case studies; extras stay hidden
            until you upgrade again. Custom domain support is also removed.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="item-4"
          className="border-[--lp-border]"
          data-testid="accordion-faq-ai"
        >
          <AccordionTrigger
            className="text-[15px] text-[--lp-text] hover:no-underline"
            data-testid="text-faq-ai"
          >
            Which plans include the AI job tools?
          </AccordionTrigger>
          <AccordionContent className="text-[--lp-text-muted]" data-testid="text-faq-ai-answer">
            AI job matching, tailored resumes, cover letters, and mock interviews are all included
            with Pro — available on Monthly, Quarterly, and Yearly billing.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="item-5"
          className="border-[--lp-border]"
          data-testid="accordion-faq-trial"
        >
          <AccordionTrigger
            className="text-[15px] text-[--lp-text] hover:no-underline"
            data-testid="text-faq-trial"
          >
            Is there a free trial?
          </AccordionTrigger>
          <AccordionContent className="text-[--lp-text-muted]" data-testid="text-faq-trial-answer">
            No free trial right now, but the Free plan lets you explore the portfolio builder with
            up to 2 case studies before you decide to upgrade.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="item-6"
          className="border-[--lp-border]"
          data-testid="accordion-faq-payment"
        >
          <AccordionTrigger
            className="text-[15px] text-[--lp-text] hover:no-underline"
            data-testid="text-faq-payment"
          >
            What payment methods do you accept?
          </AccordionTrigger>
          <AccordionContent
            className="text-[--lp-text-muted]"
            data-testid="text-faq-payment-answer"
          >
            We accept all major credit cards, debit cards, UPI (India), and international payment
            methods depending on your region.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="item-7"
          className="border-[--lp-border]"
          data-testid="accordion-faq-refund"
        >
          <AccordionTrigger
            className="text-[15px] text-[--lp-text] hover:no-underline"
            data-testid="text-faq-refund"
          >
            Do you offer refunds?
          </AccordionTrigger>
          <AccordionContent className="text-[--lp-text-muted]" data-testid="text-faq-refund-answer">
            <p>Subscription payments are non-refundable as access is delivered instantly.</p>
            <p className="mt-2">
              Refunds are only considered in exceptional cases such as duplicate payments caused by
              a technical issue, or payment deducted but access not activated within 24 hours.
            </p>
            <p className="mt-2">
              If this happens, email{" "}
              <a href="mailto:shai@designfolio.me" data-testid="link-refund-email">
                shai@designfolio.me
              </a>{" "}
              within 48 hours with proof of transaction. Refunds, if approved, take 5 working days.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section className="pt-2 border-t border-[--lp-border]">
        <h2
          className="!text-[18px] !font-semibold !text-[--lp-text] !mt-0 !mb-2"
          data-testid="text-section-contact"
        >
          Need Help Choosing?
        </h2>
        <p data-testid="text-contact-content">
          If you have questions about our pricing or need help choosing the right plan, contact us
          at{" "}
          <a href="mailto:shai@designfolio.me" data-testid="link-contact-email">
            shai@designfolio.me
          </a>
        </p>
      </section>
    </LandingLegalShell>
  );
}

export function getStaticProps() {
  return { props: { hideHeader: true } };
}
