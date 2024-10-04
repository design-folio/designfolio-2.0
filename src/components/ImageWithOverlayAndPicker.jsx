import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { _updateProject } from "@/network/post-request";
import { toast } from "react-toastify";
import queryClient from "@/network/queryClient";
import { useGlobalContext } from "@/context/globalContext";

export const ImageWithOverlayAndPicker = ({ src, project }) => {
  // Reference to the hidden file input element
  const fileInputRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [source, setSource] = useState(src);
  const { userDetailsRefecth } = useGlobalContext();

  // Function to simulate click on file input
  const handleClick = () => {
    fileInputRef.current.click();
  };

  function updateProjectImage(projectId, payload) {
    return _updateProject(projectId, payload).then((res) => {
      setSource(res?.data?.project?.thumbnail?.key);
      queryClient.setQueriesData(
        { queryKey: [`project-editor-${projectId}`] },
        (oldData) => {
          return {
            ...oldData,
            project: {
              ...oldData.project,
              thumbnail: {
                ...oldData.project.thumbnail,
                key: res?.data?.project?.thumbnail?.key,
              },
            },
          };
        }
      );
      userDetailsRefecth();

      return res; // Ensure the promise resolves with the response for further chaining if necessary
    });
  }

  // Function to handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    const SUPPORTED_FORMATS = [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (!file) {
      return;
    }

    if (!SUPPORTED_FORMATS.includes(file.type)) {
      toast.error(
        "Unsupported file format. Only jpg, jpeg, png, and gif files are allowed."
      );
      return;
    }

    if (file.size > FILE_SIZE) {
      toast.error("File size is too large. Maximum size is 5MB.");
      return;
    }

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        const payload = {
          thumbnail: {
            key: base64Image,
            originalName: file.name,
            extension: file.type,
          },
        };

        toast.promise(updateProjectImage(project._id, payload), {
          pending: {
            render() {
              return "Updating project image...";
            },
            // Optional: Customize the pending state further (e.g., with an icon)
            icon: true,
          },
          success: {
            render({ data }) {
              // Assuming `data` contains the response from your update API
              // You can customize the message based on the response
              return `Project image was successfully updated.`;
            },
            // Optional: Additional customization for the success toast
            icon: "🟢",
          },
          error: {
            render({ data }) {
              // `data` contains the error thrown by the promise
              // You can render a custom error component or message based on the error
              return `Failed to update project image.`;
            },
            // Optional: Additional customization for the error toast
            icon: "🔴",
          },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full h-full mt-6 md:mt-8">
      <img
        src={source}
        alt="project image"
        className={`w-full h-full rounded-[20px] object-cover transition-opacity duration-100 mt-6 md:mt-8 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
        fetchPriority="high"
        decoding="async"
        onLoad={() => {
          setImageLoaded(true);
        }}
      />
      {!imageLoaded && (
        <div className="w-full h-full rounded-[20px] bg-df-placeholder-color absolute top-0 right-0" />
      )}

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg,image/jpg,image/gif"
      />
      <motion.div
        onClick={handleClick}
        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 rounded-[20px] hover:opacity-100 cursor-pointer"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-df-base-text-color text-lg">Change Image</p>
      </motion.div>
    </div>
  );
};
