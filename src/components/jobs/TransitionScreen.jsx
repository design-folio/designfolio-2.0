import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight } from "lucide-react";

// Orbiting company logos
const ORBIT_COMPANIES = [
  { id: 1, name: "Company 1", src: "/companylogo/companyradial01.svg" },
  { id: 2, name: "Company 2", src: "/companylogo/companyradial02.svg" },
  { id: 3, name: "Company 3", src: "/companylogo/companyradial03.svg" },
  { id: 4, name: "Company 4", src: "/companylogo/companyradial04.svg" },
  { id: 5, name: "Company 5", src: "/companylogo/companyradial05.svg" },
  { id: 6, name: "Company 6", src: "/companylogo/companyradial06.svg" },
  { id: 7, name: "Company 7", src: "/companylogo/companyradial07.svg" },
  { id: 8, name: "Company 8", src: "/companylogo/companyradial08.svg" },
];

function OrbitRing({ visible }) {
  const [stageSize, setStageSize] = useState(640);
  const [imageSize, setImageSize] = useState(52);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth <= 640) {
        setStageSize(380);
        setImageSize(42);
      } else if (window.innerWidth <= 900) {
        setStageSize(520);
        setImageSize(46);
      } else {
        setStageSize(640);
        setImageSize(52);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const step = useMemo(() => 360 / ORBIT_COMPANIES.length, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none absolute top-1/2 left-1/2"
          style={{ transform: "translate(-50%, -50%)", width: stageSize, height: stageSize }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
        >
          {ORBIT_COMPANIES.map((item, i) => {
            const angle = i * step;
            return (
              <motion.div
                key={item.id}
                className="absolute inset-0"
                initial={{ rotate: 0 }}
                animate={{ rotate: [angle, angle + 360] }}
                transition={{
                  rotate: {
                    delay: 1.1,
                    duration: 28,
                    ease: "linear",
                    repeat: Infinity,
                  },
                }}
              >
                <motion.img
                  src={item.src}
                  alt={item.name}
                  draggable={false}
                  className="absolute left-1/2 -translate-x-1/2 rounded-full select-none"
                  style={{
                    top: 0,
                    width: imageSize,
                    height: imageSize,
                  }}
                  initial={{ opacity: 0, y: 8, filter: "blur(8px)", rotate: -angle }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    rotate: [-angle, -angle - 360],
                  }}
                  transition={{
                    opacity: { delay: 0.7 + i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                    y: { delay: 0.7 + i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                    filter: { delay: 0.7 + i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                    rotate: {
                      delay: 1.1,
                      duration: 28,
                      ease: "linear",
                      repeat: Infinity,
                    },
                  }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AnimatedJobCount({ onDone }) {
  const [count, setCount] = useState(0);
  const [showGradient, setShowGradient] = useState(false);
  const rafRef = useRef(null);
  const shimmerTimeoutRef = useRef(null);
  const shimmerResetRef = useRef(null);
  const startRef = useRef(null);
  const doneFiredRef = useRef(false);

  useEffect(() => {
    const duration = 1800; // natural pacing
    const target = 1200;

    const tick = (now) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      setCount((prev) => (prev === current ? prev : current));

      // fire at halfway
      if (!doneFiredRef.current && current >= target / 2) {
        doneFiredRef.current = true;
        onDone?.();
      }

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setCount(target);
        shimmerTimeoutRef.current = setTimeout(() => {
          setShowGradient(true);
          shimmerResetRef.current = setTimeout(() => setShowGradient(false), 3000);
        }, 80);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (shimmerTimeoutRef.current) clearTimeout(shimmerTimeoutRef.current);
      if (shimmerResetRef.current) clearTimeout(shimmerResetRef.current);
    };
  }, [onDone]);

  const display = count >= 1200 ? "1,200+" : count.toLocaleString();

  return (
    <span
      style={
        showGradient
          ? {
              display: "inline-block",
              whiteSpace: "nowrap",
              fontVariantNumeric: "tabular-nums",
              paddingRight: "0.08em",
              color: "transparent",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              backgroundImage:
                "linear-gradient(to right, var(--foreground) 0%, var(--foreground) 38%, #5D3560 52%, #E54D2E 62%, #F5A623 72%, var(--foreground) 86%, var(--foreground) 100%)",
              backgroundSize: "300% 100%",
              animation: "shimmer-text 3s ease-in-out forwards",
            }
          : { display: "inline-block", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }
      }
    >
      {display}
    </span>
  );
}

export function TransitionScreen({ onType }) {
  const [orbitVisible, setOrbitVisible] = useState(false);

  return (
    <motion.div
      className="flex flex-1 flex-col items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF553E]/5 blur-[120px] dark:bg-[#FF553E]/15" />
      </div>

      <OrbitRing visible={orbitVisible} />

      <motion.div
        className="relative z-10 max-w-md space-y-6 text-center"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.7, ease: "easeOut" }}
      >
        <div className="space-y-3">
          <h1 className="text-foreground text-[28px] leading-tight font-semibold tracking-tight">
            We found <AnimatedJobCount onDone={() => setOrbitVisible(true)} />
            <br />
            jobs that match your profile.
          </h1>
          <p className="text-muted-foreground text-[16px] leading-relaxed font-light">
            Answer 2 quick questions and let AI rank the best matches based on your portfolio.
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
            className="bg-foreground text-background hover:bg-foreground/90 flex cursor-pointer items-center gap-2 rounded-full px-7 py-3 text-[14px] font-medium transition-all active:scale-[0.97]"
          >
            Narrow It Down
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
      </motion.div>

      <style>{`
        @keyframes shimmer-text {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </motion.div>
  );
}
