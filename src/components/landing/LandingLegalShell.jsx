import { useState, useEffect, startTransition } from "react";
import Link from "next/link";
import LandingFooter from "./LandingFooter";
import Seo from "@/components/seo";
import MemoDesignfolioLogoV2 from "@/components/icons/DesignfolioLogoV2";
import { Button } from "@/components/ui/button";

function getCookieValue(name) {
  if (typeof document === "undefined") return "";
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

/**
 * Shared wrapper for legal pages (privacy, terms, refund).
 * Applies the warm landing-page design shell.
 */
export default function LandingLegalShell({ title, seoTitle, seoDescription, children }) {
  const [hasDfToken, setHasDfToken] = useState(false);
  const [hasParsedResume, setHasParsedResume] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setHasDfToken(!!getCookieValue("df-token"));
      setHasParsedResume(!!getCookieValue("df_parsed_resume"));
    });
  }, []);
  return (
    <>
      <Seo
        title={seoTitle || `${title} – Designfolio`}
        description={seoDescription || `Designfolio ${title}`}
        author="Designfolio"
        url="https://designfolio.me"
      />
      <div
        className="flex min-h-screen justify-center bg-(--lp-bg)"
        style={{ fontFamily: "var(--font-manrope), sans-serif" }}
      >
        <div className="flex min-h-screen w-full max-w-[640px] flex-col border-x border-(--lp-border)">
          {/* Nav header */}
          <header className="flex items-center justify-between px-6 pt-6 pb-4">
            <Link href="/" className="cursor-pointer">
              <MemoDesignfolioLogoV2 className="text-df-icon-color" />
            </Link>
            <div className="flex items-center gap-3">
              {hasDfToken ? (
                <Button
                  asChild
                  variant="darker"
                  size="sm"
                  className="rounded-full px-4 text-[13px] font-semibold"
                >
                  <Link href="/builder">Launch Builder</Link>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="px-0 text-[13px] font-medium text-(--lp-text-muted) hover:bg-transparent hover:text-(--lp-text)"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button
                    asChild
                    variant="darker"
                    size="sm"
                    className="rounded-full px-4 text-[13px] font-semibold"
                  >
                    <Link href="/claim-link">
                      {hasParsedResume ? "Continue Signup" : "Get Started"}
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 px-6 py-6">
            <h1 className="mb-6 text-[24px] font-bold tracking-tight text-(--lp-text)">{title}</h1>
            <div className="text-lp-text/80 space-y-6 text-[15px] leading-relaxed [&_a]:text-(--lp-accent) [&_a:hover]:underline [&_h2]:mt-2 [&_h2]:mb-2 [&_h2]:text-[18px] [&_h2]:font-semibold [&_h2]:text-(--lp-text) [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
              {children}
            </div>
          </div>

          <LandingFooter />
        </div>
      </div>
    </>
  );
}
