import { useRef, useEffect, useCallback } from "react";

// Two flight paths (designer-fly-right-one/two) and four sprite instances
// (designer-bird-one..four, staggered durations/delays), all defined in
// styles/templates/designer.css — ports the reference 1:1.
//
// `backwards` fill-mode matters here: birds 3 & 4 start with a long positive delay
// (a staggered "second wave"). Without it, a delayed CSS animation renders the
// element at its plain (non-animated) inline position during the wait — which is
// only `left: -3%`, not fully off-screen — so those two birds sat visibly parked at
// the left edge, wings still flapping, until their delay elapsed. `backwards` makes
// them adopt the animation's first keyframe (well off-screen) for the whole delay.
const BIRD_CONFIGS = [
  {
    top: "8%",
    animation: "designer-fly-right-one 15s linear 0s infinite backwards",
    sprite: "designer-bird-one",
  },
  {
    top: "14%",
    animation: "designer-fly-right-two 16s linear 1s infinite backwards",
    sprite: "designer-bird-two",
  },
  {
    top: "22%",
    animation: "designer-fly-right-one 14.6s linear 9.5s infinite backwards",
    sprite: "designer-bird-three",
  },
  {
    top: "30%",
    animation: "designer-fly-right-two 16s linear 10.25s infinite backwards",
    sprite: "designer-bird-four",
  },
];

const REPEL_RADIUS = 130; // px — cursor distance that triggers scatter
const MAX_SCATTER = 70; // px — maximum push at zero distance

/** Cursor-repel flying birds — decorative hero background, no data dependency. */
export default function DesignerBirds() {
  const wrapRefs = useRef([null, null, null, null]);
  const fleeing = useRef([false, false, false, false]);

  const onMouseMove = useCallback((e) => {
    const mx = e.clientX;
    const my = e.clientY;

    wrapRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const bx = rect.left + rect.width / 2;
      const by = rect.top + rect.height / 2;
      const dx = bx - mx;
      const dy = by - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < REPEL_RADIUS) {
        const strength = (1 - dist / REPEL_RADIUS) ** 1.4;
        const push = strength * MAX_SCATTER;
        const nx = dist > 0 ? dx / dist : 0;
        const ny = dist > 0 ? dy / dist : -1;
        fleeing.current[i] = true;
        el.style.transition = "transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        el.style.transform = `translate(${nx * push}px, ${ny * push}px)`;
      } else if (fleeing.current[i]) {
        fleeing.current[i] = false;
        el.style.transition = "transform 2.0s cubic-bezier(0.22, 1, 0.36, 1)";
        el.style.transform = "";
      }
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {BIRD_CONFIGS.map((cfg, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: cfg.top,
            left: "-3%",
            willChange: "transform",
            animation: cfg.animation,
          }}
        >
          <div ref={(el) => (wrapRefs.current[i] = el)}>
            <div className={`designer-bird designer-bird-day ${cfg.sprite}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
