import { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";

const DfImage = ({ src, style, className, alt, onClick }) => {
  const [mounted, setMounted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  useEffect(() => {
    if (!mounted || !src) return;
    const img = new Image();
    img.src = src;
    if (img.complete) queueMicrotask(() => setImageLoaded(true));
    else img.onload = () => setImageLoaded(true);
  }, [mounted, src]);

  const hasPointerCursor = className?.includes("cursor-pointer");

  return (
    <div className={twMerge("relative h-full w-full", className)}>
      {mounted ? (
        <>
          <img
            src={src}
            alt={alt ?? ""}
            className={twMerge(
              "absolute inset-0 h-full w-full rounded-full object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0",
              hasPointerCursor && "cursor-pointer"
            )}
            loading="lazy"
            decoding="async"
            fetchpriority="high"
            style={style}
            onClick={onClick}
          />
          {!imageLoaded && (
            <div
              className="bg-placeholder-color absolute inset-0 animate-pulse rounded-full"
              aria-hidden
            />
          )}
        </>
      ) : (
        <div
          className="bg-placeholder-color absolute inset-0 animate-pulse rounded-full"
          aria-hidden
        />
      )}
    </div>
  );
};

export default DfImage;
