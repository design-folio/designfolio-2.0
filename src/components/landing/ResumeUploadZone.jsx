import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { ArrowUpRight, FileUp } from "lucide-react";
import { ColorOrb } from "@/components/ui/color-orb";
import { _postResumeParse } from "@/network/resume";

const AI_STATUSES = [
  "Reading your resume...",
  "Extracting skills & experience...",
  "Building your portfolio...",
  "Scanning matched jobs...",
];

export default function ResumeUploadZone({
  hasDfToken = false,
  hasParsedResume = false,
  onPrimaryCta,
  primaryCtaLabel = "Upload Resume",
}) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const fileInputRef = useRef(null);
  const uploadZoneRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiStatusIndex, setAiStatusIndex] = useState(0);
  const [cutoutPos, setCutoutPos] = useState({ x: 0, y: 300 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Cycle AI status text while processing
  useEffect(() => {
    if (!isProcessing) return;
    setAiStatusIndex(0);
    const interval = setInterval(() => {
      setAiStatusIndex((i) => (i + 1) % AI_STATUSES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isProcessing]);

  // Lock scroll when processing + capture cutout position
  useEffect(() => {
    if (isProcessing) {
      if (uploadZoneRef.current) {
        const rect = uploadZoneRef.current.getBoundingClientRect();
        setCutoutPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
    } else {
      const lockedTop = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      if (lockedTop) window.scrollTo(0, parseInt(lockedTop) * -1);
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
    };
  }, [isProcessing]);

  const processFile = useCallback(
    async (file) => {
      if (!file) return;
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File must be under 5 MB.");
        return;
      }

      setIsProcessing(true);

      try {
        const { data } = await _postResumeParse(file);
        sessionStorage.setItem("df_parsed_resume", JSON.stringify(data));
        setTimeout(() => router.push("/resume-signup"), 400);
      } catch (err) {
        setIsProcessing(false);
        const msg =
          err?.response?.data?.message ||
          "Couldn't read your resume. Try a text-based PDF.";
        toast.error(msg);
      }
    },
    [router],
  );

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") processFile(file);
  };

  const { x, y } = cutoutPos;
  const showPrimaryCta = !isProcessing && (hasDfToken || hasParsedResume);
  const canUpload = !hasDfToken && !hasParsedResume;
  const handlePrimaryClick = () => {
    if (onPrimaryCta) {
      onPrimaryCta();
      return;
    }
    if (hasDfToken) {
      router.push("/builder");
      return;
    }
    if (hasParsedResume) {
      router.push("/resume-signup");
    }
  };

  return (
    <>
      <div ref={uploadZoneRef} className="inline-flex w-full justify-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          data-testid="input-resume-upload"
          onChange={handleFileInput}
        />

        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1.06 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="orb-always-active inline-flex items-center gap-3 rounded-full border border-[--lp-border] bg-[--lp-text]/[0.03] px-5 py-[10px]"
              style={{
                boxShadow: isDark
                  ? "0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)"
                  : "0 8px 32px rgba(29,27,26,0.14), 0 2px 8px rgba(29,27,26,0.08)",
              }}
            >
              <ColorOrb dimension="14px" spinDuration={5} />
              <AnimatePresence mode="wait">
                <motion.span
                  key={aiStatusIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="text-[14px] font-medium text-[--lp-text-muted] whitespace-nowrap"
                >
                  {AI_STATUSES[aiStatusIndex]}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          ) : showPrimaryCta ? (
            <motion.button
              key="ready-state"
              type="button"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              onClick={handlePrimaryClick}
              className="group cursor-pointer flex w-full items-center justify-center gap-3.5 rounded-2xl border border-dashed border-[--lp-text]/22 bg-[--lp-text]/[0.035] px-6 py-4 shadow-[0_1px_0_rgba(0,0,0,0.02)] transition-all duration-200 hover:-translate-y-[1px] hover:border-[--lp-text]/50 hover:bg-[--lp-text]/[0.06]"
            >
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-[--lp-text] text-[--lp-fg-white] transition-colors duration-500 ease-in-out group-hover:bg-[--lp-accent-hover] group-hover:text-white">
                <ArrowUpRight className="absolute top-1/2 left-1/2 h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-6 group-hover:-translate-y-6" strokeWidth={2.5} />
                <ArrowUpRight className="absolute top-1/2 left-1/2 h-[14px] w-[14px] -translate-x-7 translate-y-7 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2 group-hover:-translate-y-1/2" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col items-start gap-0.5 text-left">
                <span className="text-[14px] font-semibold leading-none text-[--lp-text]">
                  {primaryCtaLabel}
                </span>
                <span className="text-[12px] text-[--lp-text-faint] leading-none">
                  {hasDfToken ? "Open your existing workspace" : "Resume already parsed"}
                </span>
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              data-testid="dropzone-resume"
              onClick={() => canUpload && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`group/dropzone cursor-pointer flex w-full items-center justify-center gap-3.5 rounded-2xl border border-dashed px-6 py-4 shadow-[0_1px_0_rgba(0,0,0,0.02)] transition-all duration-200 ${
                isDragging
                  ? "border-[--lp-accent] bg-[--lp-accent]/5"
                  : "border-[--lp-text]/22 bg-[--lp-text]/[0.035] hover:-translate-y-[1px] hover:border-[--lp-text]/50 hover:bg-[--lp-text]/[0.06]"
              }`}
            >
              <FileUp
                className={`h-[18px] w-[18px] shrink-0 transition-colors duration-200 ${
                  isDragging ? "text-[--lp-accent]" : "text-[--lp-text]/60"
                }`}
                strokeWidth={2}
              />
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-[14px] font-semibold leading-none text-[--lp-text]">
                  {isDragging ? "Drop it here" : "Upload your resume"}
                </span>
                <span className="text-[12px] text-[--lp-text-faint] leading-none">
                  PDF · max 5MB
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed overlays — portalled to document.body */}
      {mounted && createPortal(
        <>
          {/* Backdrop spotlight */}
          <motion.div
            animate={{ opacity: isProcessing ? 1 : 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="fixed inset-0 z-[80] pointer-events-none"
            style={{
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              background: isDark
                ? `radial-gradient(ellipse 400px 120px at ${x}px ${y}px, transparent 0%, rgba(8,7,6,0.65) 62%)`
                : `radial-gradient(ellipse 400px 120px at ${x}px ${y}px, transparent 0%, rgba(250,248,238,0.72) 62%)`,
              maskImage: `radial-gradient(ellipse 400px 120px at ${x}px ${y}px, transparent 0%, black 62%)`,
              WebkitMaskImage: `radial-gradient(ellipse 400px 120px at ${x}px ${y}px, transparent 0%, black 62%)`,
            }}
          />

          {/* Corner bracket — top-left */}
          <motion.div
            animate={{ opacity: isProcessing ? 0.8 : 0, x: isProcessing ? 0 : 5, y: isProcessing ? 0 : 5 }}
            transition={{ duration: 0.35, delay: isProcessing ? 0.15 : 0 }}
            className="fixed z-[82] pointer-events-none"
            style={{
              left: x - 212, top: y - 66,
              width: 14, height: 14,
              borderTop: "1.5px solid rgba(255,85,62,0.9)",
              borderLeft: "1.5px solid rgba(255,85,62,0.9)",
            }}
          />
          {/* Corner bracket — top-right */}
          <motion.div
            animate={{ opacity: isProcessing ? 0.8 : 0, x: isProcessing ? 0 : -5, y: isProcessing ? 0 : 5 }}
            transition={{ duration: 0.35, delay: isProcessing ? 0.15 : 0 }}
            className="fixed z-[82] pointer-events-none"
            style={{
              left: x + 198, top: y - 66,
              width: 14, height: 14,
              borderTop: "1.5px solid rgba(255,85,62,0.9)",
              borderRight: "1.5px solid rgba(255,85,62,0.9)",
            }}
          />
          {/* Corner bracket — bottom-left */}
          <motion.div
            animate={{ opacity: isProcessing ? 0.8 : 0, x: isProcessing ? 0 : 5, y: isProcessing ? 0 : -5 }}
            transition={{ duration: 0.35, delay: isProcessing ? 0.15 : 0 }}
            className="fixed z-[82] pointer-events-none"
            style={{
              left: x - 212, top: y + 52,
              width: 14, height: 14,
              borderBottom: "1.5px solid rgba(255,85,62,0.9)",
              borderLeft: "1.5px solid rgba(255,85,62,0.9)",
            }}
          />
          {/* Corner bracket — bottom-right */}
          <motion.div
            animate={{ opacity: isProcessing ? 0.8 : 0, x: isProcessing ? 0 : -5, y: isProcessing ? 0 : -5 }}
            transition={{ duration: 0.35, delay: isProcessing ? 0.15 : 0 }}
            className="fixed z-[82] pointer-events-none"
            style={{
              left: x + 198, top: y + 52,
              width: 14, height: 14,
              borderBottom: "1.5px solid rgba(255,85,62,0.9)",
              borderRight: "1.5px solid rgba(255,85,62,0.9)",
            }}
          />
          {/* Scanning line */}
          <motion.div
            animate={
              isProcessing
                ? { top: [`${y - 35}px`, `${y + 35}px`, `${y - 35}px`], opacity: [0, 0.5, 0.5, 0] }
                : { opacity: 0 }
            }
            transition={
              isProcessing
                ? { duration: 2.2, repeat: Infinity, ease: "easeInOut", times: [0, 0.45, 0.9, 1] }
                : { duration: 0.25 }
            }
            className="fixed z-[82] pointer-events-none"
            style={{
              left: x - 190, width: 380, height: 1,
              background: "linear-gradient(to right, transparent, rgba(255,85,62,0.65) 20%, rgba(255,85,62,0.65) 80%, transparent)",
            }}
          />
        </>,
        document.body,
      )}
    </>
  );
}
