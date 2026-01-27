import ImageUploadCard from "./ImageUploadCard";
import Text from "../text";

/**
 * Grid container for managing multiple images/stickers
 * Handles max limit enforcement and displays upload cards
 */
const ImageGrid = ({
  items = [],
  maxItems = 4,
  onUpload,
  onDelete,
  type = "image",
  label = "Photos",
  uploadingIndex = null,
}) => {
  // Ensure we always have an array of maxItems length (with nulls for empty slots)
  const normalizedItems = Array.from({ length: maxItems }, (_, i) => items[i] || null);

  return (
    <div className="space-y-4">
      <Text size="p-xs-uppercase" className="text-df-heading-color px-1">
        {label}
      </Text>
      <div className={`grid ${maxItems === 2 ? "grid-cols-2" : "grid-cols-2"} gap-3`}>
        {normalizedItems.map((item, index) => (
          <ImageUploadCard
            key={index}
            image={item}
            onUpload={onUpload}
            onDelete={onDelete}
            index={index}
            type={type}
            isUploading={uploadingIndex === index}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageGrid;
