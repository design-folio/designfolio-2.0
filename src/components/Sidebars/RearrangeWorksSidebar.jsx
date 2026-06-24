import React, { useCallback, useState } from "react";
import { GripVertical, Building, ArrowUpDown, Check } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { useGlobalContext } from "@/context/globalContext";
import { _updateUser } from "@/network/post-request";

const sortByDate = (list) =>
  [...list].sort((a, b) => {
    if (a.currentlyWorking && !b.currentlyWorking) return -1;
    if (!a.currentlyWorking && b.currentlyWorking) return 1;
    const startDiff = (b.startYear || 0) - (a.startYear || 0);
    if (startDiff !== 0) return startDiff;
    return (b.endYear || 0) - (a.endYear || 0);
  });

function SortableWorkCard({ experience, rank }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: experience._id,
  });

  const dateRange = experience.currentlyWorking
    ? `${experience.startYear} – Present`
    : `${experience.startYear} – ${experience.endYear}`;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: [transition, !isDragging && "box-shadow 150ms ease-out"]
          .filter(Boolean)
          .join(", "),
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 9999 : 1,
      }}
      className={cn(
        "group flex items-center gap-2.5 p-3 rounded-xl border cursor-grab active:cursor-grabbing",
        "bg-white dark:bg-[#2A2520] border-black/5 dark:border-white/5",
        "hover:bg-black/[0.03] dark:hover:bg-white/[0.03]",
        isDragging && "shadow-lg ring-1 ring-black/10 dark:ring-white/10"
      )}
      {...listeners}
      {...attributes}
    >
      <span
        className="w-4 text-center shrink-0 select-none text-[11px] font-semibold tabular-nums text-[#B8B0A8] dark:text-[#5E5852]"
        aria-label={`Position ${rank}`}
      >
        {rank}
      </span>

      <GripVertical className="w-4 h-4 shrink-0 text-[#C8C0B8] dark:text-[#5E5852] group-hover:text-[#7A736C] dark:group-hover:text-[#9E9893] transition-colors duration-150" />

      <div className="w-8 h-8 shrink-0 rounded-lg bg-black/[0.05] dark:bg-white/[0.05] flex items-center justify-center">
        <Building className="w-3.5 h-3.5 text-[#7A736C] dark:text-[#9E9893]" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium leading-tight truncate text-[#1A1A1A] dark:text-[#F0EDE7]">
          {experience.role || "Unnamed role"}
        </p>
        <p className="text-[11px] leading-tight truncate mt-0.5 text-[#7A736C] dark:text-[#9E9893]">
          {[experience.company, dateRange].filter(Boolean).join(" · ")}
        </p>
      </div>
    </div>
  );
}

export default function RearrangeWorksSidebar() {
  const { userDetails, setUserDetails, updateCache } = useGlobalContext();
  const [sorted, setSorted] = useState(false);

  const experiences = userDetails?.experiences || [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const persist = useCallback(
    (reordered) => {
      setUserDetails((prev) => ({ ...prev, experiences: reordered }));
      updateCache("userDetails", { experiences: reordered });
      _updateUser({ experiences: reordered });
    },
    [setUserDetails, updateCache]
  );

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      if (!over || active.id === over.id) return;
      const oldIndex = experiences.findIndex((e) => e._id === active.id);
      const newIndex = experiences.findIndex((e) => e._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      setSorted(false);
      persist(arrayMove(experiences, oldIndex, newIndex));
    },
    [experiences, persist]
  );

  const handleSortByDate = useCallback(() => {
    setSorted(true);
    persist(sortByDate(experiences));
    setTimeout(() => setSorted(false), 2000);
  }, [experiences, persist]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/5 dark:border-white/5 shrink-0">
        <p className="text-[11px] text-[#7A736C] dark:text-[#9E9893]">
          {experiences.length} {experiences.length === 1 ? "item" : "items"} · drag to rearrange
        </p>
        <button
          onClick={handleSortByDate}
          disabled={experiences.length < 2}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium",
            "transition-[background-color,color,transform] duration-150 ease-out",
            "active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed",
            sorted
              ? "bg-green-500/10 text-green-700 dark:text-green-500"
              : "bg-black/[0.04] dark:bg-white/[0.04] text-[#7A736C] dark:text-[#9E9893]"
          )}
        >
          {sorted ? <Check className="w-3 h-3" /> : <ArrowUpDown className="w-3 h-3" />}
          {sorted ? "Sorted" : "Sort by date"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {experiences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building className="w-8 h-8 mb-3 text-[#C8C0B8] dark:text-[#5E5852]" />
            <p className="text-[13px] font-medium text-[#7A736C] dark:text-[#9E9893]">
              No experience yet
            </p>
            <p className="text-[11px] mt-1 text-[#B8B0A8] dark:text-[#5E5852]">
              Add work experience to reorder it here.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={experiences.map((e) => e._id)}
              strategy={verticalListSortingStrategy}
            >
              {experiences.map((exp, index) => (
                <SortableWorkCard key={exp._id} experience={exp} rank={index + 1} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
