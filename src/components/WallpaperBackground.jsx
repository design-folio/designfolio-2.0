import React, { useEffect, useState, useRef } from "react";
import { BACKGROUND_MODE, hexToRgbString } from "@/lib/wallpaper";
import { useImageColor } from "@/hooks/useImageColor";

// Default height (px) of the header-only wallpaper band before it fades into the page bg.
const HEADER_BAND_HEIGHT = 560;

// SVG fractal-noise data URI used for the grain overlay (shared by image + colour backgrounds).
const GRAIN_IMAGE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")";

export default function WallpaperBackground({
  wallpaperUrl,
  backgroundColor = null,
  effects = null,
  mode = BACKGROUND_MODE.FULL_PAGE,
  headerHeight = HEADER_BAND_HEIGHT,
  suppressHydrationWarning = true,
  ...props
}) {
  const isHeaderMode = mode === BACKGROUND_MODE.HEADER;
  const isColor = !!backgroundColor;
  const hasBackground = !!wallpaperUrl || isColor;

  // Header-mode bottom glow: derive from the image's dominant colour, or the solid colour itself.
  const imageGlow = useImageColor(isHeaderMode && !isColor ? wallpaperUrl : "");
  const glowColor = isColor ? hexToRgbString(backgroundColor) : imageGlow;

  // Blur/motion only make sense on an image. Grain reads on a solid colour too, so it applies
  // whenever grainIntensity > 0 (the colour picker exposes grain only).
  const grainActive = effects?.grainIntensity > 0 && (isColor || effects?.effectType === "grain");
  const blurActive = !isColor && effects?.effectType === "blur" && effects?.blur > 0;
  const motionActive = !isColor && !!effects?.motion;

  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [previousWallpaperUrl, setPreviousWallpaperUrl] = useState(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const rafRef = useRef(null);
  const previousWallpaperUrlRef = useRef(null); // Track actual previous URL

  // Add/remove has-wallpaper class on body so CSS can make #__next transparent.
  // Only in full-page mode — header mode keeps the page bg solid (band sits on top of it).
  useEffect(() => {
    if (hasBackground && !isHeaderMode) {
      document.body.classList.add("has-wallpaper");
    } else {
      document.body.classList.remove("has-wallpaper");
    }
    return () => document.body.classList.remove("has-wallpaper");
  }, [hasBackground, isHeaderMode]);

  // Initialize ref on mount with current wallpaper
  useEffect(() => {
    if (wallpaperUrl && !previousWallpaperUrlRef.current) {
      previousWallpaperUrlRef.current = wallpaperUrl;
    }
  }, [wallpaperUrl]);

  // Track wallpaper changes for smooth transitions (image → image only)
  useEffect(() => {
    // Capture the previous URL BEFORE checking for changes
    const currentPreviousUrl = previousWallpaperUrlRef.current;

    let fadeOutTimer;
    let cleanupTimer;

    // Only animate if the wallpaper actually changed and we have a previous URL
    if (currentPreviousUrl && wallpaperUrl && currentPreviousUrl !== wallpaperUrl) {
      setShouldAnimate(true);
      setPreviousWallpaperUrl(currentPreviousUrl);
      fadeOutTimer = setTimeout(() => {
        setShouldAnimate(false);
      }, 400); // allow opacity transition
      cleanupTimer = setTimeout(() => {
        setPreviousWallpaperUrl(null);
      }, 600); // remove after fade-out completes
    } else {
      setShouldAnimate(false);
    }

    // IMPORTANT: Update the ref with the current wallpaper AFTER we've captured it above
    // This ensures the next change will have the correct previous wallpaper
    if (wallpaperUrl) {
      previousWallpaperUrlRef.current = wallpaperUrl;
    }

    return () => {
      if (fadeOutTimer) clearTimeout(fadeOutTimer);
      if (cleanupTimer) clearTimeout(cleanupTimer);
    };
  }, [wallpaperUrl]);

  // Handle scroll offset for motion effect (simple scale on scroll, no parallax)
  useEffect(() => {
    if (!motionActive) {
      queueMicrotask(() => setScrollOffset(0));
      return;
    }

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(() => {
        setScrollOffset(window.scrollY);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [motionActive]);

  if (!hasBackground) {
    return null;
  }

  const grainIntensity = effects?.grainIntensity ?? 0;
  const blurFilter = blurActive ? `blur(${effects.blur}px)` : "none";
  const motionTransform = motionActive ? `scale(${1.05 + scrollOffset * 0.00008})` : "none";

  // The base fill: either the wallpaper image or the solid colour.
  const fillStyle = isColor
    ? { backgroundColor }
    : {
        backgroundImage: `url(${wallpaperUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };

  const grainOverlay = grainActive ? (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 2,
        opacity: grainIntensity / 100,
        backgroundImage: GRAIN_IMAGE,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    />
  ) : null;

  // Build className (only wallpaper-transition, matching Dashboard)
  const className = shouldAnimate ? "wallpaper-transition" : "";

  // Header-only mode: an absolute band at the top of the page that fades into the page bg.
  // Sits above the solid page background (which the page wrapper keeps opaque) and below the
  // template content (which the wrapper stacks at z-10).
  if (isHeaderMode) {
    return (
      <>
        <div
          {...props}
          data-wallpaper-background
          data-wallpaper-mode="header"
          data-wallpaper-loaded="true"
          suppressHydrationWarning={suppressHydrationWarning}
          className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden"
          style={{ height: headerHeight, zIndex: 0 }}
        >
          <div
            className={className}
            style={{
              position: "absolute",
              inset: 0,
              ...fillStyle,
              filter: blurFilter,
              transform: motionTransform,
              transition: motionActive ? "transform 0.1s ease-out" : undefined,
            }}
          >
            {grainOverlay}
          </div>
          {/* Fade the band into the page background at the bottom */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, transparent 0%, transparent 55%, var(--background) 100%)",
            }}
          />
        </div>

        {/* Bottom glow — dominant background colour bleeding up from the very end of the page */}
        {glowColor && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{
              height: 500,
              zIndex: 0,
              background: `radial-gradient(ellipse 80% 60% at 50% 100%, rgba(${glowColor},0.35) 0%, rgba(${glowColor},0.12) 45%, transparent 100%)`,
              transition: "background 1.2s ease",
            }}
          />
        )}
      </>
    );
  }

  // Full-page mode: fixed full-viewport fill behind everything (page is transparent).
  const style = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    zIndex: -1,
    pointerEvents: "none",
    ...fillStyle,
    filter: blurActive ? blurFilter : undefined,
    transform: motionActive ? motionTransform : undefined,
    transition: motionActive ? "transform 0.1s ease-out" : undefined,
  };

  const previousWallpaperToShow = previousWallpaperUrl;

  return (
    <>
      {/* Previous wallpaper layer (stays visible during transition — image → image only) */}
      {!isColor && previousWallpaperToShow && previousWallpaperToShow !== wallpaperUrl && (
        <div
          className="fixed inset-0"
          style={{
            backgroundImage: `url(${previousWallpaperToShow})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: -2, // keep previous layer below the current layer
            opacity: shouldAnimate ? 1 : 0,
            filter: blurFilter,
            transform: motionTransform,
            transition: "opacity 0.35s ease-in-out, transform 0.1s ease-out",
          }}
        />
      )}

      {/* Current background layer with smooth fade-in */}
      <div
        {...props}
        data-wallpaper-background
        data-wallpaper-loaded="true"
        className={className}
        suppressHydrationWarning={suppressHydrationWarning}
        style={style}
      >
        {grainOverlay}
      </div>
    </>
  );
}
