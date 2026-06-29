import { motion } from "motion/react";

const LOGO_COUNT = 7;

export default function LandingTrustedBySection() {
  return (
    <section
      className="mb-20 flex w-full flex-col gap-6 px-6"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <div className="flex items-center gap-3">
        <div className="bg-lp-text/[0.07] h-px flex-1" />
        <span className="text-lp-text/55 text-[12px] font-semibold tracking-[0.08em] whitespace-nowrap uppercase">
          31,000+ Designfolio users work at
        </span>
        <div className="bg-lp-text/[0.07] h-px flex-1" />
      </div>

      <div
        className="relative w-full overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <motion.div
          className="flex w-max items-center"
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
                  className="h-[40px] w-auto opacity-60 transition-opacity duration-300 hover:opacity-85 dark:opacity-70 dark:invert dark:hover:opacity-90"
                />
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
