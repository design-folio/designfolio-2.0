import { useCallback, useRef, useState } from "react";
import { motion } from "motion/react";
import { MapPin, Pencil, Trash2, Plus, ChevronsUpDown } from "lucide-react";
import { useGlobalContext } from "@/context/globalContext";
import { sidebars } from "@/lib/constant";
import { _deleteExperience } from "@/network/post-request";
import { getPlainTextLength } from "@/lib/tiptapUtils";
import SimpleTiptapRenderer from "@/components/SimpleTiptapRenderer";
import { UnsavedChangesDialog } from "@/components/ui/UnsavedChangesDialog";
import { Button } from "@/components/ui/button";

// Layout constants — px per experience column, ground/platform/card sizing.
const SECTION_W = 450;
const LEAD_PAD = 80;
const TRAIL_PAD = 120;
const TOTAL_H = 580;
const GROUND_H = 72;
const PLATFORM_H = 28;
const PLATFORM_W = 210;
const CARD_W = 370;
const ELEVATION = 310;

const CLOUDS = [
  { x: 8, y: 8, scale: 1 },
  { x: 28, y: 14, scale: 0.7 },
  { x: 52, y: 6, scale: 1.2 },
  { x: 72, y: 12, scale: 0.85 },
  { x: 88, y: 7, scale: 0.95 },
];

const LOGO_COLORS = ["#111827", "#3B82F6", "#EA4335", "#059669", "#7C3AED", "#DB2777"];

function playMarioSound(direction) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.28, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.32);
    const freqs = direction === "right" ? [783.99, 1046.5] : [1046.5, 783.99];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.connect(gain);
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09);
      osc.start(ctx.currentTime + i * 0.09);
      osc.stop(ctx.currentTime + i * 0.09 + 0.1);
    });
  } catch {
    /* AudioContext blocked */
  }
}

function PixelCloud({ x, y, scale = 1 }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `scale(${scale})`,
        transformOrigin: "left top",
        pointerEvents: "none",
      }}
    >
      <div style={{ position: "relative", width: 80, height: 40 }}>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 16,
            background: "white",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            width: 28,
            height: 20,
            background: "white",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 24,
            width: 32,
            height: 22,
            background: "white",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 44,
            width: 22,
            height: 18,
            background: "white",
          }}
        />
      </div>
    </div>
  );
}

function Pipe({ x }) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        bottom: GROUND_H,
        transform: "translateX(-50%)",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: 52,
          height: 16,
          background: "linear-gradient(to right, #2EA829 0%, #3FBF3A 40%, #2EA829 100%)",
          border: "2.5px solid #1D7C19",
          borderBottom: "none",
          marginLeft: -4,
        }}
      />
      <div
        style={{
          width: 44,
          height: 56,
          background: "linear-gradient(to right, #2EA829 0%, #3FBF3A 40%, #2EA829 100%)",
          border: "2.5px solid #1D7C19",
          borderTop: "none",
        }}
      />
    </div>
  );
}

function BrickPlatform({ centerX }) {
  const brickCount = Math.round(PLATFORM_W / 32);
  return (
    <div
      style={{
        position: "absolute",
        left: centerX - PLATFORM_W / 2,
        bottom: GROUND_H,
        width: PLATFORM_W,
        height: PLATFORM_H,
        display: "flex",
      }}
    >
      {Array.from({ length: brickCount }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: PLATFORM_H,
            background: "#C84B11",
            border: "2px solid #8B3A0D",
          }}
        />
      ))}
    </div>
  );
}

function DateBadge({ text, centerX, y }) {
  return (
    <div
      style={{
        position: "absolute",
        left: centerX,
        top: y,
        transform: "translateX(-50%)",
        background: "linear-gradient(160deg, #FFE045 0%, #F5B800 55%, #E09C00 100%)",
        border: "2.5px solid #A06800",
        borderRadius: 6,
        padding: "6px 16px",
        fontSize: 13,
        fontWeight: 800,
        color: "#3D1C00",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
        zIndex: 4,
      }}
    >
      {text}
    </div>
  );
}

function Connector({ x, top, bottom }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x - 1,
        top,
        width: 2,
        height: bottom - top,
        backgroundImage:
          "repeating-linear-gradient(to bottom, #CBD5E1 0px, #CBD5E1 5px, transparent 5px, transparent 10px)",
        zIndex: 3,
      }}
    />
  );
}

function ExperienceLogo({ company, index }) {
  const initial = (company || "?").trim().charAt(0).toUpperCase() || "?";
  const color = LOGO_COLORS[index % LOGO_COLORS.length];
  return (
    <div
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] border border-[#E2E8F0] text-[16px] font-bold text-white"
      style={{ background: color }}
    >
      {initial}
    </div>
  );
}

function ExperienceCard({ exp, index, centerX, top, isEditing, onEdit, onDelete }) {
  const textLength = getPlainTextLength(exp.description || "");
  const hasDescription = textLength > 0;
  const period = `${exp.startMonth || ""} ${exp.startYear || ""} – ${exp.currentlyWorking ? "Present" : `${exp.endMonth || ""} ${exp.endYear || ""}`}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: "-40px" }}
      style={{
        position: "absolute",
        left: centerX - CARD_W / 2,
        top,
        width: CARD_W,
        background: "rgba(255,255,255,0.97)",
        border: "1.5px solid rgba(226,232,240,0.9)",
        borderRadius: 14,
        padding: "22px 26px",
        boxShadow: "0 4px 24px rgba(15,23,42,0.08), 0 1px 3px rgba(15,23,42,0.06)",
        zIndex: 5,
      }}
    >
      {isEditing && (
        <div className="absolute top-3 right-3 z-10 flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(exp)}
            className="h-7 w-7 rounded-full border-[#E2E8F0] bg-white p-0 shadow-sm hover:bg-gray-50"
            aria-label="Edit experience"
          >
            <Pencil className="h-3 w-3 text-[#1A1A1A]" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(exp)}
            className="h-7 w-7 rounded-full border-[#E2E8F0] bg-white p-0 shadow-sm hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            aria-label="Delete experience"
          >
            <Trash2 className="h-3 w-3 text-[#1A1A1A]" />
          </Button>
        </div>
      )}

      <div className="mb-3.5 flex items-start gap-3.5">
        <ExperienceLogo company={exp.company} index={index} />
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[18px] font-bold text-[#0F172A]">{exp.role}</p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[15px] font-medium text-[#64748B]">{exp.company}</p>
            {exp.location && (
              <div className="flex flex-shrink-0 items-center gap-1">
                <MapPin size={13} color="#94A3B8" strokeWidth={2} />
                <p className="text-[13px] whitespace-nowrap text-[#94A3B8]">{exp.location}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mb-3.5 h-px bg-[#F1F5F9]" />
      <p className="mb-2.5 w-fit rounded-full bg-[#F1F5F9] px-2.5 py-1 text-[12px] font-medium whitespace-nowrap text-[#475569]">
        {period}
      </p>
      {hasDescription && (
        <div className="line-clamp-3 text-[13.5px] leading-relaxed text-[#475569]">
          <SimpleTiptapRenderer
            content={exp.description}
            mode="work"
            enableBulletList
            className="text-[13.5px] leading-relaxed text-[#475569]"
            noCardStyle
          />
        </div>
      )}
    </motion.div>
  );
}

export default function DesignerExperience({ isEditing }) {
  const { userDetails, setUserDetails, updateCache, openSidebar, openNewWork, setSelectedWork } =
    useGlobalContext();
  const { experiences = [] } = userDetails || {};

  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const scrollByCard = useCallback((dir) => {
    scrollRef.current?.scrollBy({
      left: dir === "right" ? SECTION_W : -SECTION_W,
      behavior: "smooth",
    });
  }, []);

  const handleNav = useCallback(
    (dir) => {
      playMarioSound(dir);
      scrollByCard(dir);
    },
    [scrollByCard]
  );

  const onMouseDown = useCallback((e) => {
    isDragging.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    scrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
    if (scrollRef.current) scrollRef.current.style.cursor = "grabbing";
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    const delta = (x - startX.current) * 1.2;
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollLeft.current - delta;
  }, []);

  const stopDrag = useCallback(() => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  }, []);

  const handleEdit = useCallback(
    (exp) => {
      setSelectedWork(exp);
      openSidebar(sidebars.work);
    },
    [setSelectedWork, openSidebar]
  );

  const confirmDelete = useCallback(() => {
    const target = deleteTarget;
    if (!target?._id) return;
    _deleteExperience(target._id).then(() => {
      const remove = (list) => (list || []).filter((item) => item._id !== target._id);
      setUserDetails((prev) => ({ ...prev, experiences: remove(prev?.experiences) }));
      updateCache("userDetails", (prev) => ({ ...prev, experiences: remove(prev?.experiences) }));
      setDeleteTarget(null);
    });
  }, [deleteTarget, setUserDetails, updateCache]);

  const n = experiences.length;
  const totalWidth = LEAD_PAD + Math.max(n, 1) * SECTION_W + TRAIL_PAD;
  const centerXs = experiences.map((_, i) => LEAD_PAD + i * SECTION_W + SECTION_W / 2);
  const cardTop = TOTAL_H - GROUND_H - PLATFORM_H - ELEVATION;
  const badgeTop = cardTop - 54;
  const pipeXs = experiences
    .slice(0, -1)
    .map((_, i) => ((centerXs[i] + centerXs[i + 1]) / 2 / totalWidth) * 100);

  if (!isEditing && n === 0) return null;

  return (
    <div className="pt-20">
      <div className="mb-8 px-6 md:px-0">
        <div className="mb-4 flex items-center gap-3">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
            <path d="M7 0L8.4 5.6L14 7L8.4 8.4L7 14L5.6 8.4L0 7L5.6 5.6L7 0Z" fill="#3B82F6" />
          </svg>
          <span className="designer-script text-[22px] font-bold tracking-[0.04em] text-[#439BEA]">
            Work experience
          </span>
          <div className="h-px flex-1 bg-[#E2E8F0]" />
          {isEditing && n > 0 && (
            <div className="flex flex-shrink-0 gap-2">
              {n >= 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openSidebar(sidebars.sortWorks)}
                  className="h-8 w-8 rounded-full border-[#E2E8F0] bg-white p-0 shadow-sm hover:bg-gray-50"
                  aria-label="Rearrange experience"
                >
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => openNewWork()}
                className="h-8 gap-1.5 rounded-full border-[#E2E8F0] bg-white px-3 text-[12px] font-medium shadow-sm hover:bg-gray-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          )}
        </div>
        <h2
          className="designer-heading text-[#0F172A]"
          style={{
            fontSize: "clamp(22px, 3.2vw, 38px)",
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: "-0.025em",
          }}
        >
          where I&apos;ve done my best work
        </h2>
      </div>

      {n === 0 ? (
        <div className="mx-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 bg-white/60 px-4 py-16 text-center md:mx-0">
          <h3 className="mb-1 text-[15px] font-medium text-[#1A1A1A]">No experience yet</h3>
          <p className="mb-5 max-w-[250px] text-[13px] text-[#7A736C]">
            Add your work experience to build your career timeline.
          </p>
          {isEditing && (
            <Button
              onClick={() => openNewWork()}
              className="flex h-9 items-center gap-2 rounded-full bg-[#1A1A1A] px-5 text-[13px] font-medium text-white shadow-sm hover:bg-black/80"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Experience
            </Button>
          )}
        </div>
      ) : (
        <div className="relative" style={{ marginBottom: 80 }}>
          <div
            ref={scrollRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
            className="designer-hide-scrollbar"
            style={{
              overflowX: "auto",
              overflowY: "hidden",
              cursor: "grab",
              userSelect: "none",
              borderRadius: 20,
              border: "1.5px solid rgba(226,232,240,0.7)",
              boxShadow: "0 8px 40px rgba(15,23,42,0.07)",
            }}
          >
            <div
              style={{
                position: "relative",
                width: totalWidth,
                height: TOTAL_H,
                background: "linear-gradient(to bottom, #DAEFFE 0%, #C5E8FB 40%, #B3DFF8 100%)",
                flexShrink: 0,
              }}
            >
              {CLOUDS.map((c, i) => (
                <PixelCloud key={i} x={c.x} y={c.y} scale={c.scale} />
              ))}

              {pipeXs.map((x, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -7, 0] }}
                  transition={{
                    duration: 1.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4,
                  }}
                  style={{
                    position: "absolute",
                    left: `${x}%`,
                    bottom: GROUND_H + 80,
                    transform: "translateX(-50%)",
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #FFE045 0%, #F5B800 60%, #CC8C00 100%)",
                    border: "2px solid #CC8800",
                    pointerEvents: "none",
                  }}
                />
              ))}

              <div
                style={{
                  position: "absolute",
                  bottom: GROUND_H - 20,
                  left: 0,
                  width: totalWidth,
                  height: 20,
                  background: "linear-gradient(to bottom, #4ABA41 0%, #3DA435 100%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: totalWidth,
                  height: GROUND_H - 20,
                  backgroundColor: "#C84B11",
                  backgroundImage: [
                    "repeating-linear-gradient(90deg, transparent 0px, transparent 39px, rgba(0,0,0,0.18) 39px, rgba(0,0,0,0.18) 40px)",
                    "repeating-linear-gradient(0deg, transparent 0px, transparent 19px, rgba(0,0,0,0.18) 19px, rgba(0,0,0,0.18) 20px)",
                  ].join(", "),
                }}
              />

              {pipeXs.map((x, i) => (
                <Pipe key={i} x={x} />
              ))}

              {experiences.map((exp, i) => (
                <div key={exp._id}>
                  <BrickPlatform centerX={centerXs[i]} />
                  <Connector x={centerXs[i]} top={badgeTop + 28} bottom={cardTop} />
                  <DateBadge
                    text={`${exp.startMonth || ""} ${exp.startYear || ""}`}
                    centerX={centerXs[i]}
                    y={badgeTop}
                  />
                  <ExperienceCard
                    exp={exp}
                    index={i}
                    centerX={centerXs[i]}
                    top={cardTop}
                    isEditing={isEditing}
                    onEdit={handleEdit}
                    onDelete={setDeleteTarget}
                  />
                </div>
              ))}
            </div>
          </div>

          {n > 1 && (
            <div
              style={{
                position: "absolute",
                bottom: -26,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 10,
                zIndex: 10,
              }}
            >
              {["left", "right"].map((dir) => (
                <Button
                  key={dir}
                  variant="ghost"
                  onClick={() => handleNav(dir)}
                  title={dir === "left" ? "Previous" : "Next"}
                  className="h-[52px] w-[52px] rounded-md border-[3px] border-[#5A2D00] p-0 hover:bg-transparent"
                  style={{
                    background: "linear-gradient(to bottom, #FFE045 0%, #F5A800 60%, #D48000 100%)",
                    boxShadow:
                      "inset 0 3px 0 rgba(255,255,200,0.55), 0 4px 0 #5A2D00, 0 5px 8px rgba(0,0,0,0.22)",
                  }}
                >
                  {dir === "left" ? (
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="h-3 w-3">
                      <path
                        d="M8 1L4 7L8 13"
                        stroke="#5A2D00"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="h-3 w-3">
                      <path
                        d="M6 1L10 7L6 13"
                        stroke="#5A2D00"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      <UnsavedChangesDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirmDiscard={confirmDelete}
        title="Delete Work Experience"
        description="Are you sure you want to delete this work experience? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
