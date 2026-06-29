import Link from "next/link";

export default function FooterBottom() {
  return (
    <div className="w-full border-t">
      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-muted-foreground text-sm" data-testid="text-copyright">
            © 2025 Designfolio Labs LLP. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/privacy-policy"
              className="text-muted-foreground hover-elevate cursor-pointer rounded-md px-2 py-1 text-sm transition-colors"
              data-testid="link-privacy"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="text-muted-foreground hover-elevate cursor-pointer rounded-md px-2 py-1 text-sm transition-colors"
              data-testid="link-terms"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/refund-policy"
              className="text-muted-foreground hover-elevate cursor-pointer rounded-md px-2 py-1 text-sm transition-colors"
              data-testid="link-refund"
            >
              Refund Policy
            </Link>
            <Link
              href="/pricing"
              className="text-muted-foreground hover-elevate cursor-pointer rounded-md px-2 py-1 text-sm transition-colors"
              data-testid="link-pricing"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="text-muted-foreground hover-elevate cursor-pointer rounded-md px-2 py-1 text-sm transition-colors"
              data-testid="link-contact"
            >
              Contact/Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
