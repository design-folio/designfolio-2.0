/**
 * Blinders page transition for Next.js Pages Router.
 *
 * Phase sequence:
 *  idle → closing → loading → fading → opening → idle
 *
 * Driven entirely by Next.js router events — no manual transitionTo() needed.
 * The SeamLoader stays visible until BOTH panels are fully closed AND the route
 * change is complete, then fades before the panels sweep open.
 *
 * Inside FloatingPageContainer (sidebar routes): blinders are contained within
 * the card because FloatingPageContainer has transform: translateZ(0).
 * Outside FloatingPageContainer (other routes): blinders cover the full viewport.
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/router";

// ─── Timing ──────────────────────────────────────────────────────────────────

const CLOSE_MS = 420; // panels sweep to centre
const PROGRESS_MS = 1200; // progress bar fills
const MIN_HOLD_MS = 1100; // minimum time panels stay closed
const FADE_MS = 260; // loader fades out (panels still closed)
const OPEN_MS = 500; // panels sweep open

// ─── Easing ──────────────────────────────────────────────────────────────────

const EASE_CLOSE = [0.76, 0, 0.24, 1];
const EASE_OPEN = [0.22, 1, 0.36, 1];

// ─── Route filter ────────────────────────────────────────────────────────────

// Subdomain/custom domain: proxy rewrites "/" to the portfolio home (blinders).
// Main domain: "/" is the landing page (never blinders).
function isPortfolioHost() {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  const base = process.env.NEXT_PUBLIC_BASE_DOMAIN;
  return !(
    host === "localhost" ||
    host === base ||
    host === `www.${base}` ||
    host === `beta.${base}`
  );
}

function isBlindersRoute(url) {
  const path = url.split("?")[0];
  return (
    (path === "/" && isPortfolioHost()) ||
    path === "/builder" ||
    path === "/portfolio-preview" ||
    /^\/preview\/[^/]+$/.test(path) ||
    /^\/project\/[^/]+$/.test(path) ||
    /^\/project\/[^/]+\/editor$/.test(path) ||
    /^\/project\/[^/]+\/preview$/.test(path)
  );
}

// ─── Seam loader ─────────────────────────────────────────────────────────────

function SeamLoader({ show }) {
  const wrapperRef = useRef(null);
  const [dotEnd, setDotEnd] = useState(224);

  useEffect(() => {
    if (show && wrapperRef.current) {
      setDotEnd(wrapperRef.current.offsetWidth);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="seam-loader"
          className="flex w-[44vw] max-w-[224px] min-w-[120px] flex-col items-center gap-3 select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_MS / 1000, ease: "easeInOut" }}
        >
          <motion.p
            className="font-mono text-[9px] tracking-[0.35em] uppercase"
            style={{ color: "currentColor" }}
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 0.3, filter: "blur(0px)" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            loading
          </motion.p>

          {/* ref wrapper — source-of-truth width for dot animation (no hardcoded px) */}
          <div ref={wrapperRef} className="relative w-full" style={{ height: 14 }}>
            {/* Track */}
            <div
              className="absolute inset-x-0 overflow-hidden"
              style={{
                top: "50%",
                transform: "translateY(-50%)",
                height: 2,
                background: "color-mix(in srgb, currentColor 7%, transparent)",
              }}
            >
              {/* Gradient fill */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, color-mix(in srgb, currentColor 30%, transparent) 0%, currentColor 100%)",
                }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: PROGRESS_MS / 1000, ease: [0.33, 1, 0.68, 1] }}
              />
            </div>

            {/* Leading-edge glow dot — sibling of track so overflow:hidden never clips it */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 5,
                height: 5,
                top: "50%",
                background: "currentColor",
                boxShadow: "0 0 6px 2px color-mix(in srgb, currentColor 60%, transparent)",
                translateY: "-50%",
                translateX: "-50%",
              }}
              initial={{ left: 0 }}
              animate={{ left: dotEnd }}
              transition={{ duration: PROGRESS_MS / 1000, ease: [0.33, 1, 0.68, 1] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function BlindersTransition({ children }) {
  const router = useRouter();
  const [phase, setPhase] = useState("idle");

  const timers = useRef([]);
  const panelsClosedRef = useRef(false);
  const routeReadyRef = useRef(false);
  const holdReadyRef = useRef(false);
  const activeRef = useRef(false);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const schedule = (fn, delay) => {
    const id = setTimeout(fn, delay);
    timers.current.push(id);
  };

  useEffect(() => {
    const tryReveal = () => {
      if (!panelsClosedRef.current || !routeReadyRef.current || !holdReadyRef.current) return;
      setPhase("fading");
      schedule(() => {
        setPhase("opening");
        schedule(() => {
          setPhase("idle");
          activeRef.current = false;
        }, OPEN_MS + 60);
      }, FADE_MS);
    };

    const onStart = (url) => {
      if (!isBlindersRoute(url)) return;
      clearTimers();
      panelsClosedRef.current = false;
      routeReadyRef.current = false;
      holdReadyRef.current = false;
      activeRef.current = true;
      setPhase("closing");

      schedule(() => {
        panelsClosedRef.current = true;
        setPhase("loading");
        tryReveal();
      }, CLOSE_MS + 30);

      schedule(() => {
        holdReadyRef.current = true;
        tryReveal();
      }, CLOSE_MS + MIN_HOLD_MS);
    };

    const onDone = () => {
      if (!activeRef.current) return;
      routeReadyRef.current = true;
      tryReveal();
    };

    router.events.on("routeChangeStart", onStart);
    router.events.on("routeChangeComplete", onDone);
    router.events.on("routeChangeError", onDone);

    return () => {
      router.events.off("routeChangeStart", onStart);
      router.events.off("routeChangeComplete", onDone);
      router.events.off("routeChangeError", onDone);
      clearTimers();
    };
  }, []);

  const closed = phase === "closing" || phase === "loading" || phase === "fading";
  const topY = closed ? "0%" : "-100%";
  const bottomY = closed ? "0%" : "100%";

  const panelTransition =
    phase === "closing"
      ? { duration: CLOSE_MS / 1000, ease: EASE_CLOSE }
      : { duration: OPEN_MS / 1000, ease: EASE_OPEN };

  return (
    <>
      {children}

      <div className="pointer-events-none fixed inset-0 z-[500] overflow-hidden" aria-hidden="true">
        {/* Top panel */}
        <motion.div
          className="absolute top-0 right-0 left-0 h-1/2"
          style={{ background: "var(--blinder-color)" }}
          initial={{ y: "-100%" }}
          animate={{ y: topY }}
          transition={panelTransition}
        />

        {/* Bottom panel */}
        <motion.div
          className="absolute right-0 bottom-0 left-0 h-1/2"
          style={{ background: "var(--blinder-color)" }}
          initial={{ y: "100%" }}
          animate={{ y: bottomY }}
          transition={panelTransition}
        />

        {/* Loader centred at the seam */}
        <div
          className="absolute inset-x-0 flex justify-center"
          style={{ top: "50%", transform: "translateY(-50%)" }}
        >
          <SeamLoader show={phase === "loading"} />
        </div>
      </div>
    </>
  );
}
