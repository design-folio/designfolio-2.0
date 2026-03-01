import React from 'react';
import { X, Pencil } from 'lucide-react';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { formatDuration } from '@/lib/utils';
import { Button } from '@/components/ui/buttonNew';
import DragHandle from '@/components/DragHandle';

export const SortableWorkExperienceItem = ({ exp, edit, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: exp._id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 9999 : 1,
      }}
      className={`flex justify-between gap-4 items-center ${isDragging ? 'relative' : ''}`}
    >
      <div className="flex-1 min-w-0 p-3 rounded-lg bg-df-section-card-bg-color border border-border">
        <p className="text-sm font-semibold text-df-base-text-color truncate">{exp.company || exp.name}</p>
        <p className="text-xs text-df-secondary-text-color truncate">{exp.role || exp.position}</p>
        <p className="text-xs text-df-secondary-text-color opacity-60 mt-0.5">{formatDuration(exp)}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {edit && (
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-foreground/5"
            onClick={() => onEdit(exp)}
          >
            <Pencil className="w-4 h-4 text-df-icon-color" />
          </Button>
        )}
        <DragHandle listeners={listeners} attributes={attributes} />
      </div>
    </div>
  );
};

const WorkExperienceWindow = ({ workExperiences }) => (
  <div className="w-full h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs p-0 flex flex-col overflow-hidden">
    {/* Tab bar */}
    <div className="flex bg-[#2d2d2d] border-b border-[#1e1e1e]">
      <div className="px-3 py-2 bg-[#1e1e1e] border-t border-t-[#007aff] flex items-center gap-2">
        <span className="text-[#e06c75]">experience.ts</span>
        <X size={10} className="opacity-50" />
      </div>
    </div>

    <div className="flex-1 flex overflow-hidden">
      {/* Line numbers */}
      <div className="w-10 bg-[#1e1e1e] border-r border-[#333] flex flex-col items-end pr-2 pt-4 text-[#858585] select-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="leading-5">{i + 1}</div>
        ))}
      </div>

      {/* Code body */}
      <div className="flex-1 p-4 pt-4 overflow-y-auto leading-5">
        <div>
          <span className="text-[#c678dd]">const</span>{' '}
          <span className="text-[#e06c75]">workExperience</span> = [
        </div>

        {workExperiences.length > 0 ? (
          workExperiences.map((exp, i) => (
            <div key={i} className="pl-4 mt-2">
              <span className="text-[#abb2bf]">{'{'}</span>
              <div className="pl-4">
                <span className="text-[#d19a66]">company</span>:{' '}
                <span className="text-[#98c379]">"{exp.company || exp.name}"</span>,
              </div>
              <div className="pl-4">
                <span className="text-[#d19a66]">role</span>:{' '}
                <span className="text-[#98c379]">"{exp.role || exp.position}"</span>,
              </div>
              <div className="pl-4">
                <span className="text-[#d19a66]">duration</span>:{' '}
                <span className="text-[#98c379]">"{formatDuration(exp)}"</span>,
              </div>
              <span className="text-[#abb2bf]">
                {'}'}{i < workExperiences.length - 1 ? ',' : ''}
              </span>
            </div>
          ))
        ) : (
          <div className="pl-4 mt-2 text-[#5c6370]">// Add work experience to see it here</div>
        )}

        <div className="mt-2"><span className="text-[#abb2bf]">];</span></div>
        <div className="mt-4">
          <span className="text-[#c678dd]">export default</span>{' '}
          <span className="text-[#e06c75]">workExperience</span>;
        </div>
      </div>
    </div>

    {/* VS Code status bar */}
    <div className="h-6 bg-[#007aff] text-white flex items-center px-2 justify-between text-[10px]">
      <div className="flex gap-3"><span>Main*</span><span>Ln 1, Col 1</span></div>
      <div className="flex gap-3"><span>UTF-8</span><span>TypeScript</span></div>
    </div>
  </div>
);

export default WorkExperienceWindow;
