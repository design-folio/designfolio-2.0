import { cn } from "@/lib/utils";

export function Folder({ isDragging = false, className }) {
  return (
    <div
      className={cn("relative z-50 shrink-0 select-none", className)}
      style={{ width: 40, height: 36, perspective: "120px" }}
    >
      <div
        className={cn(
          "ease absolute right-0 bottom-0 left-0 h-[28px] origin-top rounded-[4px] rounded-tl-none transition-all duration-300 group-hover/dropzone:shadow-[0_4px_10px_rgba(0,0,0,0.22)]",
          isDragging ? "bg-[#FF553E]" : "bg-amber-600"
        )}
      >
        <div
          className={cn(
            "absolute bottom-full left-0 h-[7px] w-[14px] rounded-t-[3px]",
            isDragging ? "bg-[#FF553E]" : "bg-amber-600"
          )}
        />
        <div
          className={cn("absolute h-[4px] w-[4px]", isDragging ? "bg-[#FF553E]" : "bg-amber-600")}
          style={{ bottom: "100%", left: 13, clipPath: "polygon(0 35%, 0% 100%, 50% 100%)" }}
        />
      </div>

      <div
        className={cn(
          "ease absolute right-[3px] left-[3px] h-[20px] origin-bottom rounded-[3px] transition-all duration-300",
          "bg-zinc-400",
          "bottom-[4px] group-hover/dropzone:[transform:translateY(-10px)_rotateX(-18deg)]"
        )}
      />
      <div
        className={cn(
          "ease absolute right-[3px] left-[3px] h-[20px] origin-bottom rounded-[3px] transition-all duration-300",
          "bg-zinc-300",
          "bottom-[4px] group-hover/dropzone:[transform:translateY(-6px)_rotateX(-12deg)]"
        )}
      />
      <div
        className={cn(
          "ease absolute right-[3px] left-[3px] h-[20px] origin-bottom rounded-[3px] transition-all duration-300",
          "bg-zinc-200",
          "bottom-[4px] group-hover/dropzone:[transform:translateY(-3px)_rotateX(-6deg)]"
        )}
      />

      <div
        className={cn(
          "ease absolute right-0 bottom-0 left-0 h-[22px] rounded-[4px] rounded-tr-none transition-all duration-300",
          isDragging ? "bg-[#FF553E]" : "bg-gradient-to-t from-amber-500 to-amber-400"
        )}
      >
        <div
          className={cn(
            "absolute right-0 bottom-full h-[7px] w-[24px] rounded-t-[3px]",
            isDragging ? "bg-[#FF553E]" : "bg-amber-400"
          )}
        />
        <div
          className={cn("absolute h-[4px] w-[4px]", isDragging ? "bg-[#FF553E]" : "bg-amber-400")}
          style={{ bottom: "100%", right: 23, clipPath: "polygon(100% 14%, 50% 100%, 100% 100%)" }}
        />
      </div>
    </div>
  );
}
