import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Refund Policy", href: "/refund-policy" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact / Support", href: "/contact" },
];

export default function LandingFooter() {
  return (
    <footer
      className="w-full border-t border-[--lp-border]"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <div className="px-6 py-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] font-medium text-[--lp-text]/50 bg-[--lp-card]">
        {FOOTER_LINKS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="hover:text-[--lp-text] transition-colors cursor-pointer"
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="border-t border-[--lp-border] px-6 py-4 text-center text-[12px] font-medium text-[--lp-text]/40 bg-[--lp-card]">
        © {new Date().getFullYear()} Designfolio Labs LLP. All rights reserved.
      </div>
    </footer>
  );
}
