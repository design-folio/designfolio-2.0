import { motion } from "framer-motion";
import ArrowCTA from "./shared/ArrowCTA";

export default function LandingHeroSection({ dfToken }) {
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
        <div className="relative inline-block">
          <span
            className="relative z-10 text-transparent bg-clip-text animate-[shimmer-text_2.5s_ease-in-out_forwards_0.3s]"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--lp-text) 0%, var(--lp-text) 30%, #5D3560 40%, #E54D2E 50%, #F5A623 60%, var(--lp-text) 70%, var(--lp-text) 100%)",
              backgroundSize: "300% auto",
              backgroundPosition: "100% center",
            }}
          >
            Fastest
          </span>
        </div>{" "}
        way to build
        <br />
        your portfolio site
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="text-[16px] mb-8 max-w-[400px] leading-relaxed font-semibold text-[--lp-text]/70"
      >
        Skip the busywork with Designfolio —
        <br />
        publish in hours, not weeks.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        <ArrowCTA
          label={dfToken ? "Launch Builder" : "Get started for Free"}
          size="lg"
          href={dfToken ? "/builder" : "/claim-link"}
        />
      </motion.div>
    </section>
  );
}
