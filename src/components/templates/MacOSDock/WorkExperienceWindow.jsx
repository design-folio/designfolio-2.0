import React from "react";
import { X, Pencil } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { formatDuration } from "@/lib/utils";
import { tiptapToDisplayString } from "@/lib/tiptapUtils";
import { Button } from "@/components/ui/buttonNew";
import DragHandle from "@/components/DragHandle";

export const SortableWorkExperienceItem = ({ exp, edit, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: exp._id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 9999 : 1,
      }}
      className={`flex items-center justify-between gap-4 ${isDragging ? "relative" : ""}`}
    >
      <div className="bg-df-section-card-bg-color border-border min-w-0 flex-1 rounded-lg border p-3">
        <p className="text-df-base-text-color truncate text-sm font-semibold">
          {exp.company || exp.name}
        </p>
        <p className="text-df-secondary-text-color truncate text-xs">{exp.role || exp.position}</p>
        <p className="text-df-secondary-text-color mt-0.5 text-xs opacity-60">
          {formatDuration(exp)}
        </p>
        {exp.description && tiptapToDisplayString(exp.description).trim() && (
          <p className="text-df-secondary-text-color mt-1.5 line-clamp-2 text-xs whitespace-pre-line">
            {tiptapToDisplayString(exp.description).trim()}
          </p>
        )}
      </div>
      <div className="flex shrink-0 flex-col items-center gap-2">
        {edit && (
          <Button
            variant="secondary"
            size="icon"
            className="hover:bg-foreground/5 h-8 w-8 rounded-full"
            onClick={() => onEdit(exp)}
          >
            <Pencil className="text-df-icon-color h-4 w-4" />
          </Button>
        )}
        <DragHandle size="sm" listeners={listeners} attributes={attributes} />
      </div>
    </div>
  );
};

function renderExperienceJsonEntry(exp, index, total) {
  const descStr = exp.description ? tiptapToDisplayString(exp.description).trim() : "";
  const isLast = index === total - 1;

  return (
    <div key={exp._id ?? index} className="mt-2 pl-4">
      <span className="text-[#abb2bf]">{"{"}</span>
      <div className="pl-4">
        <span className="text-[#d19a66]">company</span>:{" "}
        <span className="text-[#98c379]">&quot;{exp.company || exp.name}&quot;</span>,
      </div>
      <div className="pl-4">
        <span className="text-[#d19a66]">role</span>:{" "}
        <span className="text-[#98c379]">&quot;{exp.role || exp.position}&quot;</span>,
      </div>
      <div className="pl-4">
        <span className="text-[#d19a66]">duration</span>:{" "}
        <span className="text-[#98c379]">&quot;{formatDuration(exp)}&quot;</span>,
      </div>
      {descStr !== "" && (
        <div className="pl-4">
          <span className="text-[#d19a66]">description</span>:{" "}
          <span className="break-words whitespace-pre-line text-[#98c379]">
            &quot;{descStr}&quot;
          </span>
          ,
        </div>
      )}
      <span className="text-[#abb2bf]">
        {"}"}
        {!isLast ? "," : ""}
      </span>
    </div>
  );
}

const WorkExperienceWindow = ({ workExperiences }) => (
  <div className="flex h-full w-full flex-col overflow-hidden bg-[#1e1e1e] p-0 font-mono text-xs text-[#d4d4d4]">
    {/* Tab bar */}
    <div className="flex border-b border-[#1e1e1e] bg-[#2d2d2d]">
      <div className="flex items-center gap-2 border-t border-t-[#007aff] bg-[#1e1e1e] px-3 py-2">
        <span className="text-[#e06c75]">experience.ts</span>
        <X size={10} className="opacity-50" />
      </div>
    </div>

    <div className="flex flex-1 overflow-hidden">
      {/* Line numbers */}
      <div className="flex w-10 flex-col items-end border-r border-[#333] bg-[#1e1e1e] pt-4 pr-2 text-[#858585] select-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="leading-5">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Code body */}
      <div className="flex-1 overflow-y-auto p-4 pt-4 leading-5">
        <div>
          <span className="text-[#c678dd]">const</span>{" "}
          <span className="text-[#e06c75]">workExperience</span> = [
        </div>

        {workExperiences.length > 0 ? (
          workExperiences.map((exp, i) => renderExperienceJsonEntry(exp, i, workExperiences.length))
        ) : (
          <div className="mt-2 pl-4 text-[#5c6370]">{"// Add work experience to see it here"}</div>
        )}

        <div className="mt-2">
          <span className="text-[#abb2bf]">];</span>
        </div>
        <div className="mt-4">
          <span className="text-[#c678dd]">export default</span>{" "}
          <span className="text-[#e06c75]">workExperience</span>;
        </div>
      </div>
    </div>

    {/* VS Code status bar */}
    <div className="flex h-6 items-center justify-between bg-[#007aff] px-2 text-[10px] text-white">
      <div className="flex gap-3">
        <span>Main*</span>
        <span>Ln 1, Col 1</span>
      </div>
      <div className="flex gap-3">
        <span>UTF-8</span>
        <span>TypeScript</span>
      </div>
    </div>
  </div>
);

export default WorkExperienceWindow;
