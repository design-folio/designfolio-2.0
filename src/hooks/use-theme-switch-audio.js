import { flushSync } from "react-dom";
import { TEMPLATE_IDS } from "@/lib/templates";

export function playThemeSwitchSound() {
  if (typeof window === "undefined") return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.setValueAtTime(150, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc1.start(now);
    osc1.stop(now + 0.1);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.setValueAtTime(180, now + 0.12);
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.22);
  } catch {
    // Silently fail (e.g. autoplay policy, no AudioContext)
  }
}

export function runThemeTransition(originElement, onToggle, options = {}) {
  const { playSound = false, ripple = false } = options;

  if (playSound) playThemeSwitchSound();

  if (
    ripple &&
    typeof document !== "undefined" &&
    document.startViewTransition
  ) {
    document
      .startViewTransition(() => {
        flushSync(() => onToggle());
      })
      .ready.then(() => {
        const el = originElement;
        const {
          left = 0,
          top = 0,
          width = 0,
          height = 0,
        } = el ? el.getBoundingClientRect() : {};
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const maxDistance = Math.hypot(
          Math.max(centerX, window.innerWidth - centerX),
          Math.max(centerY, window.innerHeight - centerY),
        );
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${centerX}px ${centerY}px)`,
              `circle(${maxDistance}px at ${centerX}px ${centerY}px)`,
            ],
          },
          {
            duration: 700,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      });
  } else {
    onToggle();
  }
}

export const TEMPLATES_WITH_THEME_SWITCH_EFFECT = [
  TEMPLATE_IDS.CANVAS,
  TEMPLATE_IDS.MONO,
  TEMPLATE_IDS.SPOTLIGHT,
  TEMPLATE_IDS.PROFESSIONAL,
  TEMPLATE_IDS.CHATFOLIO,
];

export function hasThemeSwitchEffect(templateId) {
  return TEMPLATES_WITH_THEME_SWITCH_EFFECT.includes(templateId);
}
