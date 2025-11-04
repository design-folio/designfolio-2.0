import { Card } from "@/components/ui/card"
import { Check, ArrowRight } from "lucide-react"
import Link from "next/link"

function FeatureCta({ children, testId, href = "/claim-link" }) {
    return (
        <Link href={href}>
            <button
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border-2 transition-all group"
                style={{
                    borderColor: "#000000",
                    color: "#000000",
                    backgroundColor: "transparent"
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = "#000000"
                    e.currentTarget.style.color = "#ffffff"
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = "transparent"
                    e.currentTarget.style.color = "#000000"
                }}
                data-testid={testId}
            >
                {children}
                <ArrowRight className="w-4 h-4" />
            </button>
        </Link>
    )
}

export default function FeaturesShowcase() {
    const features = [
        "Can I stop overthinking what to write first?",
        "Can writing case studies stop feeling like work?",
        "Can documenting your work actually feel natural?",
        "Can I publish everything in one place without extra tools?"
    ]

    return (
        <section id="otheraitools" className="w-full py-16 px-6">
            <div className="max-w-5xl mx-auto space-y-12">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    <div>
                        <h2
                            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-5xl font-semibold font-gsans leading-tight"
                            data-testid="text-showcase-headline"
                        >
                            Can telling your story be simple?{" "}
                            <span
                                className="inline-block px-3 py-1 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide uppercase align-middle font-kalam"
                                style={{
                                    background: "#FF8C00",
                                    color: "#fff",
                                    transform: "rotate(-2deg)",
                                    borderRadius: "6px"
                                }}
                                data-testid="badge-yes-ai"
                            >
                                YES WITH AI
                            </span>
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2"
                                data-testid={`feature-item-${index}`}
                            >
                                <Check className="w-5 h-5 text-black flex-shrink-0" />
                                <span className="text-sm text-foreground">{feature}</span>
                                <span
                                    className="px-2 py-0.5 text-xs font-bold tracking-wide uppercase flex-shrink-0 font-kalam"
                                    style={{
                                        background: "#10B981",
                                        color: "#fff",
                                        transform: "rotate(-2deg)",
                                        borderRadius: "4px"
                                    }}
                                    data-testid={`badge-yes-${index}`}
                                >
                                    YES!
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-4 space-y-4">
                        <video
                            className="rounded-md w-full border"
                            autoPlay
                            muted
                            loop
                            playsInline
                            data-testid="video-thumbnail-1"
                        >
                            <source
                                src="/videos/designfolio_ai_case_study.mp4"
                                type="video/mp4"
                            />
                        </video>
                        <div className="space-y-3">
                            <h3
                                className="text-lg font-semibold"
                                data-testid="text-feature-title-1"
                            >
                                AI Case Study Writer
                            </h3>
                            <p
                                className="text-sm text-muted-foreground leading-relaxed"
                                data-testid="text-feature-description-1"
                            >
                                Describe your project in a few lines — Designfolio shapes it
                                into a clear, well-structured case study that actually sounds
                                like you.
                            </p>
                            <FeatureCta testId="button-cta-1">Start with AI</FeatureCta>
                        </div>
                    </Card>

                    <Card className="p-4 space-y-4">
                        <video
                            className="rounded-md w-full border"
                            autoPlay
                            muted
                            loop
                            playsInline
                            data-testid="video-thumbnail-2"
                        >
                            <source
                                src="/videos/designfolio_ai_analyze.mp4"
                                type="video/mp4"
                            />
                        </video>
                        <div className="space-y-3">
                            <h3
                                className="text-lg font-semibold"
                                data-testid="text-feature-title-2"
                            >
                                AI Case Study Analyzer
                            </h3>
                            <p
                                className="text-sm text-muted-foreground leading-relaxed"
                                data-testid="text-feature-description-2"
                            >
                                Designfolio compares it with thousands of top portfolios and
                                gives you an honest, easy-to-read report — what's strong, what's
                                missing, and how to improve.
                            </p>
                            <FeatureCta testId="button-cta-2">Try Designfolio AI</FeatureCta>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    )
}
