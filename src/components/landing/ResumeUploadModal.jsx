import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import ResumeUploadZone from "./ResumeUploadZone";

export default function ResumeUploadModal({
  open,
  onClose,
  hasDfToken,
  hasParsedResume,
  onPrimaryCta,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="upload-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          style={{
            backgroundColor: "rgba(29,27,26,0.45)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          }}
          onClick={onClose}
        >
          <motion.div
            key="upload-modal-card"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-[440px] rounded-[24px] bg-[#FDFCF8] dark:bg-[#1D1B1A] border border-black/[0.08] dark:border-white/[0.1] p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-black/50 dark:text-white/50 hover:bg-black/[0.12] dark:hover:bg-white/[0.14] transition-all duration-150"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>

            <h2
              className="text-[20px] font-bold text-[--lp-text] mb-2 tracking-tight"
              style={{ fontFamily: "var(--font-manrope), sans-serif" }}
            >
              Turn your resume into a portfolio
            </h2>
            <p
              className="text-[14px] text-[--lp-text-muted] mb-6"
              style={{ fontFamily: "var(--font-manrope), sans-serif" }}
            >
              Upload your PDF and AI will build your portfolio, scan job matches, and get you ready to apply.
            </p>

            <div className="flex justify-center">
              <ResumeUploadZone
                hasDfToken={hasDfToken}
                hasParsedResume={hasParsedResume}
                onPrimaryCta={onPrimaryCta}
                primaryCtaLabel={hasDfToken ? "Launch Builder" : hasParsedResume ? "Continue Signup" : "Upload Resume"}
              />
            </div>

            <p
              className="text-center text-[12px] text-[--lp-text-faint] mt-6"
              style={{ fontFamily: "var(--font-manrope), sans-serif" }}
            >
              Free to start · No credit card required
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
