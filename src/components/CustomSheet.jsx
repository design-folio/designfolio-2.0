import React, { useEffect, useLayoutEffect, useState } from 'react';
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

  // Push layout by adding margin to body
  useEffect(() => {
    const body = document.body;
    body.style.transition = 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

    if (open) {
      body.style.marginRight = width;
    } else {
      body.style.marginRight = '0px';
    }

    return () => {
      body.style.marginRight = '0px';
      body.style.transition = '';
    };
  }, [open, width]);

  // Simple: disable page scroll when sheet is open
  // Re-apply when template changes (template prop tracks template changes)
  // Use useLayoutEffect to run synchronously before paint
  useLayoutEffect(() => {
    const body = document.body;

    if (open) {
      // Always set to hidden when open, regardless of current value
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = '';
    }
  }, [open, template]);

  // Additional safeguard: ensure overflow stays hidden during re-renders when open
  useEffect(() => {
    if (!open) return;

    const body = document.body;
    // Double-check after a brief delay to catch any code that removes it
    const timeout = setTimeout(() => {
      if (body.style.overflow !== 'hidden') {
        body.style.overflow = 'hidden';
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [open, template]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Overlay - Click to close (Only if showOverlay is true) */}
      {showOverlay && (
        <div
          className={cn(
            "fixed inset-0 bg-black/20 z-40 transition-opacity duration-300",
            open ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          )}
          onClick={onClose}
        />
      )}

      {/* Main Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full bg-white dark:bg-background border-l border-border transition-transform duration-300 z-50 shadow-xl",
          open ? "translate-x-0" : "translate-x-full",
          className
        )}
        style={{ width }}
      >
        {children}
      </div>
    </>,
    document.body
  );
};

export default CustomSheet;
