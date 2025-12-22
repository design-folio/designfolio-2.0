import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from "@/lib/utils";

const CustomSheet = ({
  open,
  onClose,
  children,
  width = '320px',
  className = "",
  showOverlay = false,
  template = null
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  if (!mounted) return null;

  return createPortal(
    <>
      {/* Overlay - Visual only, no click to close */}
      {showOverlay && (
        <div
          className={cn(
            "fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 pointer-events-none",
            open ? "opacity-100 visible" : "opacity-0 invisible"
          )}
        />
      )}

      <div
        className={cn(
          "fixed right-0 top-0 h-full bg-white dark:bg-background border-l border-border z-50 shadow-xl",
          className
        )}
        style={{
          width,
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
          pointerEvents: open ? 'auto' : 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>,
    document.body
  );
};

export default CustomSheet;
