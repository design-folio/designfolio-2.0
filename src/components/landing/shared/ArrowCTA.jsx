import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";

/**
 * Split pill CTA button: [label text][arrow circle]
 * Turns orange on hover. Used in hero, founder, and header.
 *
 * Props:
 *  label   – button text
 *  size    – "lg" (default) | "sm"
 *  href    – link destination (optional)
 *  onClick – click handler for action-only CTAs
 *  loading – when true, the arrow circle shows a spinner and the CTA is
 *            non-interactive (used while a navigation is in flight)
 */
export default function ArrowCTA({
  label = "Get started for Free",
  size = "lg",
  href,
  onClick,
  loading = false,
  className = "",
}) {
  const isLg = size === "lg";

  const textCls = isLg
    ? "px-6 py-[13px] text-[15px]"
    : "px-4 py-[6px] text-[13px]";

  const circleSz = isLg ? "h-[46px] w-[46px]" : "h-[32px] w-[32px]";
  const arrowSz = isLg ? "h-[18px] w-[18px]" : "h-[14px] w-[14px]";
  const spinnerSz = isLg ? "size-[18px]" : "size-[14px]";
  const translateOut = isLg ? "group-hover:translate-x-8 group-hover:-translate-y-8" : "group-hover:translate-x-6 group-hover:-translate-y-6";
  const translateIn = isLg ? "-translate-x-10 translate-y-10" : "-translate-x-7 translate-y-7";

  const content = (
    <>
      <span
        className={`cursor-pointer rounded-full bg-[--lp-text] px-6 font-medium text-[--lp-fg-white] transition-colors duration-500 ease-in-out group-hover:bg-[--lp-accent-hover] group-hover:text-white whitespace-nowrap ${textCls}`}
        style={{ paddingLeft: isLg ? "24px" : "16px", paddingRight: isLg ? "24px" : "16px" }}
      >
        {label}
      </span>
      <div
        className={`cursor-pointer relative flex-shrink-0 overflow-hidden rounded-full bg-[--lp-text] text-[--lp-fg-white] transition-colors duration-500 ease-in-out group-hover:bg-[--lp-accent-hover] group-hover:text-white ${circleSz}`}
      >
        {loading ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <Spinner className={spinnerSz} />
          </span>
        ) : (
          <>
            <ArrowUpRight
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out ${translateOut} ${arrowSz}`}
              strokeWidth={2.5}
            />
            <ArrowUpRight
              className={`absolute top-1/2 left-1/2 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2 group-hover:-translate-y-1/2 ${translateIn} ${arrowSz}`}
              strokeWidth={2.5}
            />
          </>
        )}
      </div>
    </>
  );

  const wrapperClass = `group inline-flex cursor-pointer items-center gap-0 rounded-full no-underline ${loading ? "pointer-events-none" : ""} ${className}`.trim();

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={wrapperClass}
        aria-busy={loading}
        aria-disabled={loading || undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={wrapperClass}
      disabled={loading}
      aria-busy={loading}
    >
      {content}
    </button>
  );
}
