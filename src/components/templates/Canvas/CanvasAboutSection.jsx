import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { Button } from "../../ui/button";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import {
  DEFAULT_PEGBOARD_IMAGES,
  DEFAULT_PEGBOARD_STICKERS,
} from "@/lib/aboutConstants";

function playPegboardClick(type) {
  try {
    const audioContext =
      new window.AudioContext() || window.webkitAudioContext();
    const now = audioContext.currentTime;

    if (type === "grab") {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    } else {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch (e) {
    // Audio context not available or blocked
  }
}

function PegboardImage({ img, index, zIndex, pegboardRef, onBringToFront }) {
  return (
    <motion.div
      key={img._id || index}
      drag
      dragConstraints={pegboardRef}
      dragMomentum={false}
      dragElastic={0}
      onDragStart={() => {
        onBringToFront(index);
        playPegboardClick("grab");
      }}
      onDragEnd={() => playPegboardClick("drop")}
      onPointerDown={() => onBringToFront(index)}
      whileDrag={{ scale: 1.05, cursor: "grabbing" }}
      initial={{ y: index % 2 === 0 ? 10 : -10 }}
      style={{ zIndex }}
      className={`relative ${
        index === 1 ? "w-32 md:w-44 aspect-square" : "w-28 md:w-36 aspect-[3/4]"
      } group cursor-grab`}
    >
      <div
        className="w-full h-full pointer-events-none relative"
        style={{
          transform: `rotate(${index % 2 === 0 ? "-4deg" : "6deg"})`,
        }}
      >
        <div className="w-full h-full bg-white dark:bg-[#2A2520] p-2 rounded-[16px] shadow-sm border border-black/5 dark:border-white/10 relative group-hover:shadow-md transition-shadow">
          <img
            src={img.src || img.key}
            alt={`pegboard-${index}`}
            className="w-full h-full object-cover rounded-[8px]"
            draggable="false"
          />
        </div>
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-[#DFCDAA]/90 dark:bg-[#9B8C73]/90 backdrop-blur-sm shadow-sm z-20"
          style={{ transform: "rotate(-3deg)" }}
        ></div>
      </div>
    </motion.div>
  );
}

function CanvasAboutSection({ isEditing }) {
  const { userDetails, openSidebar } = useGlobalContext();
  const { about } = userDetails || {};
  const pegboardRef = useRef(null);
  const [zIndexes, setZIndexes] = useState({ 0: 10, 1: 20, 2: 10 });

  const images =
    about?.pegboardImages?.length > 0
      ? about.pegboardImages
      : DEFAULT_PEGBOARD_IMAGES;

  const bringToFront = useCallback((id) => {
    setZIndexes((prev) => {
      const maxZ = Math.max(...Object.values(prev));
      return { ...prev, [id]: maxZ + 1 };
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.9 }}
      className="bg-white/80 dark:bg-[#2A2520]/80 backdrop-blur-md rounded-[32px] border border-[#E5D7C4] dark:border-white/10 p-6 w-full relative group/section"
    >
      {isEditing && (
        <div className="absolute -top-3 -right-3 opacity-100 md:opacity-0 md:group-hover/section:opacity-100 transition-opacity z-10 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openSidebar?.(sidebars.about)}
            className="h-8 flex items-center gap-1.5 px-3 rounded-full bg-white dark:bg-[#2A2520] shadow-md border border-[#E5D7C4] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#35302A]"
          >
            <Pencil className="w-3.5 h-3.5 text-[#1A1A1A] dark:text-[#F0EDE7]" />
            <span className="text-xs font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
              Edit Story
            </span>
          </Button>
        </div>
      )}
      <h2
        className="text-[#7A736C] dark:text-[#B5AFA5] text-xs font-mono mb-6"
        style={{
          fontFamily: "DM Mono, monospace",
          fontSize: "14px",
          fontWeight: "500",
        }}
      >
        MY STORY
      </h2>

      {/* Pegboard */}
      <div className="relative w-full mb-8 rounded-[32px] border border-black/5 dark:border-white/10 bg-[#F7F4EF] dark:bg-[#1E1B18]">
        <div
          className="absolute -inset-6 md:-inset-10 pointer-events-none"
          ref={pegboardRef}
        ></div>

        {/* Light Mode Grid */}
        <div
          className="absolute inset-0 dark:hidden pointer-events-none rounded-[32px] overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            backgroundPosition: "center center",
          }}
        ></div>
        {/* Dark Mode Grid */}
        <div
          className="absolute inset-0 hidden dark:block pointer-events-none rounded-[32px] overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            backgroundPosition: "center center",
          }}
        ></div>

        <div className="relative h-[260px] md:h-[320px] flex flex-row items-center justify-center px-2 md:p-4 gap-4 md:gap-10">
          {images.map((img, index) => (
            <PegboardImage
              key={img._id || index}
              img={img}
              index={index}
              zIndex={zIndexes[index]}
              pegboardRef={pegboardRef}
              onBringToFront={bringToFront}
            />
          ))}
        </div>
      </div>

      {/* Story Text */}
      <div className="space-y-4">
        <p className="text-[#7A736C] dark:text-[#B5AFA5] text-[16px] leading-relaxed">
          {about?.description?.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </p>
      </div>
    </motion.div>
  );
}

export default React.memo(CanvasAboutSection);
