import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft } from "lucide-react";
import { ColorOrb } from "@/components/ui/color-orb";

const PHRASES = {
  resume: [
    "Scanning your experience",
    "Mapping to job requirements",
    "Highlighting key achievements",
    "Strengthening keywords",
    "Optimising your summary",
    "Finalising your resume",
  ],
  coverLetter: [
    "Reading your portfolio",
    "Studying the job description",
    "Matching your strongest projects",
    "Shaping your narrative",
    "Calibrating the tone",
    "Finalising your letter",
  ],
};

const TITLE = { resume: "Tailored Resume", coverLetter: "Cover Letter" };

// Loader shown while the real generation request is in flight. The parent
// unmounts it when the request resolves — there is no fake timer here.
export default function DocumentGeneratingView({ type = "resume", job, onBack }) {
  const phrases = PHRASES[type] || PHRASES.resume;
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setI((p) => (p + 1) % phrases.length);
        setVisible(true);
      }, 280);
    }, 1100);
    return () => clearInterval(id);
  }, [phrases.length]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 shrink-0 flex items-center gap-3 h-[64px] border-b border-black/[0.08] dark:border-white/[0.08]">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-foreground/45 hover:text-foreground/75 transition-colors group -ml-1"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[13px]">{job?.role}</span>
        </button>
        <div className="h-3.5 w-px bg-black/[0.10] dark:bg-white/[0.10]" />
        <span className="text-[13px] font-semibold text-foreground/80">{TITLE[type]}</span>
        <span className="ml-auto text-[12px] text-foreground/40">{job?.company}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8 relative overflow-hidden">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.34, 1.3, 0.64, 1] }}
          className="orb-spinning relative z-10"
        >
          <ColorOrb dimension="72px" spinDuration={4} />
        </motion.div>

        <div className="flex flex-col items-center gap-2 z-10">
          <div className="h-7 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              {visible && (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={{ duration: 0.26, ease: "easeOut" }}
                  className="text-[15px] font-semibold tracking-tight whitespace-nowrap text-foreground/85"
                >
                  {phrases[i]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <p className="text-[12px] text-foreground/35 leading-snug text-center max-w-[230px]">
            Tailoring for the {job?.role} role at {job?.company}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            {[0, 1, 2].map((d) => (
              <motion.div
                key={d}
                className="w-1.5 h-1.5 rounded-full bg-foreground/25"
                animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: d * 0.22, ease: "easeInOut" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
