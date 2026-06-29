import { motion } from "motion/react";
import { Briefcase } from "lucide-react";
import { useRouter } from "next/router";

/**
 * Floating action button that switches the user to the Jobs page.
 * Sits fixed at bottom-right on the builder page, visible only when logged in.
 */
export function JobsSwitchFAB() {
  const router = useRouter();

  return (
    <motion.div
      className="fixed right-6 bottom-6 z-[9999]"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.button
        onClick={() => router.push("/jobs")}
        className="bg-foreground text-background hover:bg-foreground/90 flex h-10 items-center gap-2 rounded-full pr-4 pl-3.5 text-[13px] font-semibold shadow-lg shadow-black/20 transition-colors"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        title="Find Jobs"
      >
        <Briefcase className="h-4 w-4 shrink-0" />
        Find Jobs
      </motion.button>
    </motion.div>
  );
}
