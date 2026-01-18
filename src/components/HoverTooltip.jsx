import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye } from "lucide-react";

export const HoverTooltip = ({
  isHovered,
  isDragging = false,
  isHoveringInteractive = false,
  text = "View Case Study",
  icon = <Eye className="w-4 h-4" />,
}) => {
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isHovered || isDragging || isHoveringInteractive) return;

    const handleMouseMove = (e) => {
      // Use viewport coordinates for fixed positioning
      setMousePos({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovered, isDragging, isHoveringInteractive]);

  const shouldShowTooltip = isHovered && !isDragging && !isHoveringInteractive;

  return (
    <>
      {mounted && createPortal(
        <AnimatePresence>
          {shouldShowTooltip && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed pointer-events-none z-[99999] flex items-center gap-2 bg-df-orange-color text-white px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap"
              style={{
                left: `${mousePos.x}px`,
                top: `${mousePos.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {icon}
              <span className="text-[10px] font-bold uppercase tracking-wider">{text}</span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
