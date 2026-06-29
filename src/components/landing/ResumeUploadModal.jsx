import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import ResumeUploadZone from "./ResumeUploadZone";

export default function ResumeUploadModal({
  open,
  onClose,
  hasDfToken,
  hasParsedResume,
  onPrimaryCta,
  primaryCtaLoading,
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

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
            backgroundColor: isDark ? "rgba(10,9,8,0.75)" : "rgba(29,27,26,0.45)",
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
            className="relative w-full max-w-[640px] overflow-hidden rounded-3xl border border-(--lp-video-border) bg-(--lp-fg-white) shadow-2xl dark:bg-(--lp-card)"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="bg-lp-text/[0.06] text-lp-text/50 hover:bg-lp-text/[0.12] absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150 hover:text-(--lp-text)"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            </button>

            <div className="p-7 md:p-9">
              <div className="mb-7">
                <h2
                  className="mb-1.5 text-[22px] leading-tight font-bold tracking-tight text-(--lp-text)"
                  style={{ fontFamily: "var(--font-manrope), sans-serif" }}
                >
                  Everything starts with your Resume
                </h2>
                <p
                  className="text-[14px] leading-relaxed text-(--lp-text-muted)"
                  style={{ fontFamily: "var(--font-manrope), sans-serif" }}
                >
                  Upload once. AI builds your portfolio, matches jobs, and sets you up for your next
                  role.
                </p>
              </div>

              <div className="flex flex-col gap-5">
                <ResumeUploadZone
                  hasDfToken={hasDfToken}
                  hasParsedResume={hasParsedResume}
                  onPrimaryCta={onPrimaryCta}
                  variant="modal"
                  primaryCtaLoading={primaryCtaLoading}
                  primaryCtaLabel={
                    hasDfToken
                      ? "Launch Builder"
                      : hasParsedResume
                        ? "Continue Signup"
                        : "Upload Resume"
                  }
                />
                <div className="flex flex-col gap-4">
                  {[
                    {
                      img: "/previewproject/buildresume.png",
                      title: "Portfolio built in seconds",
                      desc: "AI reads your resume and generates a beautiful, ready-to-share portfolio automatically.",
                    },
                    {
                      img: "/previewproject/jobs.png",
                      title: "Jobs matched to your skills",
                      desc: "Scout scans thousands of roles and shortlists the ones where you're a top applicant.",
                    },
                  ].map(({ img, title, desc }) => (
                    <div key={title} className="flex items-start gap-3.5">
                      <img
                        src={img}
                        alt={title}
                        className="h-12 w-12 shrink-0 object-cover"
                        style={{ borderRadius: "22%" }}
                      />
                      <div>
                        <p className="mb-1 text-[15px] leading-snug font-semibold text-(--lp-text)">
                          {title}
                        </p>
                        <p className="text-[13px] leading-relaxed text-(--lp-text-muted)">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
