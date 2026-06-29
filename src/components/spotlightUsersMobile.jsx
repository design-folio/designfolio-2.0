import { useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

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
    <div className="mt-6 w-full px-6 md:hidden">
      <div
        onClick={() => setIsOpen(true)}
        className={`w-full cursor-pointer rounded-3xl border border-[#E3E7ED] bg-white p-6 transition-opacity duration-300 ${
          isAnimating ? "opacity-0" : "opacity-100"
        }`}
      >
        {currentProject.imageSrc && (
          <img
            src={currentProject.imageSrc}
            alt={currentProject.title}
            className="mb-4 w-full rounded-2xl"
          />
        )}

        <h2 className="mb-4 line-clamp-2 text-xl leading-tight font-semibold text-[#2F4858]">
          {currentProject.title}
        </h2>

        <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#2F4858] bg-white px-4 py-3 font-medium text-[#2F4858] transition-all duration-300 group-hover:bg-[#2F4858] group-hover:text-white">
          View project
          <ArrowUpRight className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-8">
        <button
          onClick={handlePrev}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm transition-colors hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50"
          disabled={isAnimating}
        >
          <ChevronLeft className="h-5 w-5 text-[#2F4858]" />
        </button>
        <button
          onClick={handleNext}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 bg-white shadow-sm transition-colors hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50"
          disabled={isAnimating}
        >
          <ChevronRight className="h-5 w-5 text-[#2F4858]" />
        </button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="h-[85vh] w-[85vw] max-w-[85vw] overflow-hidden rounded-[20px] bg-white p-0">
          <DialogTitle className="sr-only">{currentProject.title}</DialogTitle>
          <DialogDescription className="sr-only">{currentProject.title}</DialogDescription>
          <div className="relative h-full w-full overflow-hidden rounded-[20px]">
            <iframe
              src={currentProject.projectUrl}
              className="h-full w-full"
              title="Project Preview"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpotlightUsersMobile;
