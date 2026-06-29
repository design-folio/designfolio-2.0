import { Card } from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import Text from "./text";

function FeatureCta({ children, testId, href = "/claim-link" }) {
  return (
    <Link href={href}>
      <button
        className="group inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-medium transition-all"
        style={{
          borderColor: "#000000",
          color: "#000000",
          backgroundColor: "transparent",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#000000";
          e.currentTarget.style.color = "#ffffff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "#000000";
        }}
        data-testid={testId}
      >
        {children}
        <ArrowRight className="h-4 w-4" />
      </button>
    </Link>
  );
}

export default function FeaturesShowcase() {
  const features = [
    "Can I stop overthinking what to write first?",
    "Can writing case studies stop feeling like work?",
    "Can documenting your work actually feel natural?",
    "Can I publish everything in one place without extra tools?",
  ];

  return (
    <section id="otheraitools" className="w-full px-6 py-16">
      <div className="mx-auto max-w-5xl space-y-12">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <Text
              as="h2"
              size="section-heading"
              className="leading-tight"
              data-testid="text-showcase-headline"
            >
              Can telling your story be simple?{" "}
              <span
                className="font-kalam inline-block px-3 py-1 align-middle text-2xl font-bold tracking-wide uppercase sm:text-3xl lg:text-4xl"
                style={{
                  background: "#FF8C00",
                  color: "#fff",
                  transform: "rotate(-2deg)",
                  borderRadius: "6px",
                }}
                data-testid="badge-yes-ai"
              >
                YES WITH AI
              </span>
            </Text>
          </div>

          <div className="space-y-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2"
                data-testid={`feature-item-${index}`}
              >
                <Check className="h-5 w-5 shrink-0 text-black" />
                <span className="text-foreground text-sm">{feature}</span>
                <span
                  className="font-kalam shrink-0 px-2 py-0.5 text-xs font-bold tracking-wide uppercase"
                  style={{
                    background: "#10B981",
                    color: "#fff",
                    transform: "rotate(-2deg)",
                    borderRadius: "4px",
                  }}
                  data-testid={`badge-yes-${index}`}
                >
                  YES!
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card-landing space-y-4 p-4">
            <video
              className="w-full rounded-md border"
              autoPlay
              muted
              loop
              playsInline
              data-testid="video-thumbnail-1"
            >
              <source src="/videos/designfolio_ai_case_study.mp4" type="video/mp4" />
            </video>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold" data-testid="text-feature-title-1">
                AI Case Study Writer
              </h3>
              <p
                className="text-muted-foreground text-sm leading-relaxed"
                data-testid="text-feature-description-1"
              >
                Describe your project in a few lines — Designfolio shapes it into a clear,
                well-structured case study that actually sounds like you.
              </p>
              <div>
                <FeatureCta testId="button-cta-1">Start with AI</FeatureCta>
              </div>
            </div>
          </Card>

          <Card className="bg-card-landing space-y-4 p-4">
            <video
              className="w-full rounded-md border"
              autoPlay
              muted
              loop
              playsInline
              data-testid="video-thumbnail-2"
            >
              <source src="/videos/designfolio_ai_analyze.mp4" type="video/mp4" />
            </video>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold" data-testid="text-feature-title-2">
                AI Case Study Analyzer
              </h3>
              <p
                className="text-muted-foreground text-sm leading-relaxed"
                data-testid="text-feature-description-2"
              >
                Designfolio compares it with thousands of top portfolios and gives you an honest,
                easy-to-read report — what&apos;s strong, what&apos;s missing, and how to improve.
              </p>
              <div>
                <FeatureCta testId="button-cta-2">Try Designfolio AI</FeatureCta>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
