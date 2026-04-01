import React, { useCallback } from "react";
import { GripVertical, Building } from "lucide-react";
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
import { useGlobalContext } from "@/context/globalContext";
import { _updateUser } from "@/network/post-request";

function SortableWorkCard({ experience }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: experience._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 9999 : 1,
  };

  const dateRange = experience?.currentlyWorking
    ? `${experience?.startYear} – Present`
    : `${experience?.startYear} – ${experience?.endYear}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white dark:bg-[#2A2520] border border-black/5 dark:border-white/5 rounded-xl transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.04] cursor-grab active:cursor-grabbing ${
        isDragging ? "shadow-lg" : ""
      }`}
      {...listeners}
      {...attributes}
    >
      <GripVertical className="w-4 h-4 text-[#7A736C] dark:text-[#9E9893] shrink-0" />
      <div className="w-9 h-9 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
        <Building className="w-4 h-4 text-[#7A736C] dark:text-[#9E9893]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] truncate">
          {experience?.role || "Unnamed role"}
        </p>
        <p className="text-[11px] text-[#7A736C] dark:text-[#9E9893] truncate mt-0.5">
          {[experience?.company, dateRange].filter(Boolean).join(" · ")}
        </p>
      </div>
    </div>
  );
}

export default function RearrangeWorksSidebar() {
  const { userDetails, setUserDetails, updateCache } = useGlobalContext();

  const experiences = userDetails?.experiences || [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleSortEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const list = userDetails?.experiences || [];
      const oldIndex = list.findIndex((e) => e._id === active.id);
      const newIndex = list.findIndex((e) => e._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const sorted = arrayMove(list, oldIndex, newIndex);
      setUserDetails((prev) => ({ ...prev, experiences: sorted }));
      updateCache("userDetails", { experiences: sorted });
      _updateUser({ experiences: sorted });
    },
    [userDetails?.experiences, setUserDetails, updateCache],
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleSortEnd}
        >
          <SortableContext
            items={experiences.map((e) => e._id)}
            strategy={verticalListSortingStrategy}
          >
            {experiences.map((exp) => (
              <SortableWorkCard key={exp._id} experience={exp} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
