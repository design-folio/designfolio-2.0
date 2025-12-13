import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from "@/lib/utils";

const CustomSheet = ({ 
  open, 
  onClose, 
  children, 
  width = '320px', 
  className = "",
  showOverlay = false 
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
          "fixed right-0 top-0 h-full bg-background border-l border-border transition-transform duration-300 z-50 shadow-xl",
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
