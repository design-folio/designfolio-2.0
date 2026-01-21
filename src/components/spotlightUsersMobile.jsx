import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const SpotlightUsersMobile = ({ projects }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleNext = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % projects.length);
      setIsAnimating(false);
    }, 300);
  };

  const handlePrev = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
      setIsAnimating(false);
    }, 300);
  };

  const currentProject = projects[currentIndex];

  return (
    <div className="md:hidden w-full px-6 mt-6 ">
      <div
        onClick={() => setIsOpen(true)}
        className={`w-full border border-[#E3E7ED] bg-white rounded-3xl p-6 transition-opacity duration-300 cursor-pointer ${
          isAnimating ? "opacity-0" : "opacity-100"
        }`}
      >
        {currentProject.imageSrc && (
          <img
            src={currentProject.imageSrc}
            alt={currentProject.title}
            className="w-full rounded-2xl mb-4"
          />
        )}

        <h2 className="text-[#2F4858] text-xl font-semibold leading-tight mb-4 line-clamp-2">
          {currentProject.title}
        </h2>

        <div className="w-full mt-4 px-4 py-3 bg-white border-2 border-[#2F4858] rounded-xl text-[#2F4858] font-medium flex items-center justify-center gap-2 transition-all duration-300 group-hover:bg-[#2F4858] group-hover:text-white">
          View project
          <ArrowUpRight className="w-5 h-5" />
        </div>
      </div>

      <div className="flex justify-center gap-8 mt-6">
        <button
          onClick={handlePrev}
          className="bg-white h-10 w-10 rounded-full flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
          disabled={isAnimating}
        >
          <ChevronLeft className="w-5 h-5 text-[#2F4858]" />
        </button>
        <button
          onClick={handleNext}
          className="bg-white h-10 w-10 rounded-full flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
          disabled={isAnimating}
        >
          <ChevronRight className="w-5 h-5 text-[#2F4858]" />
        </button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[85vw] w-[85vw] h-[85vh] p-0 overflow-hidden rounded-[20px] bg-white">
          <DialogTitle className="sr-only">{currentProject.title}</DialogTitle>
          <DialogDescription className="sr-only">
            {currentProject.title}
          </DialogDescription>
          <div className="relative w-full h-full rounded-[20px] overflow-hidden">
            <iframe
              src={currentProject.projectUrl}
              className="w-full h-full"
              title="Project Preview"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpotlightUsersMobile;
