import Link from "next/link";
import LandingFooter from "./LandingFooter";
import Seo from "@/components/seo";
import MemoDesignfolioLogoV2 from "@/components/icons/DesignfolioLogoV2";

/**
 * Shared wrapper for legal pages (privacy, terms, refund).
 * Applies the warm landing-page design shell.
 */
export default function LandingLegalShell({ title, seoTitle, seoDescription, children }) {
  return (
    <>
      <Seo
        title={seoTitle || `${title} – Designfolio`}
        description={seoDescription || `Designfolio ${title}`}
        author="Designfolio"
        url="https://designfolio.me"
      />
      <div
        className="min-h-screen bg-[--lp-bg] flex justify-center"
        style={{ fontFamily: "var(--font-manrope), sans-serif" }}
      >
        <div className="w-full max-w-[640px] min-h-screen border-x border-[--lp-border] flex flex-col">
          {/* Nav header */}
          <header className="px-6 pt-6 pb-4 flex items-center justify-between">
            <Link href="/" className="cursor-pointer">
              <MemoDesignfolioLogoV2 className="text-df-icon-color" />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-[13px] font-medium text-[--lp-text-muted] hover:text-[--lp-text] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/claim-link"
                className="inline-flex items-center gap-1.5 h-8 px-4 rounded-full text-[13px] font-semibold bg-[--lp-text] text-[--lp-fg-white] hover:bg-[--lp-accent] transition-colors duration-300"
              >
                Get Started
              </Link>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 px-6 py-6">
            <h1 className="text-[24px] font-bold text-[--lp-text] mb-6 tracking-tight">
              {title}
            </h1>
            <div
              className="space-y-6 text-[15px] leading-relaxed text-[--lp-text]/80 [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:text-[--lp-text] [&_h2]:mt-2 [&_h2]:mb-2 [&_a]:text-[--lp-accent] [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1"
            >
              {children}
            </div>
          </div>

          <LandingFooter />
        </div>
      </div>
    </>
  );
}
