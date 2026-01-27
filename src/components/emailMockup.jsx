import Text from "./text";
import { BorderBeam } from "@/components/ui/border-beam";

export default function EmailMockup() {

    return (
        <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
                <div
                    className="rounded-[1.25rem] sm:rounded-[1.75rem] p-[2px] relative z-10 bg-gradient-to-r from-border/80 via-border/20 to-border/80 shadow-xl"
                    data-testid="container-portfolio-gradient"
                >
                    <BorderBeam size={400} duration={8} delay={0} borderWidth={4} colorFrom="#ffaa40" colorTo="#9c40ff" />
                    <div
                        className="bg-white dark:bg-background rounded-[1.125rem] sm:rounded-[1.625rem] overflow-hidden flex flex-col"
                        data-testid="container-portfolio-mockup"
                    >
                        {/* Mac Chrome Frame Header */}
                        <div className="bg-[#f6f6f6] dark:bg-[#1a1a1a] border-b border-border px-4 py-3 flex items-center gap-2">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]"></div>
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="relative rounded-md">
                                    <BorderBeam
                                        className="rounded-md"
                                        size={140}
                                        duration={10}
                                        borderWidth={2}
                                        colorFrom="#ffaa40"
                                        colorTo="#9c40ff"
                                    />
                                    <div className="relative bg-white dark:bg-[#2a2a2a] rounded-md px-3 py-1 text-[10px] text-foreground/40 border border-border/40 min-w-[200px] text-center truncate">
                                        morgan.designfolio.me
                                    </div>
                                </div>
                            </div>
                            <div className="w-12"></div>
                        </div>

                        <div className="p-8 sm:p-10 md:p-12">
                            <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8 pb-8">
                                <div className="flex-shrink-0">
                                    <div className="relative">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden shadow-md bg-muted/20 dark:bg-muted/10 relative">
                                            {/* Shimmer background effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/30 to-transparent animate-shimmer"></div>
                                            <video
                                                className="w-full h-full object-cover relative z-10"
                                                autoPlay
                                                loop
                                                muted
                                                playsInline
                                                data-testid="video-avatar"
                                            >
                                                <source src="/videos/avatarui1.mp4" type="video/mp4" />
                                            </video>
                                        </div>
                                    </div>
                                </div>

                            <div className="flex-1 min-w-0">
                                <Text
                                    as="h3"
                                    size="section-heading-sm"
                                    className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2"
                                    data-testid="text-portfolio-name"
                                >
                                    Hey, I'm Morgan.
                                </Text>
                                <p
                                    className="text-sm sm:text-base md:text-lg text-foreground/60 mb-4"
                                    data-testid="text-portfolio-role"
                                >
                                    Product Designer & Developer
                                </p>
                                <p
                                    className="text-xs sm:text-sm md:text-base text-foreground/70 leading-relaxed mb-4"
                                    data-testid="text-portfolio-description"
                                >
                                    A unicorn designer who can both design and code. Designed
                                    experiences in sports, medtech, gig economy, fintech, and
                                    gamified learning.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span
                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-landing/10 text-primary-landing  text-xs sm:text-sm rounded-full"
                                        data-testid="badge-location"
                                    >
                                        <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                        Gotham City
                                    </span>
                                    <span
                                        className="relative inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50/80 dark:bg-green-950/30 backdrop-blur-sm border border-green-200/50 dark:border-green-800/50 text-green-700 dark:text-green-400 text-xs sm:text-sm rounded-full overflow-hidden"
                                        data-testid="badge-availability"
                                    >
                                        <span className="absolute inset-0 bg-gradient-to-r from-green-100/50 to-emerald-100/50 dark:from-green-900/20 dark:to-emerald-900/20 animate-pulse"></span>
                                        <svg
                                            className="w-3 h-3 relative z-10 animate-pulse"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <circle
                                                cx="10"
                                                cy="10"
                                                r="4"
                                                className="text-green-500 dark:text-green-400"
                                            />
                                        </svg>
                                        <span className="relative z-10 font-medium">
                                            Available for work
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-8 mt-8">
                            <div
                                id="portfolio-card-1"
                                className="bg-muted/30 dark:bg-muted/20 rounded-xl border border-dashed border-border overflow-hidden"
                                data-testid="placeholder-project-1"
                            >
                                <div className="aspect-video bg-muted/40 dark:bg-muted/30 relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-muted/50 dark:bg-muted/40 flex items-center justify-center">
                                            <svg
                                                className="w-8 h-8 text-muted-foreground/30"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-5">
                                    <div className="h-5 bg-muted/40 dark:bg-muted/30 rounded mb-2 w-3/4"></div>
                                    <div className="h-4 bg-muted/30 dark:bg-muted/20 rounded w-1/2"></div>
                                </div>
                            </div>

                            <div
                                id="portfolio-card-2"
                                className="bg-muted/30 dark:bg-muted/20 rounded-xl border border-dashed border-border overflow-hidden"
                                data-testid="placeholder-project-2"
                            >
                                <div className="aspect-video bg-muted/40 dark:bg-muted/30 relative overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-muted/50 dark:bg-muted/40 flex items-center justify-center">
                                            <svg
                                                className="w-8 h-8 text-muted-foreground/30"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-5">
                                    <div className="h-5 bg-muted/40 dark:bg-muted/30 rounded mb-2 w-3/4"></div>
                                    <div className="h-4 bg-muted/30 dark:bg-muted/20 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </section>
    )
}
