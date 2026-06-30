import { GripVertical, Trash2, ArrowUp, ArrowDown } from "lucide-react";

export default function SectionToolbar({
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  dragHandleProps,
}) {
  return (
    <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-lg border border-black/[0.08] bg-white px-2 py-1 text-[#7A736C] opacity-0 shadow-sm transition-opacity group-hover:opacity-100 dark:border-white/[0.08] dark:bg-[#2A2520] dark:text-[#9E9893]">
      <button
        {...dragHandleProps}
        className="flex h-6 w-6 cursor-grab items-center justify-center rounded hover:bg-black/5 active:cursor-grabbing dark:hover:bg-white/5"
        title="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>

      <button
        onClick={onMoveUp}
        disabled={!canMoveUp}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-white/5"
        title="Move up"
      >
        <ArrowUp size={13} />
      </button>

      <button
        onClick={onMoveDown}
        disabled={!canMoveDown}
        className="flex h-6 w-6 items-center justify-center rounded hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-white/5"
        title="Move down"
      >
        <ArrowDown size={13} />
      </button>

      <button
        onClick={onDelete}
        className="flex h-6 w-6 items-center justify-center rounded text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
        title="Delete section"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
