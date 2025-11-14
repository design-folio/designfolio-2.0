/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";

const DfImage = ({ src, style, className, alt, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    if (img.complete) setImageLoaded(true);
    else img.onload = () => setImageLoaded(true);
  }, [src]);

  return (
    <div className={twMerge("relative w-full h-full", className)}>
      <img
        src={src}
        alt={alt}
        className={twMerge(
          "absolute inset-0 w-full h-full object-contain rounded-full transition-opacity duration-300",
          imageLoaded ? "opacity-100" : "opacity-0"
        )}
        loading="lazy"
        decoding="async"
        fetchpriority="high"
        style={style}
        onClick={onClick}
      />
      {!imageLoaded && (
        <div className="absolute inset-0 bg-placeholder-color rounded-full animate-pulse" />
      )}
    </div>
  );
};

export default DfImage;
