import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ImageUp } from "lucide-react";
import { _updateProject } from "@/network/post-request";
import { toast } from "react-toastify";
import queryClient from "@/network/queryClient";
import { useGlobalContext } from "@/context/globalContext";
import { cn } from "@/lib/utils";

export const ImageWithOverlayAndPicker = ({
  src,
  project,
  aspectRatio = "16/9",
  recommendedSize = "1600 × 900px",
  className,
}) => {
  const fileInputRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [source, setSource] = useState(src);
  const { userDetailsRefecth } = useGlobalContext();

  const handleClick = () => {
    fileInputRef.current.click();
  };

  function updateProjectImage(projectId, payload) {
    return _updateProject(projectId, payload).then((res) => {
      setSource(res?.data?.project?.thumbnail?.key);
      queryClient.setQueriesData(
        { queryKey: [`project-editor-${projectId}`] },
        (oldData) => ({
          ...oldData,
          project: {
            ...oldData.project,
            thumbnail: {
              ...oldData.project.thumbnail,
              key: res?.data?.project?.thumbnail?.key,
            },
          },
        })
      );
      userDetailsRefecth();
      return res;
    });
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const FILE_SIZE = 5 * 1024 * 1024;
    const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "image/gif"];

    if (!file) return;

    if (!SUPPORTED_FORMATS.includes(file.type)) {
      toast.error("Unsupported file format. Only jpg, jpeg, png, and gif files are allowed.");
      return;
    }

    if (file.size > FILE_SIZE) {
      toast.error("File size is too large. Maximum size is 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const payload = {
        thumbnail: {
          key: reader.result,
          originalName: file.name,
          extension: file.type,
        },
      };
      toast.promise(updateProjectImage(project._id, payload), {
        pending: { render() { return "Updating project image..."; }, icon: true },
        success: { render() { return "Project image was successfully updated."; }, icon: "🟢" },
        error: { render() { return "Failed to update project image."; }, icon: "🔴" },
      });
    };
    reader.readAsDataURL(file);
  };

  const aspectClass = {
    "16/9": "aspect-[16/9]",
    "4/3": "aspect-[4/3]",
    "1/1": "aspect-square",
    "3/2": "aspect-[3/2]",
  }[aspectRatio] ?? "aspect-[16/9]";

  return (
    <div className={cn("relative w-full overflow-hidden rounded-[20px]", aspectClass, className)}>
      <img
        src={source}
        alt="project image"
        className={`w-full h-full object-cover transition-opacity duration-100 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
        loading="lazy"
        fetchPriority="high"
        decoding="async"
        onLoad={() => setImageLoaded(true)}
      />
      {!imageLoaded && (
        <div className="absolute inset-0 bg-df-placeholder-color" />
      )}

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/jpg, image/gif"
      />

      <motion.div
        onClick={handleClick}
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 hover:opacity-100 cursor-pointer rounded-[20px]"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ImageUp className="w-6 h-6 text-white" />
        <p className="text-white text-sm font-medium">Change Image</p>
        <p className="text-white/60 text-xs">Recommended: {recommendedSize}</p>
      </motion.div>
    </div>
  );
};
