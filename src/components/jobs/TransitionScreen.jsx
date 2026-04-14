import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Orbiting company logos
const ORBIT_LOGOS = [
  "/companylogo/companyradial01.svg",
  "/companylogo/companyradial02.svg",
  "/companylogo/companyradial03.svg",
  "/companylogo/companyradial04.svg",
  "/companylogo/companyradial05.svg",
  "/companylogo/companyradial06.svg",
  "/companylogo/companyradial07.svg",
  "/companylogo/companyradial08.svg",
];

function OrbitRing({ visible }) {
  const [r, setR] = useState(280);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth <= 640) setR(190);
      else if (window.innerWidth <= 900) setR(240);
      else setR(280);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const size = 2 * r + 100;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute top-1/2 left-1/2 pointer-events-none"
          style={{ transform: "translate(-50%, -50%)", width: size, height: size }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
        >
          {/* Outer orbit ring */}
          <div
            className="absolute inset-0 rounded-full border border-border/30"
            style={{ animation: "spin 32s linear infinite" }}
          >
            {ORBIT_LOGOS.map((src, i) => {
              const angle = (i / ORBIT_LOGOS.length) * 360;
              const rad = (angle * Math.PI) / 180;
              const x = r * Math.cos(rad);
              const y = r * Math.sin(rad);
              return (
                <div
                  key={i}
                  className="absolute flex items-center justify-center"
                  style={{
                    width: 48,
                    height: 48,
                    left: "50%",
                    top: "50%",
                    transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${-angle}deg)`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl bg-white dark:bg-[#2A2520] border border-border/50 flex items-center justify-center p-1.5 shadow-sm"
                    style={{ animation: `spin-reverse 32s linear infinite` }}
                  >
                    <img src={src} alt="" className="w-full h-full object-contain opacity-70 dark:opacity-50" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inner subtle ring */}
          <div
            className="absolute rounded-full border border-border/15"
            style={{ inset: 80 }}
          />

          <style>{`
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes spin-reverse { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
            @keyframes shimmer-text {
              0% { background-position: 100% 0; }
              100% { background-position: -100% 0; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AnimatedJobCount({ onDone }) {
  const [count, setCount] = useState(0);
  const [showGradient, setShowGradient] = useState(false);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const doneFiredRef = useRef(false);

  useEffect(() => {
    const duration = 1800;
    const target = 1200;

    const tick = (now) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      setCount(current);

      if (!doneFiredRef.current && current >= target / 2) {
        doneFiredRef.current = true;
        onDone?.();
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setCount(target);
        setTimeout(() => setShowGradient(true), 80);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const display = count >= 1200 ? "1,200+" : count.toLocaleString();

  return (
    <span
      key={showGradient ? "g" : "n"}
      style={showGradient ? {
        display: "inline-block",
        whiteSpace: "nowrap",
        paddingRight: "0.08em",
        color: "transparent",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        backgroundImage: "linear-gradient(to right, hsl(var(--foreground)) 0%, hsl(var(--foreground)) 38%, #5D3560 52%, #E54D2E 62%, #F5A623 72%, hsl(var(--foreground)) 86%, hsl(var(--foreground)) 100%)",
        backgroundSize: "300% 100%",
        animation: "shimmer-text 3s ease-in-out forwards",
      } : { display: "inline-block", whiteSpace: "nowrap" }}
    >
      {display}
    </span>
  );
}

export function TransitionScreen({ onType }) {
  const [orbitVisible, setOrbitVisible] = useState(false);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-[#F0EDE7] dark:bg-background px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full dark:bg-[#FF553E]/8 blur-[120px]" />
      </div>

      <OrbitRing visible={orbitVisible} />

      <motion.div
        className="relative z-10 max-w-md text-center space-y-6"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
      >
        <div className="space-y-3">
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-foreground">
            We found <AnimatedJobCount onDone={() => setOrbitVisible(true)} />
            <br />
            jobs that match your profile.
          </h1>
          <p className="text-[16px] text-muted-foreground leading-relaxed font-light">
            Now let&apos;s find the ones worth your time. Answer 3 quick questions and we&apos;ll narrow it down to your best matches.
          </p>
        </div>

        <motion.div
          className="flex items-center justify-center pt-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <button
            data-testid="button-lets-do-it"
            onClick={onType}
            className="cursor-pointer flex items-center gap-2 bg-foreground text-background font-medium text-[14px] px-7 py-3 rounded-full hover:bg-foreground/90 transition-all active:scale-[0.97]"
          >
            Let&apos;s do it
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
