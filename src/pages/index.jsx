import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useTheme } from "next-themes";
import { flushSync } from "react-dom";
import { useRouter } from "next/router";
import Seo from "@/components/seo";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingLeftNav from "@/components/landing/LandingLeftNav";
import LandingFAB from "@/components/landing/LandingFAB";
import LandingHeroSection from "@/components/landing/LandingHeroSection";
import LandingVideoSection from "@/components/landing/LandingVideoSection";
import LandingTrustedBySection from "@/components/landing/LandingTrustedBySection";
import LandingTestimonialCarousel from "@/components/landing/LandingTestimonialCarousel";
import LandingVerticalScroller from "@/components/landing/LandingVerticalScroller";
import LandingHowSection from "@/components/landing/LandingHowSection";
import LandingFounderSection from "@/components/landing/LandingFounderSection";
import LandingFooter from "@/components/landing/LandingFooter";
import ResumeUploadModal from "@/components/landing/ResumeUploadModal";

function getCookieValue(cookieName) {
  if (typeof document === "undefined") return "";
  const escapedName = cookieName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escapedName}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

export default function LandingPage({ dfToken, dfParsedResume }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  // Defer theme resolution to client — avoids server/client hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isDark = mounted && theme === "dark";

  const containerRef = useRef(null);
  const fabRef = useRef(null);
  const videoSectionRef = useRef(null);

  const [activeSection, setActiveSection] = useState("overview");
  const [showNavCTA, setShowNavCTA] = useState(false);
  const [fabVisible, setFabVisible] = useState(true);
  const [speedLevel, setSpeedLevel] = useState(4);
  const [showAllFeatures, setShowAllFeatures] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [hasParsedResume, setHasParsedResume] = useState(!!dfParsedResume);

  // ── Theme sound (desktop only – mobile guard is inside the hook) ──
  const playHeartbeat = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.frequency.setValueAtTime(150, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc1.start(now);
      osc1.stop(now + 0.1);
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(180, now + 0.12);
      gain2.gain.setValueAtTime(0.2, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.22);
    } catch { }
  }, []);

  const handleThemeChange = useCallback(
    async (checked) => {
      playHeartbeat();
      const next = typeof checked === "boolean" ? (checked ? "dark" : "light") : checked;
      if (!document.startViewTransition) {
        setTheme(next);
        return;
      }
      await document.startViewTransition(() => {
        flushSync(() => setTheme(next));
      }).ready;
      const isMobile = window.innerWidth < 1024;
      const originEl = isMobile ? fabRef.current : containerRef.current;
      if (originEl) {
        const { left, top, width, height } = originEl.getBoundingClientRect();
        const cx = left + width / 2;
        const cy = top + height / 2;
        const maxD = Math.hypot(
          Math.max(cx, window.innerWidth - cx),
          Math.max(cy, window.innerHeight - cy),
        );
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${cx}px ${cy}px)`,
              `circle(${maxD}px at ${cx}px ${cy}px)`,
            ],
          },
          {
            duration: 700,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      }
    },
    [playHeartbeat, setTheme],
  );

  // Slider tick sound
  const playSliderTick = useCallback((level) => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(300 + level * 60, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
      osc.onended = () => ctx.close();
    } catch { }
  }, []);

  useEffect(() => {
    let parsedResumePresent = !!dfParsedResume;
    try {
      parsedResumePresent =
        parsedResumePresent ||
        Boolean(sessionStorage.getItem("df_parsed_resume")) ||
        Boolean(localStorage.getItem("df_parsed_resume"));
    } catch { }
    parsedResumePresent = parsedResumePresent || Boolean(getCookieValue("df_parsed_resume"));
    if (parsedResumePresent) setHasParsedResume(true);
  }, [dfParsedResume]);

  const primaryCtaLabel = dfToken
    ? "Launch Builder"
    : hasParsedResume
      ? "Continue Signup"
      : "Get Started";

  const handlePrimaryCta = useCallback(() => {
    if (dfToken) {
      router.push("/builder");
      return;
    }
    if (hasParsedResume) {
      router.push("/resume-signup");
      return;
    }
    setShowUploadModal(true);
  }, [dfToken, hasParsedResume, router]);

  // Section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActiveSection(hit.target.id);
        else if (window.scrollY < 100) setActiveSection("overview");
      },
      { rootMargin: "-10% 0px -70% 0px" },
    );
    ["overview", "stories", "how", "why"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    const onScroll = () => {
      if (window.scrollY < 100) setActiveSection("overview");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Nav CTA visibility (appears after video section scrolls past)
  useEffect(() => {
    const onScroll = () => {
      if (!videoSectionRef.current) return;
      const rect = videoSectionRef.current.getBoundingClientRect();
      const videoTop = rect.top + window.scrollY;
      const halfway = videoTop + rect.height * 0.5;
      const whyEl = document.getElementById("why");
      const whyTop = whyEl
        ? whyEl.getBoundingClientRect().top + window.scrollY
        : Infinity;
      setShowNavCTA(window.scrollY > halfway && window.scrollY < whyTop);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // FAB show/hide on scroll direction
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < lastY || y < 80) setFabVisible(true);
      else if (y > lastY + 4) setFabVisible(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Force background colour for iOS/Mac overscroll
  useEffect(() => {
    const bg = isDark ? "#1a1a18" : "#fffef2";
    document.documentElement.style.setProperty("background-color", bg, "important");
    document.body.style.setProperty("background-color", bg, "important");
    return () => {
      document.documentElement.style.removeProperty("background-color");
      document.body.style.removeProperty("background-color");
    };
  }, [isDark]);

  const scrollToSection = (id, block = "start") => {
    if (id === "overview") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block });
  };

  return (
    <>
      <Seo
        title="Designfolio – Build your Design Portfolio in Hours, Not Weeks"
        description="Skip the busywork. Designfolio helps designers and PMs create a polished portfolio website in hours — with AI-powered case studies, beautiful templates, and one-click publish."
        keywords="design portfolio, ux portfolio, product design portfolio, portfolio website builder, designfolio"
        author="Designfolio"
        imageUrl="https://designfolio.me/assets/png/designfolio-thumbnail.png"
        url="https://designfolio.me"
      />
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Designfolio",
            url: "https://designfolio.me",
            description:
              "The fastest way to build your design portfolio website.",
            potentialAction: {
              "@type": "SearchAction",
              target: "https://designfolio.me/preview/{search_term_string}",
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />

      <div
        id="overview"
        className="min-h-screen bg-[--lp-bg] text-[--lp-text] antialiased overflow-x-clip flex justify-center"
        style={{ fontFamily: "var(--font-manrope), sans-serif" }}
      >
        <div className="w-full max-w-[640px] bg-[--lp-bg] min-h-screen border-x border-[--lp-border] relative z-10 shadow-[0_0_40px_rgba(0,0,0,0.02)]">
          <LandingLeftNav
            activeSection={activeSection}
            onSectionClick={scrollToSection}
            isDark={isDark}
            onThemeChange={handleThemeChange}
            containerRef={containerRef}
          />

          <LandingHeader
            showNavCTA={showNavCTA}
            dfToken={dfToken}
            hasParsedResume={hasParsedResume}
            ctaLabel={primaryCtaLabel}
            onPrimaryCta={handlePrimaryCta}
          />

          <main className="flex flex-col items-center">
            <LandingHeroSection
              hasDfToken={dfToken}
              hasParsedResume={hasParsedResume}
              onPrimaryCta={handlePrimaryCta}
              primaryCtaLabel={dfToken ? "Launch Builder" : hasParsedResume ? "Continue Signup" : "Upload Resume"}
            />
            <LandingVideoSection ref={videoSectionRef} isDark={isDark} />
            <LandingTrustedBySection />
            <LandingTestimonialCarousel />
            <LandingHowSection
              showAllFeatures={showAllFeatures}
              onToggleFeatures={() => setShowAllFeatures((v) => !v)}
            />
            <LandingVerticalScroller
              speedLevel={speedLevel}
              onSpeedChange={setSpeedLevel}
              isDark={isDark}
              playSliderTick={playSliderTick}
            />
            <LandingFounderSection
              dfToken={dfToken}
              hasParsedResume={hasParsedResume}
              onPrimaryCta={handlePrimaryCta}
            />
            <LandingFooter />
          </main>
        </div>

        <LandingFAB
          fabRef={fabRef}
          fabVisible={fabVisible}
          isDark={isDark}
          onThemeChange={handleThemeChange}
        />

        <ResumeUploadModal
          open={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          hasDfToken={dfToken}
          hasParsedResume={hasParsedResume}
          onPrimaryCta={handlePrimaryCta}
        />
      </div>
    </>
  );
}

// No forced theme — users can toggle dark/light
export const getServerSideProps = async (context) => {
  const dfToken = context.req.cookies["df-token"] || null;
  const dfParsedResume = context.req.cookies["df_parsed_resume"] || null;
  return {
    props: {
      dfToken: !!dfToken,
      dfParsedResume: !!dfParsedResume,
      hideHeader: true,
    },
  };
};
