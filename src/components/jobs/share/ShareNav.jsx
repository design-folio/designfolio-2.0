import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
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
      className="bg-background/90 fixed top-0 right-0 left-0 z-50 h-14 border-b border-black/[0.06] backdrop-blur-md dark:border-white/[0.06]"
    >
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-5">
        <Link href="/" className="flex shrink-0 items-center">
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
              className="bg-foreground/[0.06] h-8 w-20 animate-pulse rounded-full"
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
                className="text-foreground/65 hover:text-foreground hidden h-8 items-center rounded-full border border-black/[0.10] px-4 text-[13px] font-medium transition-colors hover:border-black/[0.20] sm:flex dark:border-white/[0.12] dark:hover:border-white/[0.25]"
              >
                Sign in
              </Link>
              <Link
                href={`/claim-link${jobParam}`}
                className="flex h-8 items-center gap-1.5 rounded-full bg-[#1A1A1A] px-4 text-[13px] font-medium text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
              >
                <Sparkles className="h-3.5 w-3.5" />
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
              <Button asChild size="sm" className="hidden items-center rounded-full sm:flex">
                <Link href="/jobs">
                  <Briefcase className="h-4 w-4" />
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
