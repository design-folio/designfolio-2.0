import { useState, useRef } from "react";
import { Pencil, Trash2, Plus, Upload } from "lucide-react";
import Button from "../button";

/**
 * Reusable component for individual image upload cards
 * Handles display, upload, edit, and delete actions for pegboard images/stickers
 */
const ImageUploadCard = ({ 
  image, 
  onUpload, 
  onDelete, 
  index, 
  type = "image",
  isUploading = false 
}) => {
  const fileInputRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size exceeds 5MB. Please upload a smaller image.");
      return;
    }

    onUpload(file, index);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(index);
  };

  const handleClick = () => {
    if (!image) {
      fileInputRef.current?.click();
    }
  };

  // Check if image is default or custom
  const isDefaultImage = image?.isDefault || image?.src?.startsWith("/assets/portraits/");

  return (
    <div
      className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${
        image
          ? "border-border bg-muted/30"
          : "border-dashed border-border bg-muted/20 cursor-pointer hover:bg-muted/30"
      }`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {image ? (
        <>
          {/* Image Preview */}
          <img
            src={image.src}
            alt={`${type} ${index + 1}`}
            className={`w-full h-full object-cover ${
              type === "sticker" ? "object-contain p-2" : ""
            }`}
          />

          {/* Hover Overlay with Actions */}
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center gap-2 ${
              isHovering ? "opacity-100" : "opacity-0"
            }`}
          >
            <Button
              type="secondary"
              customClass="!p-2 !h-8 !w-8 bg-white/20 hover:bg-white/30 border-0"
              icon={<Pencil className="w-4 h-4 text-white" />}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            />
            <Button
              type="secondary"
              customClass="!p-2 !h-8 !w-8 bg-white/20 hover:bg-white/30 border-0"
              icon={<Trash2 className="w-4 h-4 text-white" />}
              onClick={handleDelete}
            />
          </div>

          {/* Default Badge */}
          {isDefaultImage && (
            <div className="absolute top-2 left-2 bg-muted/90 text-foreground px-2 py-0.5 rounded text-[10px] font-medium">
              Default
            </div>
          )}
        </>
      ) : (
        <>
          {/* Upload Placeholder */}
          <div className="flex flex-col items-center justify-center h-full gap-2">
            {isUploading ? (
              <>
                <Upload className="w-6 h-6 text-foreground/40 animate-pulse" />
                <span className="text-xs text-foreground/40 font-medium">
                  Uploading...
                </span>
              </>
            ) : (
              <>
                <Plus className="w-6 h-6 text-foreground/40" />
                <span className="text-xs text-foreground/40 font-medium">
                  Add {type === "sticker" ? "Sticker" : "Photo"}
                </span>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageUploadCard;
