import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
      className="group w-[408px] flex-none [transform:translateZ(0)] cursor-pointer rounded-3xl border border-[#E3E7ED] bg-white p-6 [-webkit-font-smoothing:antialiased] transition-all duration-500 ease-in-out [backface-visibility:hidden] hover:border-2 hover:border-[#FF553E]"
    >
      <div className="flex h-full flex-col justify-between">
        <div className="space-y-4">
          {imageSrc && (
            <img
              src={imageSrc}
              alt={title}
              className="h-[253.07px] w-full cursor-pointer rounded-2xl object-cover"
            />
          )}

          <h2 className="line-clamp-2 cursor-pointer text-left text-xl leading-tight font-semibold text-[#2F4858] [-webkit-font-smoothing:antialiased] [backface-visibility:hidden]">
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
          className="h-[85vh] w-[85vw] max-w-[85vw] overflow-hidden rounded-[20px] bg-white p-0"
          onClick={(e) => e.stopPropagation()}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <DialogDescription className="sr-only">{title}</DialogDescription>
          <div className="relative h-full w-full overflow-hidden rounded-[20px]">
            <iframe src={projectUrl} className="h-full w-full" title="Project Preview" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpotlightUsersDesktop;
