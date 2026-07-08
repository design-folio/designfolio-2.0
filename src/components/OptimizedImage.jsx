import NextImage from "next/image";

// Hosts we can safely route through the Next.js image optimizer (must match
// `images.remotePatterns` in next.config). Anything else falls back to a plain
// <img> so an unexpected host can never break rendering.
const OPTIMIZABLE_HOST = /(^|\.)amazonaws\.com$/i;

function canOptimize(src) {
  if (!src || typeof src !== "string") return false;
  if (src.startsWith("/")) return true; // local/static assets are always optimizable
  try {
    return OPTIMIZABLE_HOST.test(new URL(src).hostname);
  } catch {
    return false;
  }
}

/**
 * Drop-in replacement for <img> that serves a resized image via next/image for
 * known hosts. Prevents multi-hundred-MB decoded bitmaps from oversized S3
 * originals (e.g. a 16640×9544 upload) by letting Next resize on demand.
 *
 * Use `fill` (parent must be positioned + sized) to mirror the previous
 * `h-full w-full object-cover` layout. Pass `sizes` for correct resolution.
 */
export default function OptimizedImage({
  src,
  alt = "",
  className,
  sizes,
  fill = true,
  width,
  height,
  quality = 75,
  priority = false,
  ...rest
}) {
  if (!canOptimize(src)) {
    return (
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={className}
        {...rest}
      />
    );
  }

  if (fill) {
    return (
      <NextImage
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        priority={priority}
        className={className}
        {...rest}
      />
    );
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      quality={quality}
      priority={priority}
      className={className}
      {...rest}
    />
  );
}
