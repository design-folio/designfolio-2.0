import Link from "next/link";


export default function FooterBottom() {
  return (
    <div className="w-full border-t">
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-sm text-muted-foreground"
            data-testid="text-copyright"
          >
            © 2025 Designfolio Labs LLP. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link
              href="/privacy-policy"
              className="text-sm text-muted-foreground hover-elevate px-2 py-1 rounded-md transition-colors cursor-pointer"
              data-testid="link-privacy"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="text-sm text-muted-foreground hover-elevate px-2 py-1 rounded-md transition-colors cursor-pointer"
              data-testid="link-terms"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/refund-policy"
              className="text-sm text-muted-foreground hover-elevate px-2 py-1 rounded-md transition-colors cursor-pointer"
              data-testid="link-refund"
            >
              Refund Policy
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover-elevate px-2 py-1 rounded-md transition-colors cursor-pointer"
              data-testid="link-contact"
            >
              Contact/Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
