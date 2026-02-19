import { useState, useEffect, useRef } from "react";
import { Home, Briefcase, Award, Wrench } from "lucide-react";
import { useRouter } from "next/router";
import { FLOATING_NAV_SECTIONS } from "@/lib/constant";

const NAV_ICONS = { hero: Home, spotlight: Award, tools: Wrench, work: Briefcase };

const SCROLL_IGNORE_MS = 800; // ignore scroll-based updates after a click (smooth scroll duration)

export const FloatingNav = () => {
  const [activeSection, setActiveSection] = useState("hero");
  const router = useRouter();
  const lastActiveRef = useRef("hero");
  const ignoreScrollUntilRef = useRef(0);
  const rafIdRef = useRef(null);

  const sections = FLOATING_NAV_SECTIONS.map(({ navId, label }) => ({
    id: navId,
    label,
    icon: NAV_ICONS[navId],
  }));

  const SECTION_IDS = FLOATING_NAV_SECTIONS.map((s) => s.sectionId);
  const SECTION_TO_NAV = Object.fromEntries(
    FLOATING_NAV_SECTIONS.map((s) => [s.sectionId, s.navId])
  );
  const NAV_TO_SECTION = Object.fromEntries(
    FLOATING_NAV_SECTIONS.map((s) => [s.navId, s.sectionId])
  );

  useEffect(() => {
    lastActiveRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    const run = () => {
      rafIdRef.current = null;
      if (Date.now() < ignoreScrollUntilRef.current) return;

      const sectionElements = SECTION_IDS.map((id) => document.getElementById(id));
      const currentSection = sectionElements.find((element) => {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      });

      if (!currentSection) return;
      const newNavId = SECTION_TO_NAV[currentSection.id] || currentSection.id;
      if (newNavId !== lastActiveRef.current) {
        lastActiveRef.current = newNavId;
        setActiveSection(newNavId);
      }
    };

    const handleScroll = () => {
      if (rafIdRef.current != null) return;
      rafIdRef.current = requestAnimationFrame(run);
    };

    run(); // initial
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
    };
    // SECTION_IDS, SECTION_TO_NAV from FLOATING_NAV_SECTIONS (stable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToSection = (id) => {
    lastActiveRef.current = id;
    setActiveSection(id);
    ignoreScrollUntilRef.current = Date.now() + SCROLL_IGNORE_MS;

    const targetId = NAV_TO_SECTION[id] || id;
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed left-8 top-1/2 -translate-y-1/2 z-50 hidden lg:block">
        <div className="bg-card dark:bg-secondary border border-card-border dark:border-secondary-border rounded-xl p-3 shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col gap-4">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`group flex items-center gap-4 transition-all ${
                  activeSection === id
                    ? "opacity-100"
                    : "opacity-50 hover:opacity-100"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                    activeSection === id
                      ? "bg-foreground dark:bg-[#2A2D37]"
                      : "bg-[#e5e5e7] dark:bg-secondary-hover hover:bg-primary-hover dark:hover:bg-primary-hover"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      activeSection === id
                        ? "text-background dark:text-white"
                        : "text-foreground dark:text-foreground-dark"
                    }`}
                  />
                </div>
                <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity absolute left-full pl-4 whitespace-nowrap">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile and Tablet Navigation */}
      {!router.asPath.includes("portfolio-preview") && (
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 lg:hidden">
          <div className="bg-card dark:bg-secondary border border-card-border dark:border-secondary-border rounded-xl p-3 shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-4">
              {sections.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`group flex flex-col items-center transition-all ${
                    activeSection === id
                      ? "opacity-100"
                      : "opacity-50 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                      activeSection === id
                        ? "bg-foreground dark:bg-[#2A2D37]"
                        : "bg-[#e5e5e7] dark:bg-secondary-hover hover:bg-primary-hover dark:hover:bg-primary-hover"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        activeSection === id
                          ? "text-background dark:text-white"
                          : "text-foreground dark:text-foreground-dark"
                      }`}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}
    </>
  );
};
