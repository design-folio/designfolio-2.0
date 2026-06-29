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
        We&apos;re here to help! Whether you have a question, need technical support, or just want
        to share feedback, we&apos;d love to hear from you.
      </p>

      <section>
        <h2 data-testid="text-section-email">Email Support</h2>
        <div className="flex items-start gap-4 rounded-xl border border-(--lp-border) bg-(--lp-surface) p-4">
          <Mail className="mt-0.5 h-5 w-5 shrink-0 text-(--lp-accent)" data-testid="icon-email" />
          <div>
            <p className="mb-1 font-semibold text-(--lp-text)" data-testid="text-email-title">
              General Inquiries & Support
            </p>
            <p
              className="mb-1.5 text-[14px] text-(--lp-text-muted)"
              data-testid="text-email-description"
            >
              For any questions, technical issues, or account-related matters
            </p>
            <a
              href="mailto:shai@designfolio.me"
              className="font-medium"
              data-testid="link-support-email"
            >
              shai@designfolio.me
            </a>
            <p
              className="mt-1.5 text-[13px] text-(--lp-text-muted)"
              data-testid="text-response-time"
            >
              We typically respond within 24–48 hours
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 data-testid="text-section-address">Address</h2>
        <div className="flex items-start gap-4 rounded-xl border border-(--lp-border) bg-(--lp-surface) p-4">
          <MapPin
            className="mt-0.5 h-5 w-5 shrink-0 text-(--lp-accent)"
            data-testid="icon-address"
          />
          <p className="text-(--lp-text-muted)" data-testid="text-address">
            No. 87, 1st Floor, 4th Cross St, Phase-1, Tirumalai Nagar, Perungudi, Chennai, Tamil
            Nadu 600096
          </p>
        </div>
      </section>

      <section>
        <h2 data-testid="text-section-support">What We Can Help With</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl border border-(--lp-border) bg-(--lp-surface) p-4">
            <MessageCircle
              className="mt-0.5 h-4 w-4 shrink-0 text-(--lp-accent)"
              data-testid="icon-questions"
            />
            <div>
              <p className="mb-1 font-semibold text-(--lp-text)" data-testid="text-help-questions">
                Questions
              </p>
              <p
                className="text-[13px] text-(--lp-text-muted)"
                data-testid="text-help-questions-desc"
              >
                General inquiries about Designfolio features and capabilities
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-(--lp-border) bg-(--lp-surface) p-4">
            <FileQuestion
              className="mt-0.5 h-4 w-4 shrink-0 text-(--lp-accent)"
              data-testid="icon-technical"
            />
            <div>
              <p className="mb-1 font-semibold text-(--lp-text)" data-testid="text-help-technical">
                Technical Support
              </p>
              <p
                className="text-[13px] text-(--lp-text-muted)"
                data-testid="text-help-technical-desc"
              >
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
            <p className="mb-1 font-semibold text-(--lp-text)">
              How do I get started with Designfolio?
            </p>
            <p data-testid="text-faq-1-answer">
              Simply claim your username on the homepage and start building your portfolio for free.
              No credit card required.
            </p>
          </div>
          <div data-testid="text-faq-2-question">
            <p className="mb-1 font-semibold text-(--lp-text)">Can I use my own domain name?</p>
            <p data-testid="text-faq-2-answer">
              Yes! Paid plans include the option to connect your own custom domain to your
              Designfolio portfolio.
            </p>
          </div>
          <div data-testid="text-faq-3-question">
            <p className="mb-1 font-semibold text-(--lp-text)">How do I cancel my subscription?</p>
            <p data-testid="text-faq-3-answer">
              You can cancel anytime from your account settings. Your access continues until the end
              of your billing period. See our <Link href="/refund-policy">Refund Policy</Link> for
              more details.
            </p>
          </div>
          <div data-testid="text-faq-4-question">
            <p className="mb-1 font-semibold text-(--lp-text)">
              What kind of content can I showcase?
            </p>
            <p data-testid="text-faq-4-answer">
              Design projects, photography, illustrations, case studies, and more — as long as
              it&apos;s your work or you have permission to display it.
            </p>
          </div>
        </div>
      </section>

      <div
        className="rounded-xl border border-(--lp-border) bg-(--lp-surface) p-4 text-center"
        data-testid="text-feedback"
      >
        Have feedback or suggestions?{" "}
        <a href="mailto:shai@designfolio.me?subject=Feedback" data-testid="link-feedback-email">
          We&apos;d love to hear from you
        </a>
      </div>
    </LandingLegalShell>
  );
}

export function getStaticProps() {
  return { props: { hideHeader: true } };
}
