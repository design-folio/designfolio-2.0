import { _uploadImage } from "@/network/post-request";
import { compressImageForUpload } from "@/lib/compressImage";

/**
 * Upload a File to S3 via the existing /user/editorjs endpoint.

 * Returns { key: s3Key, url: signedUrl }.
 */
export async function uploadSectionImage(file) {
  const { blob, name, type } = await compressImageForUpload(file);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = async (e) => {
      try {
        const res = await _uploadImage({
          file: {
            key: e.target.result, // base64 dataURL — backend detects and uploads to S3
            originalName: name,
            extension: type,
          },
        });
        resolve(res.data.file); // { key: s3Key, url: signedUrl }
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsDataURL(blob);
  });
}
