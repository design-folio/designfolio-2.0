/**
 * Blinders page transition for Next.js Pages Router.
 *
 * Phase sequence:
 *  idle → closing → loading → fading → opening → idle
 *
 * Driven entirely by Next.js router events — no manual transitionTo() needed.
 * The SeamLoader stays visible until BOTH panels are fully closed AND the route
 * change is complete, then fades before the panels sweep open.
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/router";

// ─── Timing ──────────────────────────────────────────────────────────────────

const CLOSE_MS = 420; // panels sweep to centre
const MIN_HOLD_MS = 1100; // minimum time panels stay closed (even for fast/cached routes)
const FADE_MS = 260; // loader fades out (panels still closed)
const OPEN_MS = 500; // panels sweep open

// ─── Easing ──────────────────────────────────────────────────────────────────

const EASE_CLOSE = [0.76, 0, 0.24, 1];
const EASE_OPEN = [0.22, 1, 0.36, 1];

// ─── Route filter ────────────────────────────────────────────────────────────
// Mirrors the old FADE_ROUTES in ProjectPageFade — animate when navigating
// TO one of these routes.

function isAnimatedRoute(url) {
  const path = url.split("?")[0];
  return (
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
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="seam-loader"
          className="flex flex-col items-center gap-3 select-none"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: FADE_MS / 1000, ease: "easeInOut" }}
        >
          <p className="text-foreground/30 font-mono text-[9px] tracking-[0.35em] uppercase">
            loading
          </p>

          {/* Progress track */}
          <div
            className="relative w-56 overflow-hidden rounded-full"
            style={{ height: 4, background: "rgba(128,128,128,0.1)" }}
          >
            {/* Fill */}
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(128,128,128,0.25) 0%, var(--foreground) 100%)",
                opacity: 0.55,
              }}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.6, ease: [0.33, 1, 0.68, 1] }}
            />

            {/* Leading-edge glow dot */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 6,
                height: 6,
                translateX: "-50%",
                background: "var(--foreground)",
                opacity: 0.7,
                boxShadow: "0 0 6px 2px rgba(128,128,128,0.4)",
              }}
              initial={{ left: "0%" }}
              animate={{ left: "100%" }}
              transition={{ duration: 1.6, ease: [0.33, 1, 0.68, 1] }}
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

  // All mutable state tracked via refs so the effect closure is stable.
  const timers = useRef([]);
  const panelsClosedRef = useRef(false);
  const routeReadyRef = useRef(false);
  const holdReadyRef = useRef(false); // minimum hold timer elapsed
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
    // Called once ALL three gates pass: panels closed + route ready + min hold elapsed.
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
      if (!isAnimatedRoute(url)) return;
      clearTimers();
      panelsClosedRef.current = false;
      routeReadyRef.current = false;
      holdReadyRef.current = false;
      activeRef.current = true;
      setPhase("closing");

      // Gate 1: panels physically closed
      schedule(() => {
        panelsClosedRef.current = true;
        setPhase("loading");
        tryReveal();
      }, CLOSE_MS + 30);

      // Gate 2: minimum hold so progress bar has time to play even on cached routes
      schedule(() => {
        holdReadyRef.current = true;
        tryReveal();
      }, CLOSE_MS + MIN_HOLD_MS);
    };

    const onDone = () => {
      if (!activeRef.current) return;
      // Gate 3: actual route change complete
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
  }, []); // router.events is a stable emitter — empty deps is correct

  // Panels are at centre during closing, loading, and fading.
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
          className="bg-background absolute top-0 right-0 left-0 h-1/2"
          initial={{ y: "-100%" }}
          animate={{ y: topY }}
          transition={panelTransition}
        />

        {/* Bottom panel */}
        <motion.div
          className="bg-background absolute right-0 bottom-0 left-0 h-1/2"
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
