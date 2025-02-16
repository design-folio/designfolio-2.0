import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import PreviewIcon from "../../public/assets/svgs/previewIcon.svg";
import Button from "./button";

const SpotlightUsersDesktop = ({ title, projectUrl, imageSrc, onHover }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCardClick = (e) => {
    if (e.target === e.currentTarget || e.currentTarget.contains(e.target)) {
      setIsOpen(true);
    }
  };

  const handleMouseEnter = () => {
    if (!isOpen) {
      onHover(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isOpen) {
      onHover(false);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="flex-none w-[408px] bg-white rounded-3xl p-6 transition-all duration-500 ease-in-out border-2 border-transparent hover:border-[#FF553E] cursor-pointer group [backface-visibility:hidden] [-webkit-font-smoothing:antialiased] [transform:translateZ(0)]"
    >
      <div className="h-full flex flex-col justify-between">
        <div className="space-y-4 ">
          {imageSrc && (
            <img
              src={imageSrc}
              alt={title}
              className="w-full rounded-2xl cursor-pointer h-[253.07px] object-cover"
            />
          )}

          <h2 className="text-[#2F4858] text-left cursor-pointer text-xl font-semibold leading-tight [backface-visibility:hidden] [-webkit-font-smoothing:antialiased] line-clamp-2">
            {title}
          </h2>
        </div>

        <Button
          text={"View project"}
          customClass="w-full mt-4 text-[#293547] bg-[#fff] border-[#E0E6EB] group-hover:!bg-[#293547] group-hover:!text-[#fff] transition-all duration-500 ease-out"
          icon={<PreviewIcon className="cursor-pointer" />}
          animation
          iconPosition="right"
        />
      </div>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            onHover(false);
          }
        }}
      >
        <DialogContent
          className="max-w-[85vw] w-[85vw] h-[85vh] p-0 overflow-hidden rounded-[20px] bg-white"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
          <div className="relative w-full h-full rounded-[20px] overflow-hidden">
            <iframe
              src={projectUrl}
              className="w-full h-full"
              title="Project Preview"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpotlightUsersDesktop;
