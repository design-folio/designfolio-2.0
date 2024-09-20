/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";

const DfImage = ({ src, style, className, alt, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    if (img.complete) {
      setImageLoaded(true);
    }
  }, [src]);

  return (
    <div className="relative">
      <img
        src={src}
        alt={alt}
        className={twMerge(
          "w-full h-full rounded-[24px] object-cover transition-opacity duration-100",
          className,
          imageLoaded ? "opacity-100" : "opacity-0"
        )}
        loading="lazy"
        fetchpriority="high"
        decoding="async"
        onLoad={() => setImageLoaded(true)}
        style={style}
        onClick={onClick}
      />
      {!imageLoaded && (
        <div className="w-full h-full bg-placeholder-color rounded-[24px] absolute top-0 right-0" />
      )}
    </div>
  );
};

export default DfImage;
