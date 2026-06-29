import React, { useCallback, useMemo, useState } from "react";
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
        "group flex cursor-grab items-center gap-2.5 rounded-xl border p-3 active:cursor-grabbing",
        "border-black/5 bg-white dark:border-white/5 dark:bg-[#2A2520]",
        "hover:bg-black/[0.03] dark:hover:bg-white/[0.03]",
        isDragging && "shadow-lg ring-1 ring-black/10 dark:ring-white/10"
      )}
      {...listeners}
      {...attributes}
    >
      <span
        className="w-4 shrink-0 text-center text-[11px] font-semibold text-[#B8B0A8] tabular-nums select-none dark:text-[#5E5852]"
        aria-label={`Position ${rank}`}
      >
        {rank}
      </span>

      <GripVertical className="h-4 w-4 shrink-0 text-[#C8C0B8] transition-colors duration-150 group-hover:text-[#7A736C] dark:text-[#5E5852] dark:group-hover:text-[#9E9893]" />

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/[0.05] dark:bg-white/[0.05]">
        <Building className="h-3.5 w-3.5 text-[#7A736C] dark:text-[#9E9893]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] leading-tight font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
          {experience.role || "Unnamed role"}
        </p>
        <p className="mt-0.5 truncate text-[11px] leading-tight text-[#7A736C] dark:text-[#9E9893]">
          {[experience.company, dateRange].filter(Boolean).join(" · ")}
        </p>
      </div>
    </div>
  );
}

export default function RearrangeWorksSidebar() {
  const { userDetails, setUserDetails, updateCache } = useGlobalContext();
  const [sorted, setSorted] = useState(false);

  const experiences = useMemo(() => userDetails?.experiences || [], [userDetails?.experiences]);

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
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between border-b border-black/5 px-4 py-2.5 dark:border-white/5">
        <p className="text-[11px] text-[#7A736C] dark:text-[#9E9893]">
          {experiences.length} {experiences.length === 1 ? "item" : "items"} · drag to rearrange
        </p>
        <button
          onClick={handleSortByDate}
          disabled={experiences.length < 2}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium",
            "transition-[background-color,color,transform] duration-150 ease-out",
            "active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40",
            sorted
              ? "bg-green-500/10 text-green-700 dark:text-green-500"
              : "bg-black/[0.04] text-[#7A736C] dark:bg-white/[0.04] dark:text-[#9E9893]"
          )}
        >
          {sorted ? <Check className="h-3 w-3" /> : <ArrowUpDown className="h-3 w-3" />}
          {sorted ? "Sorted" : "Sort by date"}
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {experiences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building className="mb-3 h-8 w-8 text-[#C8C0B8] dark:text-[#5E5852]" />
            <p className="text-[13px] font-medium text-[#7A736C] dark:text-[#9E9893]">
              No experience yet
            </p>
            <p className="mt-1 text-[11px] text-[#B8B0A8] dark:text-[#5E5852]">
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
