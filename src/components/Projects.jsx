import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ProjectCard from "./ProjectCard";
import Section from "./section";
import AddCard from "./AddCard";
import { modals } from "@/lib/constant";
import { _updateUser, _updateProject } from "@/network/post-request";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/router";
import ProjectLock from "./projectLock";

const SortableItem = ({ project, onDeleteProject, edit, preview, recentlyMovedIds, onToggleVisibility }) => {
  const router = useRouter();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 9999 : 1,
  };

  const handleRouter = (id) => {
    if (edit) {
      router.push(`/project/${id}/editor`);
    } else if (preview) {
      router.push(`/project/${id}/preview`);
    } else {
      router.push(`/project/${id}`);
    }
  };
  const getHref = (id) => {
    if (edit) return `/project/${id}/editor`;
    if (preview) return `/project/${id}/preview`;
    return `/project/${id}`;
  };

  // Check if this item was recently moved (to prevent navigation after drag)
  const wasRecentlyMoved = recentlyMovedIds?.has(project._id) ?? false;

  return (
    <div ref={setNodeRef} style={style} className={`h-full w-full flex ${isDragging ? 'relative' : ''}`}>
      <ProjectCard
        project={project}
        onDeleteProject={onDeleteProject}
        edit={edit}
        handleRouter={handleRouter}
        href={getHref(project._id)}
        dragHandleListeners={listeners}
        dragHandleAttributes={attributes}
        isDragging={isDragging}
        wasRecentlyMoved={wasRecentlyMoved}
        onToggleVisibility={onToggleVisibility}
      />
    </div>
  );
};

export default function Projects({
  edit = false,
  userDetails = null,
  projectRef,
  setUserDetails,
  setSelectedProject,
  openModal,
  preview,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 0, // Activate immediately on drag handle
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Track recently moved items to prevent navigation after drag (use state to trigger re-renders)
  const [recentlyMovedIds, setRecentlyMovedIds] = React.useState(new Set());

  // Filter out hidden projects in preview mode
  const visibleProjects = React.useMemo(() => {
    if (preview && userDetails?.projects) {
      return userDetails.projects.filter((project) => !project.hidden);
    }
    return userDetails?.projects || [];
  }, [userDetails?.projects, preview]);

  const onDeleteProject = (project) => {
    openModal(modals.deleteProject);
    setSelectedProject(project);
  };

  const handleToggleVisibility = (projectId) => {
    const updatedProjects = userDetails.projects.map((project) => {
      if (project._id === projectId) {
        const updatedProject = { ...project, hidden: !project.hidden };
        // Update individual project on server
        _updateProject(projectId, { hidden: updatedProject.hidden });
        return updatedProject;
      }
      return project;
    });

    // Update local state
    setUserDetails((prev) => ({ ...prev, projects: updatedProjects }));
    // Also update the entire projects array to keep it in sync
    _updateUser({ projects: updatedProjects });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = userDetails.projects.findIndex(
      (project) => project._id === active.id
    );
    const newIndex = userDetails.projects.findIndex(
      (project) => project._id === over.id
    );

    const sortedProject = arrayMove(
      userDetails.projects,
      oldIndex,
      newIndex
    );

    // Mark all items that were in the affected range as recently moved
    const minIndex = Math.min(oldIndex, newIndex);
    const maxIndex = Math.max(oldIndex, newIndex);
    const movedIds = new Set();
    for (let i = minIndex; i <= maxIndex; i++) {
      movedIds.add(sortedProject[i]._id);
    }

    // Update state to trigger re-render with new recently moved IDs
    setRecentlyMovedIds(movedIds);
    setUserDetails((prev) => ({ ...prev, projects: sortedProject }));
    _updateUser({ projects: sortedProject });

    // Clear the recently moved set after a delay
    setTimeout(() => {
      setRecentlyMovedIds(new Set());
    }, 300);
  };
  return (
    <div ref={projectRef}>
      <Section title={"My works"} wallpaper={userDetails?.wallpaper} showStar={true}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={visibleProjects?.map((p) => p._id) || []}
            strategy={rectSortingStrategy}
          >
            <div
              className={twMerge(
                "grid grid-cols-1 gap-4 md:grid-cols-2 items-stretch",
                visibleProjects?.length === 0 && "md:grid-cols-1"
              )}
            >
              {visibleProjects?.map((project) => (
                <SortableItem
                  key={project._id}
                  project={project}
                  onDeleteProject={onDeleteProject}
                  edit={edit}
                  preview={preview}
                  recentlyMovedIds={recentlyMovedIds}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}

              {edit &&
                (userDetails?.pro || visibleProjects.length < 2 ? (
                  <AddCard
                    title={`${visibleProjects?.length === 0
                      ? "Upload your first case study"
                      : "Add case study"
                      }`}
                    subTitle="Show off your best work."
                    first={visibleProjects?.length !== 0}
                    buttonTitle="Add case study"
                    secondaryButtonTitle="Write using AI"
                    onClick={() => openModal(modals.project)}
                    // icon={<MemoCasestudy className="cursor-pointer" />}
                    openModal={openModal}
                  />
                ) : (
                  <ProjectLock />
                ))}
            </div>
          </SortableContext>
        </DndContext>
      </Section>
    </div>
  );
}
