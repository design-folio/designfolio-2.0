import Link from "next/link";
import { motion } from "framer-motion";
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
      <div className="max-w-5xl mx-auto px-5 py-7 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <MemoDFLogoV2 />
          <span className="text-sm text-foreground/45">The job tracker for designers</span>
        </div>
        <nav className="flex items-center gap-5">
          {[
            { label: "Privacy",     href: "/privacy-policy"       },
            { label: "Terms",       href: "/terms-and-conditions" },
            { label: "Designfolio", href: "/"                     },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors duration-150"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </motion.footer>
  );
}
