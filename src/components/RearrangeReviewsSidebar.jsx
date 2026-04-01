import React, { useCallback } from "react";
import { GripVertical } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function SortableReviewCard({ review }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: review._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 9999 : 1,
  };

  const initials = review?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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
      <Avatar className="w-9 h-9 rounded-lg shrink-0">
        <AvatarImage
          src={review?.avatar?.url || review?.avatar}
          alt={review?.name}
        />
        <AvatarFallback
          className="rounded-lg text-xs font-medium"
          style={{ backgroundColor: "#FF9966", color: "#FFFFFF" }}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] truncate">
          {review?.name || "Unnamed"}
        </p>
        <p className="text-[11px] text-[#7A736C] dark:text-[#9E9893] truncate mt-0.5">
          {[review?.role, review?.company].filter(Boolean).join(", ")}
        </p>
      </div>
    </div>
  );
}

export default function RearrangeReviewsSidebar() {
  const { userDetails, setUserDetails, updateCache } = useGlobalContext();

  const reviews = userDetails?.reviews || [];

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

      const list = userDetails?.reviews || [];
      const oldIndex = list.findIndex((r) => r._id === active.id);
      const newIndex = list.findIndex((r) => r._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const sorted = arrayMove(list, oldIndex, newIndex);
      setUserDetails((prev) => ({ ...prev, reviews: sorted }));
      updateCache("userDetails", { reviews: sorted });
      _updateUser({ reviews: sorted });
    },
    [userDetails?.reviews, setUserDetails, updateCache],
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
            items={reviews.map((r) => r._id)}
            strategy={verticalListSortingStrategy}
          >
            {reviews.map((review) => (
              <SortableReviewCard key={review._id} review={review} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
