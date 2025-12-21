import imageCompression from "browser-image-compression";

// Constants from onboarding-old.jsx
export const FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const SUPPORTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
];

export const SUPPORTED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "gif",
];

/**
 * Validates image file type and size
 * @param {File} file - The file to validate
 * @returns {{ valid: boolean, error?: string }} - Validation result
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  // Check file size
  if (file.size > FILE_SIZE) {
    return {
      valid: false,
      error: "File size is too large. Maximum size is 5MB.",
    };
  }

  // Check MIME type
  const mimeValid = SUPPORTED_MIME_TYPES.includes(file.type);

  // Check file extension
  const extension = file.name?.split(".").pop()?.toLowerCase();
  const extensionValid =
    extension && SUPPORTED_EXTENSIONS.includes(extension);

  if (!mimeValid && !extensionValid) {
    return {
      valid: false,
      error:
        "Unsupported file format. Only jpg, jpeg, png and gif files are allowed.",
    };
  }

  return { valid: true };
};

/**
 * Compresses an image file using browser-image-compression
 * @param {File} file - The file to compress
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<File>} - Compressed file
 */
export const compressImage = async (file, onProgress) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    onProgress: onProgress || (() => { }),
    fileType: "image/webp",
    alwaysKeepResolution: false,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error("Image compression error:", error);
    throw error;
  }
};

/**
 * Handles image file selection with validation and optional compression
 * @param {File} file - The file to handle
 * @param {Object} options - Options object
 * @param {Function} options.onSuccess - Callback with compressed file
 * @param {Function} options.onError - Callback with error message
 * @param {Function} options.onProgress - Optional progress callback
 * @param {boolean} options.compress - Whether to compress (default: true if file > 2MB)
 */
export const handleImageFile = async (
  file,
  { onSuccess, onError, onProgress, compress: shouldCompress = null }
) => {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    onError?.(validation.error);
    return;
  }

  // Determine if compression is needed
  const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
  const needsCompression =
    shouldCompress !== null ? shouldCompress : file.size > maxSizeInBytes;

  try {
    if (needsCompression) {
      const compressedFile = await compressImage(file, onProgress);
      onSuccess?.(compressedFile);
    } else {
      onSuccess?.(file);
    }
  } catch (error) {
    onError?.("Failed to process image. Please try again.");
  }
};

/**
 * Yup validation schema for image files (matching onboarding-old.jsx)
 */
export const imageValidationSchema = {
  fileSize: {
    test: "fileSize",
    message: "File size is too large. Maximum size is 5MB.",
    testFn: (value) => !value || value.size <= FILE_SIZE,
  },
  fileType: {
    test: "fileType",
    message:
      "Unsupported file format. Only jpg, jpeg, png and gif files are allowed.",
    testFn: (value) => {
      if (!value) return true;

      const mimeValid = SUPPORTED_MIME_TYPES.includes(value.type);

      const extension = value.name?.split(".").pop()?.toLowerCase();
      const extensionValid =
        extension && SUPPORTED_EXTENSIONS.includes(extension);

      return mimeValid || extensionValid;
    },
  },
};

