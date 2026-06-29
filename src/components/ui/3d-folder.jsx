import { useState, useRef, useEffect, useCallback, startTransition } from "react";
import { cn } from "@/lib/utils";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Minus,
  Square,
  RefreshCw,
  Lock,
  Star,
  User,
} from "lucide-react";

export function AnimatedFolder({ title, projects, className, onProjectClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [hiddenCardId, setHiddenCardId] = useState(null);
  const cardRefs = useRef([]);

  const handleProjectClick = (project, index) => {
    if (onProjectClick) {
      onProjectClick(project, index);
      return;
    }
    setSelectedIndex(index);
    setHiddenCardId(project.id);
  };

  const handleFolderClick = () => {
    if (projects.length > 0) {
      handleProjectClick(projects[0], 0);
    }
  };

  const handleCloseLightbox = () => {
    setSelectedIndex(null);
  };

  const handleCloseComplete = () => {
    setHiddenCardId(null);
  };

  return (
    <>
      <div
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl bg-transparent p-4",
          className
        )}
        style={{ minWidth: "120px", minHeight: "140px", perspective: "1000px" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleFolderClick}
      >
        <div
          className="relative mb-2 flex items-center justify-center"
          style={{ height: "80px", width: "100px" }}
        >
          {/* Folder back layer */}
          <div
            className="absolute h-12 w-16 rounded-md bg-[#007aff] shadow-sm"
            style={{
              transformOrigin: "bottom center",
              transform: isHovered ? "rotateX(-15deg)" : "rotateX(0deg)",
              transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              zIndex: 10,
            }}
          />
          {/* Folder tab */}
          <div
            className="absolute h-2 w-6 rounded-t-sm bg-[#007aff]"
            style={{
              top: "calc(50% - 24px - 6px)",
              left: "calc(50% - 32px + 8px)",
              transformOrigin: "bottom center",
              transform: isHovered ? "rotateX(-25deg) translateY(-1px)" : "rotateX(0deg)",
              transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              zIndex: 10,
            }}
          />
          {/* Project card peek */}
          <div
            className="absolute"
            style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 20 }}
          >
            {projects.slice(0, 1).map((project, index) => (
              <div
                key={project.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleFolderClick();
                }}
                className={cn(
                  "absolute h-12 w-12 overflow-hidden rounded-sm border border-black/5 bg-white shadow-sm transition-all duration-500",
                  hiddenCardId === project.id ? "scale-90 opacity-0" : "scale-100 opacity-100"
                )}
                style={{
                  left: "-24px",
                  top: "-24px",
                  transform: isHovered
                    ? "translateY(-30px) rotate(0deg)"
                    : "translateY(0) rotate(0deg)",
                  transitionDelay: `${index * 80}ms`,
                  zIndex: 20 - index,
                }}
              >
                {project.image?.startsWith?.("http") ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs">
                    {project.image}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Folder front layer */}
          <div
            className="absolute h-12 w-16 rounded-md bg-[#4ca1ff] shadow-md"
            style={{
              top: "calc(50% - 24px + 2px)",
              transformOrigin: "bottom center",
              transform: isHovered ? "rotateX(25deg) translateY(4px)" : "rotateX(0deg)",
              transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              zIndex: 30,
            }}
          />
        </div>
        <h3 className="max-w-full truncate rounded px-1.5 py-0.5 text-[11px] leading-tight font-medium text-[#333] transition-colors group-hover:bg-[#0063e1] group-hover:text-white">
          {title}
        </h3>
      </div>

      <BrowserWindow
        projects={projects.slice(0, 1)}
        currentIndex={selectedIndex ?? 0}
        isOpen={selectedIndex !== null}
        onClose={handleCloseLightbox}
        onCloseComplete={handleCloseComplete}
      />
    </>
  );
}

function BrowserWindow({ projects, currentIndex, isOpen, onClose, onCloseComplete }) {
  const [animationPhase, setAnimationPhase] = useState("initial");
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [internalIndex, setInternalIndex] = useState(currentIndex);

  useEffect(() => {
    if (isOpen) {
      startTransition(() => {
        setInternalIndex(currentIndex);
        setShouldRender(true);
        setAnimationPhase("initial");
        setIsClosing(false);
      });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimationPhase("animating"));
      });
      setTimeout(() => setAnimationPhase("complete"), 500);
    }
  }, [isOpen, currentIndex]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    onClose();
    setTimeout(() => {
      setIsClosing(false);
      setShouldRender(false);
      setAnimationPhase("initial");
      onCloseComplete?.();
    }, 400);
  }, [onClose, onCloseComplete]);

  if (!shouldRender) return null;

  const currentProject = projects[internalIndex];

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8"
      onClick={handleClose}
      style={{ opacity: isClosing ? 0 : 1, transition: "opacity 400ms" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div
        className="relative flex h-[80vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-gray-400 bg-[#f3f3f3] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform:
            animationPhase === "initial" ? "scale(0.9) translateY(20px)" : "scale(1) translateY(0)",
          opacity: animationPhase === "initial" ? 0 : 1,
          transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 400ms",
        }}
      >
        {/* Title Bar */}
        <div className="flex h-10 shrink-0 items-center justify-between border-b border-gray-300 bg-[#e7e7e7] px-3 select-none">
          <div className="flex items-center gap-2">
            <div className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-sm bg-gray-200 text-[10px] text-gray-500">
              {currentProject?.image?.startsWith?.("http") ? (
                <img
                  src={currentProject.image}
                  alt={currentProject.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                currentProject?.image
              )}
            </div>
            <span className="max-w-[200px] truncate text-[11px] text-gray-600">
              {currentProject?.title || "New Tab"}
            </span>
          </div>
          <div className="flex items-center">
            <button className="flex h-10 w-11 items-center justify-center transition-colors hover:bg-gray-300">
              <Minus size={14} className="text-gray-600" />
            </button>
            <button className="flex h-10 w-11 items-center justify-center transition-colors hover:bg-gray-300">
              <Square size={10} className="text-gray-600" />
            </button>
            <button
              onClick={handleClose}
              className="flex h-10 w-11 items-center justify-center transition-colors hover:bg-[#e81123] hover:text-white"
            >
              <X size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
        {/* Toolbar */}
        <div className="flex shrink-0 flex-col gap-2 border-b border-gray-200 bg-white p-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button className="rounded-full p-1.5 hover:bg-gray-100">
                <ChevronLeft size={18} className="text-gray-600" />
              </button>
              <button className="rounded-full p-1.5 hover:bg-gray-100">
                <ChevronRight size={18} className="text-gray-600" />
              </button>
              <button className="rounded-full p-1.5 hover:bg-gray-100">
                <RefreshCw size={16} className="text-gray-600" />
              </button>
            </div>
            <div className="flex flex-1 items-center rounded-full border border-transparent bg-[#f0f2f5] px-3 py-1.5 transition-all hover:border-gray-300">
              <Lock size={12} className="mr-2 text-gray-500" />
              <input
                type="text"
                readOnly
                value={`https://${currentProject?.title?.toLowerCase()?.replace(/\s+/g, "-") || "project"}.com`}
                className="w-full border-none bg-transparent text-xs text-gray-700 outline-none"
              />
              <Star size={14} className="ml-2 cursor-pointer text-gray-500 hover:text-yellow-500" />
            </div>
            <button className="rounded p-1.5 hover:bg-gray-100">
              <User size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
        {/* Content */}
        <div className="flex flex-1 flex-col items-center justify-center overflow-auto bg-white p-8 text-center">
          <div className="w-full max-w-md space-y-6">
            {currentProject?.image?.startsWith?.("http") ? (
              <img
                src={currentProject.image}
                alt={currentProject.title}
                className="mb-4 max-h-64 w-full rounded-xl object-cover shadow-md"
              />
            ) : (
              <div className="mb-8 text-8xl opacity-20 grayscale">{currentProject?.image}</div>
            )}
            <h1 className="text-2xl font-semibold text-gray-800">{currentProject?.title}</h1>
            <p className="leading-relaxed text-gray-500">
              Preview for {currentProject?.title}. This is a case study preview window.
            </p>
            <div className="flex flex-col items-center gap-4 pt-8">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full w-1/3 animate-pulse bg-[#007aff]" />
              </div>
              <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                Connection Secure
              </span>
            </div>
          </div>
        </div>
        {/* Status Bar */}
        <div className="flex h-6 shrink-0 items-center justify-between border-t border-gray-200 bg-[#f3f3f3] px-3">
          <span className="text-[10px] text-gray-500">Ready</span>
          <span className="text-[10px] text-gray-500">100%</span>
        </div>
      </div>
    </div>
  );
}
