import ArrowCTA from "./shared/ArrowCTA";

export default function LandingFounderSection({
  ctaLabel,
  ctaDest,
  onPrimaryCta,
  primaryCtaLoading,
}) {
  const ctaHref = ctaDest || undefined;

  return (
    <section
      id="why"
      className="w-full scroll-mt-24 border-t border-(--lp-border) px-6 pt-16 pb-12"
      style={{ fontFamily: "var(--font-manrope), sans-serif" }}
    >
      <div className="mx-auto max-w-[560px]">
        <h2 className="mb-6 text-[26px] font-bold tracking-tight text-(--lp-text)">
          Yo. I&apos;m Shai (I built Designfolio)
        </h2>

        <img
          src="/assets/svgs/footerimageformob.svg"
          alt="Shai"
          className="mb-8 w-full rounded-2xl sm:hidden"
        />
        <img
          src="/assets/svgs/footerimage.svg"
          alt="Shai"
          className="mb-8 hidden w-full rounded-2xl sm:block"
        />

        <div className="text-lp-text/80 flex flex-col gap-6 text-[15px] leading-[1.6] font-medium">
          <p>
            For the last decade, I&apos;ve been designing products.
            <br />
            And honestly, the hardest problem was never design itself — it was the portfolio.
          </p>
          <p>
            Keeping it updated, packaging your work right, being ready when the right opportunity
            shows up — it&apos;s a lot.
          </p>
          <p>
            And somewhere in that process, one thought kept coming back:
            <br />
            why is this so hard for everyone?
          </p>
          <p>That question turned into Designfolio.</p>
          <p>
            Hey, I&apos;m Shai — a Staff Product Designer at ServiceNow.
            <br />I built Designfolio to make this whole thing easier.
          </p>
          <p>Give it a shot.</p>
        </div>

        <div className="mt-8 mb-6">
          <div
            className="mb-2 text-[32px] leading-none text-(--lp-text)"
            style={{ fontFamily: "var(--font-caveat), cursive" }}
          >
            Shai
          </div>
          <div className="text-lp-text/70 text-[14px] font-medium">
            Say hi -{" "}
            <a
              href="mailto:shai@designfolio.me"
              className="transition-colors hover:text-(--lp-accent)"
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
            loading={primaryCtaLoading}
          />
        </div>
      </div>
    </section>
  );
}
