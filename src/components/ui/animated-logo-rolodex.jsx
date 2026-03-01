import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { useGlobalContext } from "@/context/globalContext";

const BG_COLORS = [
  "bg-[#FEF9C3]",
  "bg-[#FFEDD5]",
  "bg-[#DCFCE7]",
  "bg-[#DBEAFE]",
  "bg-[#F3E8FF]",
  "bg-[#FCE7F3]",
  "bg-[#E0F2FE]",
  "bg-[#FEF3C7]",
];

export const DivOrigami = () => {
  const { userDetails } = useGlobalContext();
  const tools = userDetails?.tools || [];

  const items = tools.map((tool, i) => (
    <LogoItem key={tool?.value || tool?.label || i} className={BG_COLORS[i % BG_COLORS.length]}>
      <img
        src={tool?.image || tool?.logo}
        alt={tool?.label || tool?.name}
        className="w-12 h-12 object-contain"
      />
    </LogoItem>
  ));

  return (
    <div className="flex flex-col items-center justify-center bg-transparent">
      <LogoRolodex items={items} />
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
