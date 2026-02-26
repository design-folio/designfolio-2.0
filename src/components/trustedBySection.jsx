import { cn } from "@/lib/utils"

export default function TrustedBySection({ classNames }) {
  const companyLogos = [
    "/assets/svgs/company logos/companylogos02.svg",
    "/assets/svgs/company logos/companylogos03.svg",
    "/assets/svgs/company logos/companylogos01.svg",
    "/assets/svgs/company logos/companylogos04.svg",
    "/assets/svgs/company logos/companylogos05.svg",
    "/assets/svgs/company logos/companylogos06.svg",
    "/assets/svgs/company logos/companylogos07.svg"
  ]


  return (
    <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 overflow-hidden w-full">
      <div className="max-w-5xl mx-auto">
        <h3
          className="text-center text-xs sm:text-sm md:text-base font-medium text-foreground-landing/50 mb-6 sm:mb-8 md:mb-10"
          data-testid="text-trusted-heading"
        >
          Helping 25,000+ Product Folks to Land their Dream Roles
        </h3>

        <div className="relative overflow-hidden">
          <div
            className={cn(
              "absolute left-0 top-0 bottom-0 w-16 sm:w-24 md:w-40 z-10 pointer-events-none bg-gradient-to-r to-transparent from-background-landing", classNames
            )}
          />


          <div
            className={cn(
              "absolute right-0 top-0 bottom-0 w-16 sm:w-24 md:w-40 z-10 pointer-events-none bg-gradient-to-l to-transparent from-background-landing", classNames
            )}
          />

          <div className="flex gap-0 overflow-hidden">
            <div className="flex animate-scroll items-center gap-0 shrink-0">
              {companyLogos.map((logo, index) => (
                <div
                  key={`first-${index}`}
                  className="flex items-center justify-center px-4 sm:px-6 md:px-10 flex-shrink-0"
                  data-testid={`logo-company-${index}`}
                >
                  <img
                    src={logo}
                    alt={`Company logo ${index + 1}`}
                    className="h-5 sm:h-6 md:h-8 w-auto opacity-50 grayscale hover:opacity-70 hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>

            <div
              className="flex animate-scroll items-center gap-0 shrink-0"
              aria-hidden="true"
            >
              {companyLogos.map((logo, index) => (
                <div
                  key={`second-${index}`}
                  className="flex items-center justify-center px-4 sm:px-6 md:px-10 flex-shrink-0"
                >
                  <img
                    src={logo}
                    alt=""
                    className="h-5 sm:h-6 md:h-8 w-auto opacity-50 grayscale hover:opacity-70 hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
