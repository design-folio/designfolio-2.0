import { motion } from "framer-motion";
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
      className="fixed bottom-6 right-6 z-[9999]"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.button
        onClick={() => router.push("/jobs")}
        className="flex items-center gap-2 bg-foreground text-background text-[13px] font-semibold pl-3.5 pr-4 h-10 rounded-full shadow-lg shadow-black/20 hover:bg-foreground/90 transition-colors"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        title="Find Jobs"
      >
        <Briefcase className="w-4 h-4 flex-shrink-0" />
        Find Jobs
      </motion.button>
    </motion.div>
  );
}
