import { motion, useScroll, useTransform } from "motion/react";

export default function PortfolioSection() {
  const { scrollY } = useScroll();

  const scrollRange = 400;
  const cardScale = useTransform(scrollY, [scrollRange * 0.4, scrollRange * 0.8], [0.95, 1]);

  return (
    <section className="bg-background-landing px-6 py-12 sm:py-16 md:py-20">
      <div className="mx-auto max-w-[848px]">
        <h2
          className="text-foreground mb-3 text-center text-2xl sm:mb-4 sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl"
          data-testid="text-portfolio-heading"
        >
          Featured Case Studies
        </h2>
        <p
          className="text-foreground/70 mb-8 text-center text-sm sm:mb-12 sm:text-base md:mb-16 md:text-lg lg:text-xl"
          data-testid="text-portfolio-description"
        >
          Explore how designers are building stunning portfolios
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <motion.div
            id="portfolio-card-1"
            className="dark:bg-card border-border relative z-20 flex flex-col overflow-hidden rounded-xl border bg-white shadow-lg lg:rounded-2xl"
            style={{
              scale: cardScale,
            }}
            data-testid="card-portfolio-placeholder-1"
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src="/casestudyux1.svg"
                alt="Fitness app redesign case study"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-1 flex-col p-4 md:p-5">
              <h3
                className="font-gsans text-foreground mb-1 line-clamp-2 min-h-[2.5rem] text-base font-semibold md:min-h-[3rem] md:text-lg lg:text-xl"
                data-testid="text-portfolio-1-title"
              >
                Redesigning fitness app experience for 4M users.
              </h3>
              <p
                className="text-foreground/50 text-xs md:text-sm"
                data-testid="text-portfolio-1-category"
              >
                AI Fitness Tracker
              </p>
            </div>
          </motion.div>

          <motion.div
            id="portfolio-card-2"
            className="dark:bg-card border-border relative z-20 flex flex-col overflow-hidden rounded-xl border bg-white shadow-lg lg:rounded-2xl"
            style={{
              scale: cardScale,
            }}
            data-testid="card-portfolio-placeholder-2"
          >
            <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-green-400 to-emerald-300">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-3/4 w-3/4 rounded-xl bg-white/20 backdrop-blur-sm"></div>
              </div>
            </div>
            <div className="flex flex-1 flex-col p-4 md:p-5">
              <h3
                className="font-gsans text-foreground mb-1 line-clamp-2 min-h-[2.5rem] text-base font-semibold md:min-h-[3rem] md:text-lg lg:text-xl"
                data-testid="text-portfolio-2-title"
              >
                Developed a Blockchain app on Next.JS
              </h3>
              <p
                className="text-foreground/50 text-xs md:text-sm"
                data-testid="text-portfolio-2-category"
              >
                Case Study by Chris
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
