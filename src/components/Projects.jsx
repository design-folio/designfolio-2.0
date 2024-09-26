import React from "react";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import ProjectCard from "./ProjectCard";
import Section from "./section";
import AddCard from "./AddCard";
import ProjectIcon from "../../public/assets/svgs/projectIcon.svg";
import { modals, moveItemInArray } from "@/lib/constant";
import { _updateUser } from "@/network/post-request";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/router";

const SortableItem = SortableElement(
  ({ value, onDeleteProject, edit, preview }) => {
    const router = useRouter();

    const handleRouter = (id) => {
      if (edit) {
        router.push(`/project/${id}/editor`);
      } else if (preview) {
        router.push(`/project/${id}/preview`);
      } else {
        router.push(`/project/${id}`);
      }
    };

    return (
      <div className="h-full">
        <ProjectCard
          project={value}
          onDeleteProject={onDeleteProject}
          edit={edit}
          handleRouter={handleRouter}
        />
      </div>
    );
  }
);

const SortableContainerElement = SortableContainer(({ children }) => {
  return <>{children}</>;
});

export default function Projects({
  edit = false,
  userDetails = null,
  projectRef,
  setUserDetails,
  setSelectedProject,
  openModal,
  preview,
}) {
  const onDeleteProject = (project) => {
    openModal(modals.deleteProject);
    setSelectedProject(project);
  };

  const onSortStart = () => {
    document.body.classList.add("cursor-grabbing");
  };

  const onSortEnd = ({ oldIndex, newIndex }) => {
    document.body.classList.remove("cursor-grabbing");

    const sortedProject = moveItemInArray(
      userDetails.projects,
      oldIndex,
      newIndex
    );

    setUserDetails((prev) => ({ ...prev, projects: sortedProject }));
    _updateUser({ projects: sortedProject });
  };
  return (
    <div ref={projectRef}>
      <Section title={"My works"}>
        <SortableContainerElement
          onSortEnd={onSortEnd}
          onSortStart={onSortStart}
          useDragHandle
          axis="xy"
          helperClass="!z-[100000] list-none"
        >
          <div
            className={twMerge(
              "grid gap-4 md:grid-cols-2",
              userDetails?.projects?.length === 0 && "md:grid-cols-1"
            )}
          >
            {userDetails?.projects?.map((project, index) => (
              <SortableItem
                key={`item-${project._id}`} // Assuming each project has a unique id for better key handling
                index={index}
                value={project}
                onDeleteProject={onDeleteProject}
                edit={edit}
                preview={preview}
              />
            ))}
            {edit && (
              <AddCard
                title={`${
                  userDetails?.projects?.length === 0
                    ? "Upload your first case study"
                    : "Add your case study"
                }`}
                subTitle="Show off your best work."
                first={userDetails?.projects?.length !== 0}
                buttonTitle="Add case study"
                onClick={() => openModal(modals.project)}
                icon={<ProjectIcon />}
              />
            )}
          </div>
        </SortableContainerElement>
      </Section>
    </div>
  );
}
