import { cn } from "@/lib/utils";

export default function TrustedBySection({ classNames }) {
  const companyLogos = [
    "/assets/svgs/company logos/companylogos02.svg",
    "/assets/svgs/company logos/companylogos03.svg",
    "/assets/svgs/company logos/companylogos01.svg",
    "/assets/svgs/company logos/companylogos04.svg",
    "/assets/svgs/company logos/companylogos05.svg",
    "/assets/svgs/company logos/companylogos06.svg",
    "/assets/svgs/company logos/companylogos07.svg",
  ];

  return (
    <section className="w-full overflow-hidden px-4 py-8 sm:px-6 sm:py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        <h3
          className="text-foreground-landing/50 mb-6 text-center text-xs font-medium sm:mb-8 sm:text-sm md:mb-10 md:text-base"
          data-testid="text-trusted-heading"
        >
          Helping 25,000+ Product Folks to Land their Dream Roles
        </h3>

        <div className="relative overflow-hidden">
          <div
            className={cn(
              "from-background-landing pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-16 bg-gradient-to-r to-transparent sm:w-24 md:w-40",
              classNames
            )}
          />

          <div
            className={cn(
              "from-background-landing pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-16 bg-gradient-to-l to-transparent sm:w-24 md:w-40",
              classNames
            )}
          />

          <div className="flex gap-0 overflow-hidden">
            <div className="animate-scroll flex shrink-0 items-center gap-0">
              {companyLogos.map((logo, index) => (
                <div
                  key={`first-${index}`}
                  className="flex shrink-0 items-center justify-center px-4 sm:px-6 md:px-10"
                  data-testid={`logo-company-${index}`}
                >
                  <img
                    src={logo}
                    alt={`Company logo ${index + 1}`}
                    className="h-5 w-auto opacity-50 grayscale transition-all duration-300 hover:opacity-70 hover:grayscale-0 sm:h-6 md:h-8 dark:invert"
                  />
                </div>
              ))}
            </div>

            <div className="animate-scroll flex shrink-0 items-center gap-0" aria-hidden="true">
              {companyLogos.map((logo, index) => (
                <div
                  key={`second-${index}`}
                  className="flex shrink-0 items-center justify-center px-4 sm:px-6 md:px-10"
                >
                  <img
                    src={logo}
                    alt=""
                    className="h-5 w-auto opacity-50 grayscale transition-all duration-300 hover:opacity-70 hover:grayscale-0 sm:h-6 md:h-8 dark:invert"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
