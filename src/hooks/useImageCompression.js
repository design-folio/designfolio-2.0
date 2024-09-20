import { useState } from "react";
import imageCompression from "browser-image-compression";

function useImageCompression() {
  const [compressedImage, setCompressedImage] = useState(null);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [error, setError] = useState(null);

  const compress = async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      onProgress: (percentage) => setCompressionProgress(percentage),
      fileType: "image/webp",
      alwaysKeepResolution: false,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setCompressedImage(compressedFile);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err);
      setCompressedImage(null); // Reset in case of an error
    }
  };

  return { compress, compressedImage, compressionProgress, error };
}

export default useImageCompression;
