import { motion } from "framer-motion";

const LOGO_COUNT = 7;

export default function LandingTrustedBySection() {
  return (
    <section
      className="w-full px-6 mb-20 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <div className="text-[14px] text-[--lp-text]/60 leading-tight whitespace-nowrap text-center md:text-left shrink-0 font-semibold">
        Trusted by folks
        <br className="hidden md:block" /> working at
      </div>

      <div
        className="flex-1 w-full overflow-hidden relative"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <motion.div
          className="flex items-center text-[--lp-text]/40 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 50, repeat: Infinity }}
        >
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-x-8 pr-8">
              {[...Array(LOGO_COUNT)].map((_, num) => (
                <img
                  key={num}
                  src={`/companylogo/companienames0${num + 1}.svg`}
                  alt={`Company logo ${num + 1}`}
                  className="h-[32px] w-auto opacity-50 hover:opacity-80 transition-opacity dark:invert dark:opacity-75 dark:hover:opacity-100"
                />
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
