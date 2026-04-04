import { forwardRef } from "react";
import { motion } from "framer-motion";

const LandingVideoSection = forwardRef(function LandingVideoSection({ isDark }, ref) {
  return (
    <section ref={ref} className="w-full px-6 mb-16">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        className="relative rounded-[20px] overflow-hidden shadow-xl border border-[--lp-video-border] bg-[#141414]"
      >
        <div className="relative w-full overflow-hidden" style={{ paddingTop: "65%" }}>
          <video
            key={isDark ? "dark" : "light"}
            src={isDark ? "/landing-video/hero-dark.mp4" : "/landing-video/hero-light.mp4"}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover origin-center"
          />
        </div>
      </motion.div>
    </section>
  );
});

export default LandingVideoSection;
