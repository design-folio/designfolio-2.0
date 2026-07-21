import { useRef } from "react";
import { motion } from "motion/react";
import { DEFAULT_PEGBOARD_IMAGES } from "@/lib/aboutConstants";

// Only the first 2 pegboard images are used here — the half-book art only has room
// for a two-photo stack (matches the reference Designer template exactly).
const TAPE_CONFIG = [
  { tape: "/assets/backgrounds/stickie1.avif", rotate: -5, top: 40, left: "25%" },
  { tape: "/assets/backgrounds/sticky-2.avif", rotate: 4, top: 260, left: "28%" },
];

export default function DesignerAboutPegboard({ images = [] }) {
  const boardRef = useRef(null);
  const photos = TAPE_CONFIG.map((cfg, i) => ({
    ...cfg,
    src: images[i]?.src || DEFAULT_PEGBOARD_IMAGES[i]?.src,
  })).filter((p) => p.src);

  return (
    <div
      ref={boardRef}
      className="relative w-full touch-none select-none"
      style={{ minHeight: 480 }}
    >
      <img
        src="/assets/png/halfbook.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        className="block w-full rounded-2xl select-none"
      />

      {/* Right-edge fade into the surrounding page */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: "linear-gradient(to right, transparent 55%, hsl(var(--background)) 100%)",
        }}
      />

      {photos.map((photo, i) => (
        <motion.div
          key={i}
          drag
          dragConstraints={boardRef}
          dragMomentum={false}
          whileDrag={{ scale: 1.06, zIndex: 30 }}
          whileHover={{ scale: 1.02 }}
          className="absolute z-[15] cursor-grab touch-none"
          style={{ top: photo.top, left: photo.left }}
        >
          <img
            src={photo.tape}
            draggable={false}
            alt=""
            className="pointer-events-none absolute z-20 w-[72px] -translate-x-1/2 select-none"
            style={{ top: -18, left: "50%" }}
          />
          <div
            className="w-[155px] bg-white"
            style={{
              padding: "9px 9px 36px 9px",
              transform: `rotate(${photo.rotate}deg)`,
              boxShadow: "0 8px 28px rgba(0,0,0,0.22), 0 1px 4px rgba(0,0,0,0.10)",
            }}
          >
            <img
              src={photo.src}
              draggable={false}
              alt=""
              className="block aspect-square w-full object-cover"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
