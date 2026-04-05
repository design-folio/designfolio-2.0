import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import LandingLegalShell from '@/components/landing/LandingLegalShell';
import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { usePostHogEvent } from '@/hooks/usePostHogEvent';
import { POSTHOG_EVENT_NAMES } from '@/lib/posthogEventNames';
import { useEffect } from 'react';

const comparisonRows = [
  {
    feature: 'Pricing',
    free: '₹0',
    lifetime: '₹4,500 (India) / $99 (Global)',
    testId: 'pricing',
  },
  {
    feature: 'Custom Domain',
    free: { type: 'unavailable', text: 'Not available' },
    lifetime: { type: 'included', text: 'Included' },
    testId: 'custom-domain',
  },
  {
    feature: 'Number of Case Studies',
    free: '2 only',
    lifetime: 'Unlimited',
    testId: 'case-studies',
  },
  {
    feature: 'Number of Projects',
    free: '1 project',
    lifetime: 'Unlimited',
    testId: 'projects',
  },
  {
    feature: 'Templates',
    free: 'Limited starter templates',
    lifetime: 'All templates (now & forever)',
    testId: 'templates',
  },
  {
    feature: 'Themes',
    free: 'Limited',
    lifetime: 'All current + future themes',
    testId: 'themes',
  },
  {
    feature: 'Branding Removal',
    free: { type: 'unavailable', text: 'Designfolio branding visible' },
    lifetime: { type: 'included', text: 'Remove branding' },
    testId: 'branding',
  },
  {
    feature: 'Analytics (Views Tracking)',
    free: { type: 'unavailable', text: 'Not available' },
    lifetime: { type: 'included', text: 'Included' },
    testId: 'analytics',
  },
  {
    feature: 'Future Updates & Features',
    free: { type: 'unavailable', text: 'Not included' },
    lifetime: { type: 'included', text: 'Lifetime access' },
    testId: 'updates',
  },
  {
    feature: 'Support',
    free: 'Standard',
    lifetime: 'Priority',
    testId: 'support',
  },
];

export default function Pricing() {
  const phEvent = usePostHogEvent();
  useEffect(() => {
    phEvent(POSTHOG_EVENT_NAMES.PRICING_VIEWED);
  }, []);

  return (
    <LandingLegalShell
      title="Pricing"
      seoTitle="Pricing – Designfolio"
      seoDescription="Simple, one-time pricing. Get lifetime access to all Designfolio features."
    >
      <p data-testid="text-intro">
        Choose the plan that works best for you. Get lifetime access with all
        features included.
      </p>

      <div className="rounded-xl border border-[--lp-border] overflow-hidden" data-testid="table-pricing-comparison">
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-[--lp-border] bg-[--lp-bg]">
                <th className="text-left py-3 px-4 font-semibold text-[--lp-text]" data-testid="header-feature">
                  Feature
                </th>
                <th className="text-center py-3 px-4 font-semibold text-[--lp-text]" data-testid="header-free">
                  Free
                </th>
                <th className="text-center py-3 px-4 font-semibold text-[--lp-text]" data-testid="header-lifetime">
                  Lifetime
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr
                  key={row.testId}
                  className={`border-b border-[--lp-border] last:border-0 ${i % 2 === 0 ? 'bg-[--lp-bg]' : 'bg-[--lp-surface]'}`}
                  data-testid={`row-${row.testId}`}
                >
                  <td className="py-3 px-4 font-medium text-[--lp-text]" data-testid={`feature-${row.testId}`}>
                    {row.feature}
                  </td>
                  <td className="py-3 px-4 text-[--lp-text-muted]" data-testid={`free-${row.testId}`}>
                    {typeof row.free === 'object' ? (
                      <div className="flex items-center justify-center gap-1.5">
                        {row.free.type === 'unavailable' ? (
                          <X className="h-3.5 w-3.5 text-[--lp-text-muted] shrink-0" />
                        ) : (
                          <Check className="h-3.5 w-3.5 text-[--lp-accent] shrink-0" />
                        )}
                        <span className="text-[13px]">{row.free.text}</span>
                      </div>
                    ) : (
                      <div className="text-center">{row.free}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[--lp-text]" data-testid={`lifetime-${row.testId}`}>
                    {typeof row.lifetime === 'object' ? (
                      <div className="flex items-center justify-center gap-1.5">
                        {row.lifetime.type === 'included' && (
                          <Check className="h-3.5 w-3.5 text-[--lp-accent] shrink-0" />
                        )}
                        <span className="text-[13px]">{row.lifetime.text}</span>
                      </div>
                    ) : (
                      <div className="text-center">{row.lifetime}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <Link
          href="/claim-link"
          className="inline-flex items-center h-10 px-8 rounded-full text-[14px] font-semibold bg-[--lp-text] text-[--lp-fg-white] hover:bg-[--lp-accent] transition-colors duration-300"
          data-testid="button-get-started-free"
        >
          Get Started for Free
        </Link>
      </div>

      <h2 className="!text-[18px] !font-semibold !text-[--lp-text] !mt-6 !mb-2" data-testid="text-section-faq">
        Frequently Asked Questions
      </h2>

      <Accordion type="single" collapsible className="w-full !space-y-0 -mt-2">
        <AccordionItem value="item-1" className="border-[--lp-border]" data-testid="accordion-faq-lifetime">
          <AccordionTrigger className="text-[15px] text-[--lp-text] hover:no-underline" data-testid="text-faq-lifetime">
            What does lifetime access mean?
          </AccordionTrigger>
          <AccordionContent className="text-[--lp-text-muted]" data-testid="text-faq-lifetime-answer">
            Lifetime access means you pay once and get access to all current and
            future features forever. No recurring fees, no hidden costs.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="border-[--lp-border]" data-testid="accordion-faq-refund">
          <AccordionTrigger className="text-[15px] text-[--lp-text] hover:no-underline" data-testid="text-faq-refund">
            Do you offer refunds?
          </AccordionTrigger>
          <AccordionContent className="text-[--lp-text-muted]" data-testid="text-faq-refund-answer">
            <p>All purchases are non-refundable as access is delivered instantly.</p>
            <p className="mt-2">Refunds are only considered in exceptional cases such as duplicate payments caused by a technical issue, or payment deducted but access not activated within 24 hours.</p>
            <p className="mt-2">
              If this happens, email{' '}
              <a href="mailto:shai@designfolio.me" data-testid="link-refund-email">
                shai@designfolio.me
              </a>{' '}
              within 48 hours with proof of transaction. Refunds, if approved, take 5 working days.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3" className="border-[--lp-border]" data-testid="accordion-faq-payment">
          <AccordionTrigger className="text-[15px] text-[--lp-text] hover:no-underline" data-testid="text-faq-payment">
            What payment methods do you accept?
          </AccordionTrigger>
          <AccordionContent className="text-[--lp-text-muted]" data-testid="text-faq-payment-answer">
            We accept all major credit cards, debit cards, UPI (India), and
            international payment methods depending on your region.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4" className="border-[--lp-border]" data-testid="accordion-faq-really-lifetime">
          <AccordionTrigger className="text-[15px] text-[--lp-text] hover:no-underline" data-testid="text-faq-really-lifetime">
            Is lifetime access really lifetime?
          </AccordionTrigger>
          <AccordionContent className="text-[--lp-text-muted]" data-testid="text-faq-really-lifetime-answer">
            Yes! One payment unlocks all current and future features, templates,
            and updates — forever.
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5" className="border-[--lp-border]" data-testid="accordion-faq-pricing-change">
          <AccordionTrigger className="text-[15px] text-[--lp-text] hover:no-underline" data-testid="text-faq-pricing-change">
            Will pricing change in the future?
          </AccordionTrigger>
          <AccordionContent className="text-[--lp-text-muted]" data-testid="text-faq-pricing-change-answer">
            Yes. Lifetime access is currently priced at ₹4,500 (India) and $99
            (Global) and may increase later. Early buyers keep their lifetime
            access permanently.
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <section className="pt-2 border-t border-[--lp-border]">
        <h2 className="!text-[18px] !font-semibold !text-[--lp-text] !mt-0 !mb-2" data-testid="text-section-contact">
          Need Help Choosing?
        </h2>
        <p data-testid="text-contact-content">
          If you have questions about our pricing or need help choosing the right
          plan, contact us at{' '}
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
