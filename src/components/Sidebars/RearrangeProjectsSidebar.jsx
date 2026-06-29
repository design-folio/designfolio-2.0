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

function SortableProjectCard({ project }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 9999 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex cursor-grab items-center gap-3 rounded-xl border border-black/5 bg-white p-3 transition-colors hover:bg-black/[0.04] active:cursor-grabbing dark:border-white/5 dark:bg-[#2A2520] dark:hover:bg-white/[0.04] ${
        isDragging ? "shadow-lg" : ""
      }`}
      {...listeners}
      {...attributes}
    >
      <GripVertical className="h-4 w-4 shrink-0 text-[#7A736C] dark:text-[#9E9893]" />
      <div className="h-10 w-12 shrink-0 overflow-hidden rounded-md bg-black/5 dark:bg-white/5">
        {project?.thumbnail?.url && (
          <img
            src={project.thumbnail.url}
            alt={project.title || "Project thumbnail"}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
          {project?.title || "Untitled project"}
        </p>
        {project?.description && (
          <p className="mt-0.5 truncate text-[11px] text-[#7A736C] dark:text-[#9E9893]">
            {project.description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function RearrangeProjectsSidebar() {
  const { userDetails, setUserDetails, updateCache } = useGlobalContext();

  const projects = userDetails?.projects || [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSortEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const projectList = userDetails?.projects || [];
      const oldIndex = projectList.findIndex((p) => p._id === active.id);
      const newIndex = projectList.findIndex((p) => p._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const sortedProjects = arrayMove(projectList, oldIndex, newIndex);
      setUserDetails((prev) => ({ ...prev, projects: sortedProjects }));
      updateCache("userDetails", { projects: sortedProjects });
      _updateUser({ projects: sortedProjects });
    },
    [userDetails?.projects, setUserDetails, updateCache]
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSortEnd}>
          <SortableContext
            items={projects.map((p) => p._id)}
            strategy={verticalListSortingStrategy}
          >
            {projects.map((project) => (
              <SortableProjectCard key={project._id} project={project} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
