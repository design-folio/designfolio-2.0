import { motion } from "motion/react";

const LOGO_COUNT = 7;

export default function LandingTrustedBySection() {
  return (
    <section
      className="w-full px-6 mb-20 flex flex-col gap-6"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-lp-text/[0.07]" />
        <span className="text-[12px] font-semibold tracking-[0.08em] uppercase text-lp-text/55 whitespace-nowrap">
          31,000+ Designfolio users work at
        </span>
        <div className="flex-1 h-px bg-lp-text/[0.07]" />
      </div>

      <div
        className="w-full overflow-hidden relative"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <motion.div
          className="flex items-center w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 40, repeat: Infinity }}
        >
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-x-10 pr-10">
              {[...Array(LOGO_COUNT)].map((_, num) => (
                <img
                  key={num}
                  src={`/companylogo/companienames0${num + 1}.svg`}
                  alt={`Company logo ${num + 1}`}
                  className="h-[40px] w-auto opacity-60 hover:opacity-85 transition-opacity duration-300 dark:invert dark:opacity-70 dark:hover:opacity-90"
                />
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
