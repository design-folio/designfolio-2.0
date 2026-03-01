import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SiAmazon, SiGithub, SiGoogle, SiMeta, SiTwitch } from "react-icons/si";
import { twMerge } from "tailwind-merge";

export const DivOrigami = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-transparent">
      <LogoRolodex
        items={[
          <LogoItem key={1} className="bg-[#FEF9C3] text-yellow-900/50"><SiAmazon /></LogoItem>,
          <LogoItem key={2} className="bg-[#FFEDD5] text-orange-900/50"><SiGoogle /></LogoItem>,
          <LogoItem key={3} className="bg-[#DCFCE7] text-green-900/50"><SiMeta /></LogoItem>,
          <LogoItem key={4} className="bg-[#DBEAFE] text-blue-900/50"><SiGithub /></LogoItem>,
          <LogoItem key={5} className="bg-[#F3E8FF] text-purple-900/50"><SiTwitch /></LogoItem>,
        ]}
      />
    </div>
  );
};

const DELAY_IN_MS = 2500;
const TRANSITION_DURATION_IN_SECS = 1.5;

const LogoRolodex = ({ items }) => {
  const intervalRef = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndex((pv) => pv + 1);
    }, DELAY_IN_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <div
      style={{ transform: "rotateY(-10deg) rotateX(2deg)", transformStyle: "preserve-3d" }}
      className="relative z-0 h-44 w-80 shrink-0"
    >
      <AnimatePresence mode="sync">
        <motion.div
          style={{ y: "-50%", x: "-50%", clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)", zIndex: -index, backfaceVisibility: "hidden" }}
          key={index}
          transition={{ duration: TRANSITION_DURATION_IN_SECS, ease: "easeInOut" }}
          initial={{ rotateX: "0deg" }}
          animate={{ rotateX: "0deg" }}
          exit={{ rotateX: "-180deg" }}
          className="absolute left-1/2 top-1/2"
        >
          {items[index % items.length]}
        </motion.div>
        <motion.div
          style={{ y: "-50%", x: "-50%", clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)", zIndex: index, backfaceVisibility: "hidden" }}
          key={(index + 1) * 2}
          initial={{ rotateX: "180deg" }}
          animate={{ rotateX: "0deg" }}
          exit={{ rotateX: "0deg" }}
          transition={{ duration: TRANSITION_DURATION_IN_SECS, ease: "easeInOut" }}
          className="absolute left-1/2 top-1/2"
        >
          {items[index % items.length]}
        </motion.div>
      </AnimatePresence>
      <hr
        style={{ transform: "translateZ(1px)" }}
        className="absolute left-0 right-0 top-1/2 z-[999999999] -translate-y-1/2 border-t border-black/10"
      />
    </div>
  );
};

const LogoItem = ({ children, className }) => (
  <div className={twMerge("grid h-44 w-80 place-content-center text-6xl shadow-sm border-r border-black/5", className)}>
    {children}
  </div>
);
