import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { CheckCircle2 } from "lucide-react";
import { ColorOrb } from "@/components/ui/color-orb";
import { Folder } from "@/components/ui/folder";
import { _postResumeParse } from "@/network/resume";
import ArrowCTA from "./shared/ArrowCTA";
import { Button } from "../ui/button";

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
  variant = "hero",
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
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className={
                variant === "modal"
                  ? "orb-always-active w-full flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-[--lp-border] bg-[--lp-text]/[0.03] px-6 py-10"
                  : "orb-always-active inline-flex items-center gap-3.5 rounded-xl border border-dashed border-[--lp-border] bg-[--lp-text]/[0.03] px-5 py-3"
              }
              style={{
                boxShadow: isDark
                  ? "0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)"
                  : "0 8px 32px rgba(29,27,26,0.14), 0 2px 8px rgba(29,27,26,0.08)",
              }}
            >
              <ColorOrb dimension={variant === "modal" ? "32px" : "14px"} spinDuration={5} />
              <div className={variant === "modal" ? "flex flex-col items-center gap-1" : ""}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={aiStatusIndex}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`text-[14px] font-semibold leading-none text-[--lp-text] ${variant === "modal" ? "text-center" : "whitespace-nowrap"}`}
                  >
                    {AI_STATUSES[aiStatusIndex]}
                  </motion.span>
                </AnimatePresence>
                <span className="text-[12px] text-[--lp-text-faint] leading-none">
                  This takes a few seconds...
                </span>
              </div>
            </motion.div>
          ) : showPrimaryCta ? (
            <motion.div
              key="ready-state"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col items-center gap-2.5"
            >
              <ArrowCTA
                label={primaryCtaLabel}
                size="lg"
                onClick={handlePrimaryClick}
              />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className={variant === "modal" ? "w-full flex flex-col items-center gap-4" : undefined}
            >
              <div
                data-testid="dropzone-resume"
                onClick={() => canUpload && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`group/dropzone cursor-pointer ${variant === "modal"
                  ? "w-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-10 [&_*]:cursor-pointer"
                  : "inline-flex items-center gap-3.5 rounded-xl border border-dashed px-5 py-3 [&_*]:cursor-pointer"
                  } transition-all duration-200 ${isDragging
                    ? "border-[--lp-accent] bg-[--lp-accent]/5"
                    : "border-[--lp-border] bg-[--lp-text]/[0.03] hover:border-[--lp-text]/45 hover:bg-[--lp-text]/[0.05]"
                  }`}
              >
                <Folder isDragging={isDragging} />
                <div className={`flex flex-col ${variant === "modal" ? "items-center text-center" : "items-start"} gap-0.5`}>
                  <span className={`text-[14px] mb-1 font-semibold leading-none transition-colors duration-200 ${isDragging ? "text-[--lp-accent]" : "text-[--lp-text]"}`}>
                    {isDragging ? "Drop it here" : variant === "modal" ? "Click to upload Resume" : "Upload your resume"}
                  </span>
                  <span className="text-[12px] text-[--lp-text-faint] leading-none">
                    {variant === "modal" ? "PDF format only · Max 5MB" : "PDF · max 5MB"}
                  </span>
                </div>
              </div>

              {variant === "modal" && (
                <>
                  <Button
                    variant="darker"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl py-3.5 text-[15px] h-[50px]"
                  >
                    Upload Resume
                  </Button>

                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    {["Data never sold", "Delete anytime"].map((label) => (
                      <span key={label} className="flex items-center gap-1 text-[11px] text-[--lp-text-faint] font-medium">
                        <CheckCircle2 className="w-3 h-3 shrink-0" strokeWidth={2} />
                        {label}
                      </span>
                    ))}
                  </div>
                </>
              )}
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
