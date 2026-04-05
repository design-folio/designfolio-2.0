import LandingLegalShell from "@/components/landing/LandingLegalShell";
import { Mail, MessageCircle, FileQuestion, MapPin } from "lucide-react";
import Link from "next/link";

export default function Contact() {
  return (
    <LandingLegalShell
      title="Contact & Support"
      seoTitle="Contact & Support – Designfolio"
      seoDescription="Get in touch with the Designfolio team for support, questions, or feedback."
    >
      <p data-testid="text-intro">
        We're here to help! Whether you have a question, need technical support,
        or just want to share feedback, we'd love to hear from you.
      </p>

      <section>
        <h2 data-testid="text-section-email">Email Support</h2>
        <div className="flex items-start gap-4 p-4 rounded-xl border border-[--lp-border] bg-[--lp-surface]">
          <Mail className="w-5 h-5 text-[--lp-accent] mt-0.5 shrink-0" data-testid="icon-email" />
          <div>
            <p className="font-semibold text-[--lp-text] mb-1" data-testid="text-email-title">
              General Inquiries & Support
            </p>
            <p className="text-[--lp-text-muted] text-[14px] mb-1.5" data-testid="text-email-description">
              For any questions, technical issues, or account-related matters
            </p>
            <a href="mailto:shai@designfolio.me" className="font-medium" data-testid="link-support-email">
              shai@designfolio.me
            </a>
            <p className="text-[13px] text-[--lp-text-muted] mt-1.5" data-testid="text-response-time">
              We typically respond within 24–48 hours
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 data-testid="text-section-address">Address</h2>
        <div className="flex items-start gap-4 p-4 rounded-xl border border-[--lp-border] bg-[--lp-surface]">
          <MapPin className="w-5 h-5 text-[--lp-accent] mt-0.5 shrink-0" data-testid="icon-address" />
          <p className="text-[--lp-text-muted]" data-testid="text-address">
            No. 87, 1st Floor, 4th Cross St, Phase-1, Tirumalai Nagar,
            Perungudi, Chennai, Tamil Nadu 600096
          </p>
        </div>
      </section>

      <section>
        <h2 data-testid="text-section-support">What We Can Help With</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-[--lp-border] bg-[--lp-surface]">
            <MessageCircle className="w-4 h-4 text-[--lp-accent] mt-0.5 shrink-0" data-testid="icon-questions" />
            <div>
              <p className="font-semibold text-[--lp-text] mb-1" data-testid="text-help-questions">
                Questions
              </p>
              <p className="text-[13px] text-[--lp-text-muted]" data-testid="text-help-questions-desc">
                General inquiries about Designfolio features and capabilities
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-xl border border-[--lp-border] bg-[--lp-surface]">
            <FileQuestion className="w-4 h-4 text-[--lp-accent] mt-0.5 shrink-0" data-testid="icon-technical" />
            <div>
              <p className="font-semibold text-[--lp-text] mb-1" data-testid="text-help-technical">
                Technical Support
              </p>
              <p className="text-[13px] text-[--lp-text-muted]" data-testid="text-help-technical-desc">
                Issues with your portfolio, account, or platform functionality
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 data-testid="text-section-faq">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div data-testid="text-faq-1-question">
            <p className="font-semibold text-[--lp-text] mb-1">How do I get started with Designfolio?</p>
            <p data-testid="text-faq-1-answer">
              Simply claim your username on the homepage and start building your
              portfolio for free. No credit card required.
            </p>
          </div>
          <div data-testid="text-faq-2-question">
            <p className="font-semibold text-[--lp-text] mb-1">Can I use my own domain name?</p>
            <p data-testid="text-faq-2-answer">
              Yes! Paid plans include the option to connect your own custom
              domain to your Designfolio portfolio.
            </p>
          </div>
          <div data-testid="text-faq-3-question">
            <p className="font-semibold text-[--lp-text] mb-1">How do I cancel my subscription?</p>
            <p data-testid="text-faq-3-answer">
              You can cancel anytime from your account settings. Your access
              continues until the end of your billing period. See our{" "}
              <Link href="/refund-policy">Refund Policy</Link> for more details.
            </p>
          </div>
          <div data-testid="text-faq-4-question">
            <p className="font-semibold text-[--lp-text] mb-1">What kind of content can I showcase?</p>
            <p data-testid="text-faq-4-answer">
              Design projects, photography, illustrations, case studies, and
              more — as long as it's your work or you have permission to display
              it.
            </p>
          </div>
        </div>
      </section>

      <div className="p-4 rounded-xl border border-[--lp-border] bg-[--lp-surface] text-center" data-testid="text-feedback">
        Have feedback or suggestions?{" "}
        <a href="mailto:shai@designfolio.me?subject=Feedback" data-testid="link-feedback-email">
          We'd love to hear from you
        </a>
      </div>
    </LandingLegalShell>
  );
}

export function getStaticProps() {
  return { props: { hideHeader: true } };
}
