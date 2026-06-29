import Link from "next/link";
import { motion } from "motion/react";
import MemoDFLogoV2 from "@/components/icons/DFLogoV2";
import { EASE_OUT } from "./motion-constants";

export function ShareFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.45 }}
      className="border-t border-black/[0.06] dark:border-white/[0.06]"
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-5 py-7 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <MemoDFLogoV2 />
          <span className="text-foreground/45 text-sm">The job tracker for designers</span>
        </div>
        <nav className="flex items-center gap-5">
          {[
            { label: "Privacy", href: "/privacy-policy" },
            { label: "Terms", href: "/terms-and-conditions" },
            { label: "Designfolio", href: "/" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-foreground/40 hover:text-foreground/70 text-xs transition-colors duration-150"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </motion.footer>
  );
}
