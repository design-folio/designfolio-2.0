import { useState, useEffect, useRef, useCallback } from "react";
import { Home, Briefcase, Award, Wrench } from "lucide-react";
import { useRouter } from "next/router";
import { FLOATING_NAV_SECTIONS } from "@/lib/constant";

const NAV_ICONS = { hero: Home, spotlight: Award, tools: Wrench, work: Briefcase };

const SCROLL_IGNORE_MS = 800; // ignore scroll-based updates after a click (smooth scroll duration)

const SECTION_IDS = FLOATING_NAV_SECTIONS.map((s) => s.sectionId);
const SECTION_TO_NAV = Object.fromEntries(FLOATING_NAV_SECTIONS.map((s) => [s.sectionId, s.navId]));
const NAV_TO_SECTION = Object.fromEntries(FLOATING_NAV_SECTIONS.map((s) => [s.navId, s.sectionId]));

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
  }, []);

  const scrollToSection = useCallback(
    (id) => {
      lastActiveRef.current = id;
      setActiveSection(id);
      ignoreScrollUntilRef.current = Date.now() + SCROLL_IGNORE_MS;

      const targetId = NAV_TO_SECTION[id] || id;
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [setActiveSection]
  );

  const hasSideNav =
    router.pathname === "/builder" ||
    router.pathname === "/jobs" ||
    router.pathname.startsWith("/jobs/") ||
    router.pathname === "/project/[id]/editor" ||
    router.pathname === "/analytics" ||
    router.pathname === "/settings";

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className="fixed top-1/2 z-50 hidden -translate-y-1/2 transition-[left] duration-300 lg:block"
        style={{ left: hasSideNav ? "88px" : "32px" }}
      >
        <div className="bg-card dark:bg-secondary border-card-border dark:border-secondary-border rounded-xl border p-3 shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col gap-4">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`group flex items-center gap-4 transition-all ${
                  activeSection === id ? "opacity-100" : "opacity-50 hover:opacity-100"
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    activeSection === id
                      ? "bg-foreground dark:bg-[#2A2D37]"
                      : "dark:bg-secondary-hover hover:bg-primary-hover dark:hover:bg-primary-hover bg-[#e5e5e7]"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      activeSection === id
                        ? "text-background dark:text-white"
                        : "text-foreground dark:text-foreground-dark"
                    }`}
                  />
                </div>
                <span className="absolute left-full pl-4 text-sm whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile and Tablet Navigation */}
      {!router.asPath.includes("portfolio-preview") && (
        <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 lg:hidden">
          <div className="bg-card dark:bg-secondary border-card-border dark:border-secondary-border rounded-xl border p-3 shadow-[0px_0px_16.4px_0px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-4">
              {sections.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`group flex flex-col items-center transition-all ${
                    activeSection === id ? "opacity-100" : "opacity-50 hover:opacity-100"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                      activeSection === id
                        ? "bg-foreground dark:bg-[#2A2D37]"
                        : "dark:bg-secondary-hover hover:bg-primary-hover dark:hover:bg-primary-hover bg-[#e5e5e7]"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
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
