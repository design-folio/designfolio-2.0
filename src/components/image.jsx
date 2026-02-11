/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";

const DfImage = ({ src, style, className, alt, onClick }) => {
  const [mounted, setMounted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !src) return;
    const img = new Image();
    img.src = src;
    if (img.complete) setImageLoaded(true);
    else img.onload = () => setImageLoaded(true);
  }, [mounted, src]);

  const hasPointerCursor = className?.includes("cursor-pointer");

  return (
    <div className={twMerge("relative w-full h-full", className)}>
      {mounted ? (
        <>
          <img
            src={src}
            alt={alt ?? ""}
            className={twMerge(
              "absolute inset-0 w-full h-full object-cover rounded-2xl transition-opacity duration-300",
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
            <div className="absolute inset-0 bg-placeholder-color rounded-2xl animate-pulse" aria-hidden />
          )}
        </>
      ) : (
        <div className="absolute inset-0 bg-placeholder-color rounded-2xl animate-pulse" aria-hidden />
      )}
    </div>
  );
};

export default DfImage;
