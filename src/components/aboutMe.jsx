import { usePegboardSounds } from "@/hooks/use-pegboard-sounds";
import { DEFAULT_PEGBOARD_IMAGES, DEFAULT_PEGBOARD_STICKERS } from "@/lib/aboutConstants";
import { sidebars } from "@/lib/constant";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useRef } from "react";
import Section from "./section";

export default function AboutMe({
  userDetails,
  edit = false,
  openModal,
  variant, // "default" | "pegboard"
}) {
  return (
    <Section
      title="About me"
      edit={edit}
      onClick={() => openModal?.(sidebars.about)}
      className="mt-0 mb-3"
      sectionId="about"
    >
      <AboutMeContent userDetails={userDetails} edit={edit} variant={variant} />
    </Section>
  );
}

export function AboutMeContent({
  userDetails,
  edit = false,
  variant, // "default" | "pegboard"
  showCaption = true,
  className = "",
  textClassName = "text-foreground-landing/80",
}) {
  const effectiveVariant = variant ?? "pegboard";

  const aboutObj = userDetails?.about;
  const description = aboutObj?.description || "";
  const images =
    aboutObj?.pegboardImages?.length > 0 ? aboutObj.pegboardImages : DEFAULT_PEGBOARD_IMAGES;
  const stickers =
    aboutObj?.pegboardStickers?.length > 0 ? aboutObj.pegboardStickers : DEFAULT_PEGBOARD_STICKERS;

  const hasDescription = description.trim().length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div className={cn("space-y-4 leading-relaxed", textClassName)}>
        <p
          className="text-scaled-16 text-foreground-landing/80 leading-relaxed whitespace-pre-wrap"
          data-testid="text-about-description-1"
        >
          {hasDescription ? description : edit ? "Write something about yourself here..." : ""}
        </p>
      </div>

      {effectiveVariant === "pegboard" && (
        <div className="mt-6">
          <Pegboard images={images} stickers={stickers} />
          {showCaption && (
            <div
              className={cn(
                "pointer-events-none mb-4 text-center text-[10px] font-medium tracking-widest uppercase",
                textClassName,
                "text-foreground-landing/20"
              )}
            >
              Try moving things around :)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Fixed pixel bounds (not ref-measured) so drag position stays correct through
// mobile Safari's touch-scroll + address-bar-resize quirks that corrupt
// getBoundingClientRect-based dragConstraints mid-gesture.
const PEGBOARD_DRAG_BOUNDS = { top: -50, left: -50, right: 50, bottom: 50 };

function Pegboard({ images = [], stickers = [] }) {
  const pinBoardRef = useRef(null);
  const { playPick, playPlace } = usePegboardSounds();

  // Same layout on mobile and desktop: four corners + center stickers (avoids mobile overlap)
  const imageConfigs = [
    {
      style: { left: "20%", top: "25%", transform: "translate(-50%, -50%) rotate(-5deg)" },
      className: "w-24 sm:w-28 md:w-36 lg:w-40 aspect-[4/3]",
      fallbackSrc: "/assets/png/project1.png",
      pinColor: "#FF553E",
    },
    {
      style: { left: "80%", top: "30%", transform: "translate(-50%, -50%) rotate(3deg)" },
      className: "w-28 sm:w-32 md:w-40 lg:w-44 aspect-square",
      fallbackSrc: "/assets/png/project3.png",
      pinColor: "#FF553E",
    },
    {
      style: { left: "25%", top: "75%", transform: "translate(-50%, -50%) rotate(-2deg)" },
      className: "w-24 sm:w-28 md:w-36 lg:w-40 aspect-[3/4]",
      fallbackSrc: "/assets/png/project4.png",
      pinColor: "#FF553E",
    },
    {
      style: { left: "75%", top: "75%", transform: "translate(-50%, -50%) rotate(4deg)" },
      className: "w-20 sm:w-24 md:w-32 lg:w-36 aspect-[4/3]",
      fallbackSrc: "/assets/png/project5.png",
      pinColor: "#FF553E",
    },
  ];

  const stickerConfigs = [
    {
      style: { left: "44%", top: "48%", transform: "translate(-50%, -50%) rotate(-15deg)" },
      className:
        "absolute w-20 sm:w-24 md:w-32 lg:w-36 aspect-square cursor-grab active:cursor-grabbing z-50",
      fallbackSrc: "/assets/svgs/star.svg",
    },
    {
      style: { left: "55%", top: "60%", transform: "translate(-50%, -50%) rotate(10deg)" },
      className:
        "absolute w-24 sm:w-28 md:w-36 lg:w-40 aspect-square cursor-grab active:cursor-grabbing z-50",
      fallbackSrc: "/assets/svgs/quote.svg",
    },
  ];

  return (
    <div className="group/pegboard relative mb-8">
      {/* Board depth */}
      <div className="pointer-events-none absolute inset-0 translate-x-[1px] translate-y-[2px] rounded-2xl bg-black/5 blur-[3px]" />

      <div
        ref={pinBoardRef}
        className="dark:bg-background relative z-10 aspect-[4/3] w-full overflow-visible rounded-2xl border border-black/[0.03] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.02)] sm:aspect-[16/10] lg:aspect-[16/9]"
      >
        {/* Pegboard holes */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle,rgba(0,0,0,0.10)_2px,transparent_2px)] [background-size:36px_36px] [background-clip:content-box] bg-center [background-origin:content-box] p-[18px] dark:bg-[radial-gradient(circle,#30323C_2px,transparent_2px)]" />

        {/* Lighting */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-tr from-black/[0.01] via-transparent to-white/[0.05]" />

        {/* Render Images */}
        {/* OLD: PegboardItem with initial={config.initial} animate={config.initial} instead of style */}
        {imageConfigs.map((config, index) => {
          const img = images[index];
          if (!img) return null;
          return (
            <PegboardItem
              key={`img-${index}`}
              onDragStart={playPick}
              onDragEnd={playPlace}
              style={config.style}
              className={config.className}
              imgSrc={img.src}
              fallbackSrc={config.fallbackSrc}
              pinColor={config.pinColor}
            />
          );
        })}

        {/* Render Stickers */}
        {/* OLD: <motion.div initial={config.initial} animate={config.initial} style={config.style} className={config.className} ...> (no wrapper) */}
        {/* {stickerConfigs.map((config, index) => {
          const sticker = stickers[index];
          if (!sticker) return null;
          return (
            <div
              key={`sticker-${index}`}
              style={config.style}
              className={config.className}
            >
              <motion.div
                drag
                dragMomentum={false}
                dragConstraints={pinBoardRef}
                dragElastic={0.1}
                onDragStart={playPick}
                onDragEnd={playPlace}
                className="relative w-full h-full"
                whileDrag={{ scale: 1.1, zIndex: 60 }}
              >
                <img
                  src={sticker.src}
                  alt={`Sticker ${index + 1}`}
                  className="w-full h-full object-contain pointer-events-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = config.fallbackSrc;
                  }}
                />
                <Pin color="#3B82F6" small />
              </motion.div>
            </div>
          );
        })} */}
      </div>
    </div>
  );
}

function PegboardItem({
  onDragStart,
  onDragEnd,
  style,
  className,
  imgSrc,
  fallbackSrc,
  alt,
  pinColor,
}) {
  // OLD (single motion.div with initial/animate - broke on mobile resize/reload):
  // return (
  //   <motion.div drag ... initial={initial} animate={initial}
  //     className={cn("absolute p-1 bg-white shadow-... cursor-grab", className)}>
  //     <div className="w-full h-full overflow-hidden rounded-sm"><img .../></div>
  //     <Pin color={pinColor} />
  //   </motion.div>
  // );
  return (
    <div style={style} className={cn("absolute", className)}>
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={PEGBOARD_DRAG_BOUNDS}
        dragElastic={0.1}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className="relative h-full w-full cursor-grab rounded-sm bg-white p-1 shadow-[0_8px_16px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.02)] active:cursor-grabbing"
        whileDrag={{
          scale: 1.05,
          zIndex: 50,
          boxShadow: "0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)",
        }}
      >
        <div className="h-full w-full overflow-hidden rounded-sm">
          <img
            src={imgSrc}
            alt={alt}
            className="pointer-events-none h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = fallbackSrc;
            }}
          />
        </div>
        <Pin color={pinColor} />
      </motion.div>
    </div>
  );
}

function Pin({ color = "#FF553E", small = false }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute left-1/2 z-20 flex -translate-x-1/2 items-center justify-center",
        small ? "-top-2 h-4 w-4" : "-top-3 h-6 w-6"
      )}
    >
      <div
        className={cn(
          "relative rounded-full",
          small ? "h-3.5 w-3.5" : "h-5 w-5",
          // v3: different shadow strength for sticker pins
          small
            ? "shadow-[0_1.5px_3px_rgba(0,0,0,0.2),inset_0_-0.75px_1.5px_rgba(0,0,0,0.2)]"
            : "shadow-[0_2px_4px_rgba(0,0,0,0.2),inset_0_-1px_2px_rgba(0,0,0,0.2)]"
        )}
        style={{ backgroundColor: color }}
      >
        <div
          className={cn(
            // v3: smaller highlight for sticker pin
            small ? "absolute top-0.5 left-1 h-1 w-1" : "absolute top-1 left-1.5 h-1.5 w-1.5",
            "rounded-full bg-white/40 blur-[0.5px]"
          )}
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/10 to-transparent" />
      </div>
      <div
        className={cn(
          // match v3 needle styling
          "absolute w-[1px] -rotate-12 bg-black/20 blur-[0.5px]",
          small ? "top-3 h-1.5" : "top-4 h-2"
        )}
      />
    </div>
  );
}
