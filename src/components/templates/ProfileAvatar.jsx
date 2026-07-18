import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * ProfileAvatar
 *
 * Shared portfolio avatar with a 3D mouse-follow tilt, an idle float, a glass-rim
 * highlight and a shimmer sweep. Every effect is a prop and defaults to on, so a
 * template can dial the treatment down without forking the component.
 *
 * Size is applied as an inline width/height (a number, in px) rather than a Tailwind
 * class so arbitrary per-template sizes work without relying on JIT-generated classes.
 */
function ProfileAvatar({
  src,
  alt = "Profile",
  fallback,
  size = 120,
  radius = "rounded-2xl",
  tilt = true,
  idleFloat = true,
  shimmer = true,
  glassRim = true,
  shadow = true,
  maxTilt = 12,
  className,
  innerClassName,
  imgClassName,
  imgStyle,
  fallbackClassName,
}) {
  const wrapperRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // SSR-safe: default to desktop, then resolve on mount so the tilt only runs
  // where a pointer actually exists.
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const tiltEnabled = tilt && !isMobile;

  const idleAnimate = useMemo(
    () =>
      idleFloat
        ? { rotateX: [0, 8, 0, -8, 0], rotateY: [0, -10, 0, 10, 0], scale: 1 }
        : { rotateX: 0, rotateY: 0, scale: 1 },
    [idleFloat]
  );
  const idleTransition = useMemo(() => ({ duration: 4, repeat: Infinity, ease: "easeInOut" }), []);

  const handleMouseMove = (e) => {
    if (!tiltEnabled || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -maxTilt;
    const y = ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * maxTilt;
    setRotation({ x, y });
    setHovered(true);
  };

  const handleMouseLeave = () => {
    if (!tiltEnabled) return;
    setRotation({ x: 0, y: 0 });
    setHovered(false);
  };

  const isInteracting = hovered && tiltEnabled;

  return (
    <div
      ref={wrapperRef}
      className={cn("shrink-0", className)}
      style={{ width: size, height: size }}
      onMouseMove={tiltEnabled ? handleMouseMove : undefined}
      onMouseLeave={tiltEnabled ? handleMouseLeave : undefined}
    >
      <motion.div
        className={cn(
          "h-full w-full cursor-pointer",
          radius,
          shadow && "shadow-lg",
          innerClassName
        )}
        // Perspective is baked into this element's own transform (not the parent's
        // `perspective` property) so the 3D tilt survives ancestors that flatten
        // their subtree — e.g. FloatingPageContainer's `transform: translateZ(0)`
        // in the builder.
        style={{ transformPerspective: 1000 }}
        animate={
          isInteracting ? { rotateX: rotation.x, rotateY: rotation.y, scale: 1.05 } : idleAnimate
        }
        transition={
          isInteracting ? { type: "spring", stiffness: 400, damping: 25 } : idleTransition
        }
      >
        {/* Inner clip wrapper — keeps overlays masked to the rounded corners even
            while the parent carries a 3D transform. */}
        <div className={cn("relative h-full w-full overflow-hidden", radius)}>
          <Avatar className={cn("h-full w-full rounded-none")}>
            <AvatarImage
              src={src}
              alt={alt}
              className={cn("object-cover", imgClassName)}
              style={imgStyle}
            />
            {fallback != null && (
              <AvatarFallback className={cn("rounded-none", fallbackClassName)}>
                {fallback}
              </AvatarFallback>
            )}
          </Avatar>

          {glassRim && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)",
                boxShadow:
                  "inset 0 1px 1px rgba(255,255,255,0.55), inset 0 -1px 1px rgba(0,0,0,0.08)",
              }}
            />
          )}

          {shimmer && (
            <motion.div
              className="pointer-events-none absolute inset-y-0 w-1/2"
              style={{
                background:
                  "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.5) 50%, transparent 80%)",
              }}
              animate={{ x: ["-100%", "280%"] }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default memo(ProfileAvatar);
