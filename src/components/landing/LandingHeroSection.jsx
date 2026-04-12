import { motion } from "framer-motion";
import ResumeUploadZone from "./ResumeUploadZone";

export default function LandingHeroSection() {
  return (
    <section
      className="w-full px-6 pt-12 pb-12 flex flex-col items-center text-center"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-[32px] sm:text-[40px] leading-[1.1] tracking-[-0.02em] max-w-[480px] mb-5 text-[--lp-text]"
        style={{ fontWeight: 650 }}
      >
        The career tool that works while you sleep.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="text-[16px] mb-8 max-w-[400px] leading-relaxed font-semibold text-[--lp-text-muted]"
      >
        Upload your resume. AI builds your portfolio, scans, scores, and shortlists matched jobs.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="w-full max-w-[400px] flex justify-center"
      >
        <ResumeUploadZone />
      </motion.div>
    </section>
  );
}
