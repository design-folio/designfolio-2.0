import { motion, useScroll, useTransform } from "framer-motion"

export default function PortfolioSection() {
  const { scrollY } = useScroll()

  const scrollRange = 400
  const cardScale = useTransform(
    scrollY,
    [scrollRange * 0.4, scrollRange * 0.8],
    [0.95, 1]
  )

  return (
    <section className="py-12 sm:py-16 md:py-20 px-6 bg-background-landing">
      <div className="max-w-[848px] mx-auto">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl text-center text-foreground mb-3 sm:mb-4"
          data-testid="text-portfolio-heading"
        >
          Featured Case Studies
        </h2>
        <p
          className="text-sm sm:text-base md:text-lg lg:text-xl text-center text-foreground/70 mb-8 sm:mb-12 md:mb-16"
          data-testid="text-portfolio-description"
        >
          Explore how designers are building stunning portfolios
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <motion.div
            id="portfolio-card-1"
            className="bg-white dark:bg-card rounded-xl lg:rounded-2xl border border-border overflow-hidden shadow-lg flex flex-col relative z-20"
            style={{
              scale: cardScale
            }}
            data-testid="card-portfolio-placeholder-1"
          >
            <div className="aspect-video relative overflow-hidden">
              <img
                src="/casestudyux1.svg"
                alt="Fitness app redesign case study"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 md:p-5 flex-1 flex flex-col">
              <h3
                className="font-gsans text-base md:text-lg lg:text-xl font-semibold text-foreground mb-1 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]"
                data-testid="text-portfolio-1-title"
              >
                Redesigning fitness app experience for 4M users.
              </h3>
              <p
                className="text-xs md:text-sm text-foreground/50"
                data-testid="text-portfolio-1-category"
              >
                AI Fitness Tracker
              </p>
            </div>
          </motion.div>

          <motion.div
            id="portfolio-card-2"
            className="bg-white dark:bg-card rounded-xl lg:rounded-2xl border border-border overflow-hidden shadow-lg flex flex-col relative z-20"
            style={{
              scale: cardScale
            }}
            data-testid="card-portfolio-placeholder-2"
          >
            <div className="aspect-video bg-gradient-to-br from-green-400 to-emerald-300 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-white/20 rounded-xl backdrop-blur-sm"></div>
              </div>
            </div>
            <div className="p-4 md:p-5 flex-1 flex flex-col">
              <h3
                className="font-gsans text-base md:text-lg lg:text-xl font-semibold text-foreground mb-1 line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]"
                data-testid="text-portfolio-2-title"
              >
                Developed a Blockchain app on Next.JS
              </h3>
              <p
                className="text-xs md:text-sm text-foreground/50"
                data-testid="text-portfolio-2-category"
              >
                Case Study by Chris
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
