import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Sparkles } from "lucide-react";
import MemoDFLogoV2 from "@/components/icons/DFLogoV2";
import { AvatarDropdown } from "@/components/loggedInHeader/avatar-dropdown";
import { EASE_OUT } from "./motion-constants";
import { Button } from "@/components/ui/button";
import MemoDesignfolioLogoV2 from "@/components/icons/DesignfolioLogoV2";

export function ShareNav({ authState, jobId }) {
  const jobParam = jobId ? `?job=${jobId}` : "";
  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.28, ease: EASE_OUT }}
      className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/90 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.06]"
    >
      <div className="max-w-5xl mx-auto px-5 h-full flex items-center justify-between">
        <Link href="/" className="flex-shrink-0 flex items-center">
          <MemoDesignfolioLogoV2 />
        </Link>

        <AnimatePresence mode="wait">
          {authState === "loading" && (
            <motion.div
              key="nav-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-8 w-20 rounded-full bg-foreground/[0.06] animate-pulse"
            />
          )}

          {authState === "new" && (
            <motion.div
              key="nav-new"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="flex items-center gap-2"
            >
              <Link
                href={`/login${jobParam}`}
                className="hidden sm:flex items-center h-8 px-4 rounded-full border border-black/[0.10] dark:border-white/[0.12] text-[13px] font-medium text-foreground/65 hover:text-foreground hover:border-black/[0.20] dark:hover:border-white/[0.25] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href={`/claim-link${jobParam}`}
                className="flex items-center gap-1.5 h-8 px-4 rounded-full bg-[#1A1A1A] dark:bg-white text-white dark:text-black text-[13px] font-medium hover:opacity-80 transition-opacity"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Try Designfolio
              </Link>
            </motion.div>
          )}

          {(authState === "loggedin" || authState === "saved") && (
            <motion.div
              key="nav-auth"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="flex items-end gap-4"
            >
              <Button asChild size="sm" className="hidden sm:flex items-center rounded-full">
                <Link href="/jobs">
                  <Briefcase className="w-4 h-4" />
                  My Jobs
                </Link>
              </Button>
              <AvatarDropdown />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
