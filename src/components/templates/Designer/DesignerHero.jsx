import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowDown, Pencil, FileText, Briefcase, User, Mail } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import ProfileAvatar from "@/components/templates/ProfileAvatar";
import DesignerBirds from "./DesignerBirds";

const NAV_ITEMS = [
  { id: "section-projects", label: "Work", Icon: Briefcase },
  { id: "section-about", label: "About", Icon: User },
  { id: "section-contact", label: "Contact", Icon: Mail },
];

const HEADLINE_WORDS = ["Hey,", "I'm"];

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function DesignerHero({ isEditing }) {
  const { userDetails, openSidebar } = useGlobalContext();
  const { firstName, bio, resume } = userDetails || {};
  const [menuOpen, setMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const navRef = useRef(null);
  const heroRef = useRef(null);

  // Nav swaps from transparent-on-sky to solid-on-white once the hero scrolls out of
  // view — same IntersectionObserver + rootMargin the reference uses.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setNavScrolled(!entry.isIntersecting), {
      threshold: 0,
      rootMargin: "-80px 0px 0px 0px",
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const onOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onOutside);
    };
  }, [menuOpen]);

  const navItems = resume?.url
    ? [{ id: "resume", label: "CV", Icon: FileText, href: resume.url }, ...NAV_ITEMS]
    : NAV_ITEMS;

  return (
    <div
      ref={heroRef}
      className="designer-heading relative flex min-h-screen flex-col items-center justify-start overflow-hidden rounded-b-[32px] text-center"
    >
      {/* Sky, clouds, birds — decorative, scoped to the hero's own box */}
      <div className="designer-sky absolute inset-0 z-0" aria-hidden="true">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <img src="/assets/backgrounds/cloud1.avif" alt="" className="designer-cloud-1" />
          <img src="/assets/backgrounds/cloud2.avif" alt="" className="designer-cloud-2" />
        </div>
        <DesignerBirds />
        <div
          className="absolute right-0 bottom-0 left-0 h-[160px]"
          style={{
            background: "linear-gradient(to bottom, transparent 0%, hsl(var(--background)) 100%)",
          }}
        />
      </div>

      {/* Nav — page-fixed (not scoped to the hero) so it stays visible while scrolling,
          swapping from transparent-on-sky to solid-on-white via navScrolled. */}
      <nav ref={navRef} className="fixed top-6 right-0 left-0 z-40 px-5 md:px-10">
        <div className="flex items-center justify-between">
          {/* Name */}
          <span
            className="text-[13px] font-medium tracking-wide transition-colors duration-500"
            style={{ color: navScrolled ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.9)" }}
          >
            {firstName || "Portfolio"}
          </span>

          {/* Desktop links */}
          <div className="hidden items-center gap-9 md:flex">
            {navItems.map(({ id, label, href }) => (
              <a
                key={id}
                href={href || `#${id}`}
                target={href ? "_blank" : undefined}
                rel={href ? "noopener noreferrer" : undefined}
                onClick={
                  href
                    ? undefined
                    : (e) => {
                        e.preventDefault();
                        scrollToSection(id);
                      }
                }
                className="text-[13px] font-medium tracking-wide transition-colors duration-500"
                style={{ color: navScrolled ? "rgba(15,23,42,0.60)" : "rgba(255,255,255,0.70)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = navScrolled
                    ? "rgba(15,23,42,1)"
                    : "rgba(255,255,255,1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = navScrolled
                    ? "rgba(15,23,42,0.60)"
                    : "rgba(255,255,255,0.70)";
                }}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Mobile — MENU pill + animated hamburger + dropdown */}
          <div className="relative md:hidden">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              aria-controls="designer-mobile-menu"
              className="flex items-center gap-[6px] rounded-full px-[10px] py-[7px] transition-all duration-300 select-none"
              style={{
                background: navScrolled ? "rgba(15,23,42,0.06)" : "rgba(255,255,255,0.18)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: navScrolled
                  ? "1px solid rgba(15,23,42,0.10)"
                  : "1px solid rgba(255,255,255,0.26)",
              }}
            >
              {/* Animated three-line → X icon */}
              <span
                className="relative flex h-[11px] w-[13px] flex-col justify-center gap-[3.5px]"
                aria-hidden
              >
                <motion.span
                  className="absolute left-0 block h-[1.5px] rounded-full"
                  style={{
                    backgroundColor: navScrolled ? "rgba(15,23,42,0.80)" : "rgba(255,255,255,0.95)",
                    top: 0,
                  }}
                  animate={
                    menuOpen
                      ? { width: 13, top: "50%", y: "-50%", rotate: 45 }
                      : { width: 13, top: 0, y: 0, rotate: 0 }
                  }
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.span
                  className="absolute left-0 block h-[1.5px] rounded-full"
                  style={{
                    backgroundColor: navScrolled ? "rgba(15,23,42,0.80)" : "rgba(255,255,255,0.95)",
                    top: "50%",
                    marginTop: "-0.75px",
                    width: 9,
                  }}
                  animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.18, ease: "easeInOut" }}
                />
                <motion.span
                  className="absolute left-0 block h-[1.5px] rounded-full"
                  style={{
                    backgroundColor: navScrolled ? "rgba(15,23,42,0.80)" : "rgba(255,255,255,0.95)",
                    bottom: 0,
                  }}
                  animate={
                    menuOpen
                      ? { width: 13, bottom: "auto", top: "50%", y: "-50%", rotate: -45 }
                      : { width: 13, bottom: 0, top: "auto", y: 0, rotate: 0 }
                  }
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
              <span
                className="text-[10px] font-semibold tracking-[0.15em] transition-colors duration-300"
                style={{ color: navScrolled ? "rgba(15,23,42,0.72)" : "rgba(255,255,255,0.92)" }}
              >
                MENU
              </span>
            </button>

            {/* Compact dropdown — matches pill glass style */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  id="designer-mobile-menu"
                  key="designer-mobile-menu"
                  initial={{ opacity: 0, y: -8, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-[calc(100%+8px)] right-0 min-w-[176px] overflow-hidden rounded-2xl"
                  style={{
                    background: navScrolled ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.16)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: navScrolled
                      ? "1px solid rgba(0,0,0,0.08)"
                      : "1px solid rgba(255,255,255,0.28)",
                    boxShadow: navScrolled
                      ? "0 8px 32px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)"
                      : "0 8px 32px rgba(0,0,0,0.18), 0 1px 6px rgba(0,0,0,0.10)",
                  }}
                >
                  {navItems.map(({ id, label, Icon, href }, i) => (
                    <motion.a
                      key={id}
                      href={href || `#${id}`}
                      target={href ? "_blank" : undefined}
                      rel={href ? "noopener noreferrer" : undefined}
                      initial={{ opacity: 0, y: 5, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{
                        delay: 0.04 + i * 0.05,
                        duration: 0.28,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="flex items-center gap-3 border-b px-4 py-[13px] last:border-b-0"
                      style={{
                        color: navScrolled ? "rgba(15,23,42,0.82)" : "rgba(255,255,255,0.90)",
                        borderColor: navScrolled ? "rgba(15,23,42,0.07)" : "rgba(255,255,255,0.12)",
                      }}
                      onClick={(e) => {
                        setMenuOpen(false);
                        if (!href) {
                          e.preventDefault();
                          scrollToSection(id);
                        }
                      }}
                    >
                      <Icon size={13} strokeWidth={1.8} style={{ opacity: 0.7, flexShrink: 0 }} />
                      <span className="text-[13.5px] font-medium tracking-wide">{label}</span>
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
      <div className="relative z-10 flex w-full flex-col items-center px-6 pt-28 pb-20 md:px-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-8"
        >
          <ProfileAvatar
            src={getUserAvatarImage(userDetails)}
            alt="Profile"
            size={112}
            radius="rounded-[22px]"
          />
        </motion.div>

        <h1
          className="designer-heading leading-[1.05] font-semibold tracking-tight text-white"
          style={{ fontSize: "clamp(36px, 7vw, 80px)" }}
        >
          {HEADLINE_WORDS.map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.3 + i * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
              className="mr-[0.28em] inline-block"
            >
              {word}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="designer-script inline-block font-normal"
          >
            {firstName || "there"}.
          </motion.span>
        </h1>

        {bio && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.75, ease: [0.25, 0.1, 0.25, 1] }}
            className="mt-6 w-full max-w-xl text-[17px] leading-relaxed font-medium text-white"
          >
            {bio}
          </motion.p>
        )}

        {isEditing && (
          <button
            onClick={() => openSidebar(sidebars.profile)}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3.5 py-1.5 text-[12px] font-medium text-white backdrop-blur-md transition-colors hover:bg-white/25"
          >
            <Pencil className="h-3 w-3" />
            Edit Profile
          </button>
        )}

        <motion.button
          type="button"
          onClick={() => scrollToSection("section-projects")}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-8 h-[84px] w-[84px] cursor-pointer select-none"
          aria-label="Scroll to selected work"
        >
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
          >
            <svg viewBox="0 0 84 84" className="h-full w-full">
              <defs>
                <path
                  id="designer-scroll-ring"
                  d="M42,42 m-28,0 a28,28 0 1,1 56,0 a28,28 0 1,1 -56,0"
                />
              </defs>
              <text
                fill="rgba(255,255,255,0.90)"
                style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em" }}
              >
                <textPath href="#designer-scroll-ring" textLength="175" lengthAdjust="spacing">
                  SCROLL DOWN ✦ SCROLL DOWN ✦
                </textPath>
              </text>
            </svg>
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/12 backdrop-blur-sm">
              <ArrowDown className="h-[15px] w-[15px] text-white/85" strokeWidth={2.2} />
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
