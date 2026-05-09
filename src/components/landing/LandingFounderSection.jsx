import ArrowCTA from "./shared/ArrowCTA";

export default function LandingFounderSection({ dfToken, hasParsedResume, onPrimaryCta }) {
  const ctaLabel = dfToken
    ? "Launch Builder"
    : hasParsedResume
      ? "Continue Signup"
      : "Get started for Free";
  const ctaHref = dfToken ? "/builder" : hasParsedResume ? "/resume-signup" : undefined;

  return (
    <section
      id="why"
      className="w-full border-t border-[--lp-border] pt-16 pb-12 px-6 scroll-mt-24"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <div className="max-w-[500px] mx-auto">
        <h2 className="text-[24px] font-bold text-[--lp-text] mb-6 tracking-tight">
          I'm Shai. Maker of Designfolio.
        </h2>

        <div className="flex flex-col gap-6 text-[15px] leading-[1.6] text-[--lp-text]/80 font-medium">
          <p>
            For the last decade, I've been designing products.
            <br />
            And honestly, the hardest problem was never design itself — it was
            the portfolio.
          </p>
          <p>
            Keeping it updated, packaging your work right, being ready when the
            right opportunity shows up — it's a lot.
          </p>
          <p>
            And somewhere in that process, one thought kept coming back:
            <br />
            why is this so hard for everyone?
          </p>
          <p>That question turned into Designfolio.</p>
          <p>
            Hey, I'm Shai — a Staff Product Designer at ServiceNow.
            <br />
            I built Designfolio to make this whole thing easier.
          </p>
          <p>Give it a shot.</p>
        </div>

        <div className="mt-8 mb-6">
          <div
            className="text-[32px] text-[--lp-text] mb-2 leading-none"
            style={{ fontFamily: "var(--font-caveat), cursive" }}
          >
            Shai
          </div>
          <div className="text-[14px] font-medium text-[--lp-text]/70">
            Say hi -{" "}
            <a
              href="mailto:shai@designfolio.me"
              className="hover:text-[--lp-accent] transition-colors"
            >
              shai@designfolio.me
            </a>
          </div>
        </div>

        <div className="mt-4 mb-6">
          <ArrowCTA
            label={ctaLabel}
            size="lg"
            href={ctaHref}
            onClick={!ctaHref ? onPrimaryCta : undefined}
          />
        </div>
      </div>
    </section>
  );
}
