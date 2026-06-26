import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle2 } from "lucide-react";
import { ColorOrb } from "@/components/ui/color-orb";
import { Folder } from "@/components/ui/folder";
import { EASE_OUT } from "./motion-constants";
import { _postResumeParse } from "@/network/resume";
import { usePostHogEvent } from "@/hooks/usePostHogEvent";
import { POSTHOG_EVENT_NAMES } from "@/lib/posthogEventNames";

const AI_STATUSES = [
  "Reading your resume…",
  "Extracting skills & experience…",
  "Checking fit for this role…",
  "Scoring against requirements…",
];

export function ScoreModal({ job, isDark, onClose }) {
  const router = useRouter();
  const event = usePostHogEvent();
  const [stage, setStage] = useState("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [aiStatusIndex, setAiStatusIndex] = useState(0);
  const fileInputRef = useRef(null);

  const handleFile = useCallback(
    async (file) => {
      if (!file || file.type !== "application/pdf") return;
      setStage("processing");
      const t0 = Date.now();
      let parseSuccess = false;
      try {
        const { data } = await _postResumeParse(file);
        sessionStorage.setItem("df_parsed_resume", JSON.stringify(data));
        parseSuccess = true;
      } catch {
        // Continue anyway — resume-signup page handles missing resume gracefully
      }
      event(POSTHOG_EVENT_NAMES.JOB_SHARE_RESUME_UPLOADED, {
        job_id: job.id || null,
        job_company: job.company || null,
        job_role: job.role || null,
        parse_success: parseSuccess,
      });
      sessionStorage.setItem("df_pending_job_id", job.id || "");
      const elapsed = Date.now() - t0;
      if (elapsed < 3000) await new Promise((r) => setTimeout(r, 3000 - elapsed));
      router.push(`/resume-signup?job=${job.id || ""}`);
    },
    [job.id, job.company, job.role, router, event]
  );

  // Cycle AI status messages while processing
  useEffect(() => {
    if (stage !== "processing") return;
    setAiStatusIndex(0);
    const interval = setInterval(() => {
      setAiStatusIndex((i) => (i + 1) % AI_STATUSES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [stage]);

  return (
    <motion.div
      key="score-modal-backdrop"
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
        key="score-modal-card"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[560px] rounded-3xl border border-[#E2E1DA] dark:border-white/10 bg-[#FDFCF8] dark:bg-[#1C1A19] shadow-2xl overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-[#1D1B1A]/[0.06] dark:bg-white/[0.08] text-[#1D1B1A]/50 dark:text-foreground dark:[opacity:0.5] hover:bg-[#1D1B1A]/[0.12] dark:hover:bg-white/[0.14] hover:text-[#1D1B1A] dark:hover:text-foreground dark:hover:[opacity:1] transition-all duration-150"
        >
          <X className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>

        <div className="p-7 md:p-9">
          <AnimatePresence mode="wait">
            {stage === "upload" && (
              <motion.div
                key="stage-upload"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {/* Company badge */}
                <div className="flex items-center gap-2 mb-5">
                  {job.logoUrl ? (
                    <img
                      src={job.logoUrl}
                      alt={job.company}
                      className="w-7 h-7 rounded-lg object-contain border border-black/[0.05] shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-foreground/[0.08] flex items-center justify-center text-foreground/50 text-[11px] font-bold shrink-0">
                      {job.company?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <p className="text-[11px] font-semibold text-[#1D1B1A]/40 dark:text-foreground dark:[opacity:0.4] uppercase tracking-widest truncate">
                    {job.company} · {job.role}
                  </p>
                </div>

                <div className="mb-7">
                  <h2 className="text-[22px] font-bold text-[#1D1B1A] dark:text-foreground tracking-tight leading-tight mb-1.5">
                    See if you&apos;re a match
                  </h2>
                  <p className="text-[14px] text-[#1D1B1A]/55 dark:text-foreground dark:[opacity:0.55] leading-relaxed">
                    Upload your resume and we&apos;ll instantly score how well you fit this role —
                    for free.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Dropzone */}
                  <div
                    className={`group/dropzone w-full cursor-pointer flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-10 transition-all duration-200 ${isDragging
                        ? "border-[#FF553E] bg-[#FF553E]/5"
                        : "border-[#1D1B1A]/20 dark:border-white/20 bg-[#1D1B1A]/[0.025] dark:bg-white/[0.04] hover:border-[#1D1B1A]/40 dark:hover:border-white/35 hover:bg-[#1D1B1A]/[0.04] dark:hover:bg-white/[0.06]"
                      }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleFile(e.dataTransfer.files?.[0]);
                    }}
                  >
                    <Folder isDragging={isDragging} />
                    <div className="text-center">
                      <p
                        className={`text-[14px] font-semibold leading-none mb-1 transition-colors duration-200 ${isDragging ? "text-[#FF553E]" : "text-[#1D1B1A] dark:text-foreground"}`}
                      >
                        {isDragging ? "Drop it here" : "Click to upload Resume"}
                      </p>
                      <p className="text-[12px] text-[#1D1B1A]/40 dark:text-foreground dark:[opacity:0.4]">
                        PDF format only · Max 5MB
                      </p>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl bg-[#1D1B1A] dark:bg-white text-[#FDFCF8] dark:text-[#1D1B1A] py-3.5 text-[15px] font-semibold transition-colors duration-300 hover:bg-[#FF553E] dark:hover:bg-[#FF553E] dark:hover:text-white"
                  >
                    Upload Resume
                  </button>

                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    {["Data never sold", "Delete anytime"].map((label) => (
                      <span
                        key={label}
                        className="flex items-center gap-1 text-[11px] text-[#1D1B1A]/35 dark:text-foreground dark:[opacity:0.35] font-medium"
                      >
                        <CheckCircle2 className="w-3 h-3 shrink-0" strokeWidth={2} />
                        {label}
                      </span>
                    ))}
                  </div>
                  <p className="text-center text-[13px] text-[#1D1B1A]/45 dark:text-foreground dark:[opacity:0.45]">
                    Already have an account?{" "}
                    <button
                      onClick={() => router.push("/login")}
                      className="font-semibold text-[#1D1B1A] dark:text-foreground underline underline-offset-2 hover:text-[#FF553E] dark:hover:text-[#FF553E] transition-colors duration-150"
                    >
                      Login
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {stage === "processing" && (
              <motion.div
                key="stage-processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="orb-always-active flex flex-col items-center justify-center gap-4 py-16"
              >
                <ColorOrb dimension="40px" spinDuration={5} />
                <div className="flex flex-col items-center gap-1">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={aiStatusIndex}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="text-[14px] font-semibold leading-none text-[#1D1B1A] dark:text-foreground text-center"
                    >
                      {AI_STATUSES[aiStatusIndex]}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[12px] text-[#1D1B1A]/40 dark:text-foreground dark:[opacity:0.4] leading-none mt-1">
                    This takes a few seconds…
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
