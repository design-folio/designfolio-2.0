import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";

const GREETINGS = ["Hello!", "नमस्ते", "Bonjour", "こんにちは"];
const TYPE_MS = 68;
const DELETE_MS = 36;
const HOLD_MS = 860;
const BLUR_MS = 170;

/**
 * Typed multilingual greeting pill that follows the cursor once, then disappears.
 * Preview/public only — rendered by Designer/index.jsx guarded by `!isEditing`.
 */
export default function DesignerGreetingCursor() {
  const [pos, setPos] = useState({ x: -999, y: -999 });
  const [displayText, setDisplay] = useState("");
  const [blurring, setBlurring] = useState(false);
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);

  const charRef = useRef(0);
  const wordRef = useRef(0);
  const phaseRef = useRef("typing");
  const timerRef = useRef(null);

  useEffect(() => {
    document.body.style.cursor = "none";

    const onMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    window.addEventListener("mousemove", onMove);

    const schedule = (fn, ms) => {
      timerRef.current = setTimeout(fn, ms);
    };

    const tick = () => {
      const word = GREETINGS[wordRef.current];

      if (phaseRef.current === "typing") {
        if (charRef.current < word.length) {
          charRef.current++;
          setDisplay(word.slice(0, charRef.current));
          schedule(tick, TYPE_MS);
        } else {
          phaseRef.current = "holding";
          schedule(tick, HOLD_MS);
        }
      } else if (phaseRef.current === "holding") {
        if (wordRef.current === GREETINGS.length - 1) {
          schedule(() => {
            document.body.style.cursor = "";
            setDone(true);
          }, 420);
        } else {
          phaseRef.current = "deleting";
          schedule(tick, DELETE_MS);
        }
      } else if (phaseRef.current === "deleting") {
        if (charRef.current > 0) {
          charRef.current--;
          setDisplay(word.slice(0, charRef.current));
          schedule(tick, DELETE_MS);
        } else {
          phaseRef.current = "blurring";
          setBlurring(true);
          schedule(() => {
            wordRef.current++;
            charRef.current = 0;
            setDisplay("");
            setBlurring(false);
            phaseRef.current = "typing";
            schedule(tick, 90);
          }, BLUR_MS);
        }
      }
    };

    schedule(tick, 280);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener("mousemove", onMove);
      document.body.style.cursor = "";
    };
  }, []);

  if (done || typeof document === "undefined") return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[99999]">
      <AnimatePresence>
        {visible && (
          <motion.div
            key="greeting-badge"
            initial={{ opacity: 0, scale: 0.78, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute"
            style={{ left: pos.x + 22, top: pos.y + 18 }}
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 460, damping: 36, mass: 0.7 }}
              className="flex items-center overflow-hidden rounded-full"
              style={{
                padding: "13px 28px",
                background: "linear-gradient(170deg, #FFE047 0%, #F5C800 55%, #E0B000 100%)",
                border: "1px solid rgba(160, 120, 0, 0.25)",
                boxShadow:
                  "0 1px 0 rgba(255,240,120,0.9) inset, 0 -2px 0 rgba(140,100,0,0.3) inset, 0 6px 18px rgba(200,160,0,0.22), 0 2px 4px rgba(160,120,0,0.18)",
              }}
            >
              <motion.span
                animate={{
                  filter: blurring ? "blur(7px)" : "blur(0px)",
                  opacity: blurring ? 0.3 : 1,
                }}
                transition={{ duration: 0.16, ease: "easeInOut" }}
                className="flex items-center"
              >
                <span
                  className="font-inter comic-none inline-block min-w-[2px] text-[16px] font-bold tracking-[-0.01em] whitespace-nowrap text-[#3D2800]"
                  style={{ textShadow: "0 1px 0 rgba(255,240,100,0.5)" }}
                >
                  {displayText}
                </span>
                <motion.span
                  animate={{ opacity: [1, 1, 0, 0] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    ease: "linear",
                    times: [0, 0.45, 0.5, 0.95],
                  }}
                  className="relative top-[-0.5px] ml-[2px] inline-block h-[17px] w-[2px] rounded-[1px] bg-[rgba(100,65,0,0.6)] align-middle"
                />
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
