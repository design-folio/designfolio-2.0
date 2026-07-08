import imageCompression from "browser-image-compression";

// Animated / vector formats must not be rasterized — upload them untouched.
const PASSTHROUGH_TYPES = new Set(["image/gif", "image/svg+xml"]);

// Cap the longest edge so every stored original stays small enough for Vercel's
// image optimizer to resize. Very large sources (e.g. a 16640×9544 screenshot)
// exceed Vercel's serverless optimizer limits, so `/_next/image` gives up and
// serves the raw multi-MB file — which defeats next/image entirely. 1920px is
// plenty for retina at our widest container, and matches useImageCompression.
const DEFAULT_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/webp",
  alwaysKeepResolution: false,
};

/**
 * Resize + compress an image File to webp before upload.
 *
 * Returns `{ blob, name, type }`. `name` carries a `.webp` extension because the
 * backend derives the S3 Content-Type from the file name (`mime.lookup`), so the
 * name must match the bytes. Falls back to the original file for gif/svg, for
 * non-images, or if compression throws.
 *
 * @param {File|Blob} file
 * @param {object} [options] — overrides merged onto the defaults.
 */
export async function compressImageForUpload(file, options = {}) {
  if (!file?.type?.startsWith("image/") || PASSTHROUGH_TYPES.has(file.type)) {
    return { blob: file, name: file?.name, type: file?.type };
  }

  try {
    const compressed = await imageCompression(file, { ...DEFAULT_OPTIONS, ...options });
    const baseName = (file.name || "image").replace(/\.[^./\\]+$/, "");
    return { blob: compressed, name: `${baseName}.webp`, type: "image/webp" };
  } catch {
    return { blob: file, name: file?.name, type: file?.type };
  }
}
