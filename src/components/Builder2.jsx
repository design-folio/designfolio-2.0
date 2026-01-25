import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGlobalContext } from "@/context/globalContext";
import { modals, sidebars, DEFAULT_SECTION_ORDER, normalizeSectionOrder } from "@/lib/constant";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { getPlainTextLength } from "@/lib/tiptapUtils";
import { cn } from "@/lib/utils";
import { _updateProject, _updateUser } from "@/network/post-request";
import { ChevronDown, ChevronUp, PencilIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState, useRef } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AiIcon from "../../public/assets/svgs/ai.svg";
import BehanceIcon from "../../public/assets/svgs/behance.svg";
import DribbbleIcon from "../../public/assets/svgs/dribbble.svg";
import EditIcon from "../../public/assets/svgs/edit.svg";
import ExperienceShape from "../../public/assets/svgs/experience-shape.svg";
import GoUp from "../../public/assets/svgs/go-up.svg";
import InstagramIcon from "../../public/assets/svgs/instagram.svg";
import LinkedInIcon from "../../public/assets/svgs/linkedin.svg";
import MediumIcon from "../../public/assets/svgs/medium.svg";
import { default as NoteIcon, default as NotionIcon } from "../../public/assets/svgs/noteIcon.svg";
import PlusIcon from "../../public/assets/svgs/plus.svg";
import ProjectShape from "../../public/assets/svgs/project-shape.svg";
import Quote from "../../public/assets/svgs/quote.svg";
import TwitterIcon from "../../public/assets/svgs/twitter.svg";
import AddCard from "./AddCard";
import AddItem from "./addItem";
import Button from "./button";
import Chat from "./chat";
import MemoCasestudy from "./icons/Casestudy";
import MemoLinkedin from "./icons/Linkedin";
import MemoOtherlinks from "./icons/Otherlinks";
import MemoResume from "./icons/Resume";
import MemoSocial from "./icons/Social";
import MemoTestimonial from "./icons/Testimonial";
import MemoWorkExperience from "./icons/WorkExperience";
import DfImage from "./image";
import ProjectCard from "./ProjectCard";
import ProjectLock from "./projectLock";
import SimpleTiptapRenderer from "./SimpleTiptapRenderer";
import Text from "./text";
import { Button as ButtonNew } from "./ui/buttonNew";
import DragHandle from "./DragHandle";
import SortIcon from "../../public/assets/svgs/sort.svg";
import ReviewCard from "./reviewCard";
import SortableModal from "./SortableModal";
import { AboutMeContent } from "./aboutMe";

// Move SortableProjectItem outside to prevent recreation on each render
const SortableProjectItem = React.memo(({ project, onDeleteProject, handleRouter, getHref, recentlyMovedIds, onToggleVisibility }) => {
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

  const wasRecentlyMoved = recentlyMovedIds?.has(project._id) ?? false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`w-full relative h-full flex flex-col ${isDragging ? 'relative' : ''}`}
    >
      <ProjectShape className="text-template-text-left-bg-color" />
      <div className="flex-1 flex flex-col min-h-0">
        <Chat direction="left" className="rounded-tl-none w-full h-full flex-1 flex flex-col min-h-0">
          <div className="h-full flex flex-col">
            <ProjectCard
              project={project}
              onDeleteProject={() => onDeleteProject(project)}
              edit={true}
              handleRouter={handleRouter}
              href={getHref(project._id)}
              dragHandleListeners={listeners}
              dragHandleAttributes={attributes}
              isDragging={isDragging}
              wasRecentlyMoved={wasRecentlyMoved}
              onToggleVisibility={onToggleVisibility}
            />
          </div>
        </Chat>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render)
  // Compare project object reference to prevent re-renders when only order changes
  const prevWasMoved = prevProps.recentlyMovedIds?.has(prevProps.project._id) ?? false;
  const nextWasMoved = nextProps.recentlyMovedIds?.has(nextProps.project._id) ?? false;

  // Only skip re-render if project object is the same AND moved status hasn't changed
  // AND function references are the same (they should be with useCallback)
  return (
    prevProps.project === nextProps.project &&
    prevWasMoved === nextWasMoved &&
    prevProps.onDeleteProject === nextProps.onDeleteProject &&
    prevProps.handleRouter === nextProps.handleRouter &&
    prevProps.getHref === nextProps.getHref
  );
});

export default function Builder2({ edit = false }) {
  const {
    userDetails,
    openModal,
    openSidebar,
    setSelectedProject,
    setSelectedWork,
    setSelectedReview,
    setUserDetails,
    updateCache,
  } = useGlobalContext();
  const { theme } = useTheme();

  // Get section order from userDetails or use template default
  const sectionOrder = normalizeSectionOrder(userDetails?.sectionOrder, DEFAULT_SECTION_ORDER);

  const {
    username,
    bio,
    skills,
    tools,
    projects,
    experiences,
    portfolios,
    avatar,
    socials,
    reviews,
    resume,
    firstName,
    lastName,
  } = userDetails || {};

  const about =
    userDetails?.about ??
    userDetails?.aboutMe ??
    userDetails?.about_me ??
    "";
  const hasAbout = typeof about === "string" && about.trim().length > 0;
  const router = useRouter();
  const getSkills = () => {
    if (skills.length > 1) {
      const labels = skills.map((item) => item.label);
      if (labels.length === 1) return labels[0];

      const lastLabel = labels.pop();
      return `${labels.join(", ")} and ${lastLabel}`;
    } else {
      return `${skills[0]}`;
    }
  };
  const onDeleteProject = (project) => {
    openModal(modals.deleteProject);
    setSelectedProject(project);
  };

  const handleRouter = (id) => {
    if (!edit) {
      router.push(`/project/${id}/preview`);
    } else {
      router.push(`/project/${id}/editor`);
    }
  };

  const getHref = (id) => {
    if (!edit) {
      return `/project/${id}/preview`;
    } else {
      return `/project/${id}/editor`;
    }
  };
  const handleEditWork = (work) => {
    setSelectedWork(work);
    openSidebar(sidebars.work);
  };
  const handleEditReview = (review) => {
    setSelectedReview(review);
    openSidebar(sidebars.review);
  };

  const [expandedReviewCards, setExpandedReviewCards] = useState([]);

  const toggleExpandReview = (id) => {
    setExpandedReviewCards((prev) =>
      prev.includes(id) ? prev.filter((cardId) => cardId !== id) : [...prev, id]
    );
  };

  const [expandedExperienceCards, setExpandedExperienceCards] = useState([]);

  const toggleExpandExperience = (id) => {
    setExpandedExperienceCards((prev) =>
      prev.includes(id) ? prev.filter((cardId) => cardId !== id) : [...prev, id]
    );
  };

  // Reviews sorting state and handlers
  const [showReviewSortModal, setShowReviewSortModal] = useState(false);

  const reviewSortSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleReviewSortEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = userDetails.reviews.findIndex(
      (review) => review._id === active.id
    );
    const newIndex = userDetails.reviews.findIndex(
      (review) => review._id === over.id
    );

    const sortedReviews = arrayMove(
      userDetails.reviews,
      oldIndex,
      newIndex
    );

    setUserDetails((prev) => ({ ...prev, reviews: sortedReviews }));
    _updateUser({ reviews: sortedReviews }).then((res) =>
      updateCache("userDetails", res?.data?.user)
    );
  };

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

  // Track recently moved items to prevent navigation after drag
  const [recentlyMovedIds, setRecentlyMovedIds] = useState(new Set());

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = userDetails.projects.findIndex(
      (project) => project._id === active.id
    );
    const newIndex = userDetails.projects.findIndex(
      (project) => project._id === over.id
    );

    const sortedProjects = arrayMove(
      userDetails.projects,
      oldIndex,
      newIndex
    );

    // Mark all items that were in the affected range as recently moved
    const minIndex = Math.min(oldIndex, newIndex);
    const maxIndex = Math.max(oldIndex, newIndex);
    const movedIds = new Set();
    for (let i = minIndex; i <= maxIndex; i++) {
      movedIds.add(sortedProjects[i]._id);
    }

    // Update state to trigger re-render with new recently moved IDs
    setRecentlyMovedIds(movedIds);

    const payload = { projects: sortedProjects };

    // Update state optimistically first (before API call) to prevent remounts
    setUserDetails((prev) => ({
      ...prev,
      projects: sortedProjects,
    }));

    _updateUser(payload).then((res) => {
      // Update cache with only the projects array order, preserving existing project objects
      // This prevents remounts while keeping cache in sync
      if (res?.data?.user?.projects) {
        updateCache("userDetails", { projects: sortedProjects });
      }
    }).catch((err) => {
      console.error("Error updating project order:", err);
      // On error, revert to previous state
      setUserDetails((prev) => ({
        ...prev,
        projects: userDetails.projects,
      }));
    });

    // Clear the recently moved set after a delay
    setTimeout(() => {
      setRecentlyMovedIds(new Set());
    }, 300);
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
  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        <div className="flex gap-2 items-end">
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "w-[76px] h-[76px] rounded-[24px] flex items-center justify-center relative overflow-hidden",
                  !userDetails?.avatar ? "bg-[#FFB088]" : ""
                )}
              >
                <DfImage
                  src={getUserAvatarImage(userDetails)}
                  className="w-full h-full"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              sideOffset={8}
              avoidCollisions={true}
              className="bg-tooltip-bg-color text-tooltip-text-color border-0 px-4 py-2 rounded-xl flex items-center gap-2 shadow-xl"
            >
              <span className="text-sm font-medium">Happy to have you here</span>
              <img src="/assets/png/handshake.png" alt="Handshake" className="w-5 h-5 object-contain" />
            </TooltipContent>
          </Tooltip>
          <div>
            <Chat direction="left">
              Hey there! I'm {firstName} {lastName}
            </Chat>
          </div>
        </div>

        <Chat direction="left">
          {bio}
          {edit && (
            <div>
              <ButtonNew
                onClick={() => openModal(modals.onboarding)}
                className="h-11 w-11"
                variant="secondary"
              >
                <PencilIcon className="text-df-icon-color cursor-pointer" />
              </ButtonNew>
            </div>
          )}
        </Chat>

        {/* Sections rendered in order based on sectionOrder */}
        {sectionOrder.map((sectionId) => {
          if (sectionId === 'about') {
            if (!edit && !hasAbout) return null;
            return (
              <div key="about" id="section-about" className="flex flex-col gap-6">
                <Chat direction="right">Tell me a little about yourself?</Chat>
                <Chat direction="left">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <AboutMeContent
                        userDetails={userDetails}
                        edit={edit}
                        variant="default"
                        textClassName="text-df-base-text-color"
                      />
                    </div>
                    {edit && (
                      <ButtonNew
                        onClick={() => openModal(modals.about)}
                        className="h-11 w-11 shrink-0"
                        variant="secondary"
                        size="icon"
                      >
                        <PencilIcon className="text-df-icon-color cursor-pointer" />
                      </ButtonNew>
                    )}
                  </div>
                </Chat>
              </div>
            );
          }
          if (sectionId === 'projects') {
            return (
              <div key="projects" id="section-projects" className="flex flex-col gap-6">
                <Chat direction="right">
                  So… what have you been working on lately?
                </Chat>
                <Chat direction="left">  Glad you asked 😌 <br />
                  Here are a few things I’ve built.</Chat>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={projects?.map((p) => p._id) || []}
                    strategy={rectSortingStrategy}
                  >
                    <div className="list grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                      {projects?.map((project) => (
                        <SortableProjectItem
                          key={project._id}
                          project={project}
                          onDeleteProject={onDeleteProject}
                          handleRouter={handleRouter}
                          getHref={getHref}
                          recentlyMovedIds={recentlyMovedIds}
                          onToggleVisibility={handleToggleVisibility}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                {edit && (
                  <div className="w-full md:w-[calc(50%-12px)] max-w-[444px] relative">
                    <ProjectShape className="text-template-text-left-bg-color" />
                    <Chat direction="left" className={cn("rounded-tl-none", projects.length <= 1 ? "w-full" : "w-fit")}>
                      {projects.length > 1 ? (
                        userDetails?.pro || userDetails?.projects.length < 1 ? (
                          <div className="flex items-center gap-2">
                            <Button
                              text={"Add case study"}
                              customClass="w-fit gap-1  items-center"
                              onClick={() => openModal(modals.project)}
                              icon={
                                <PlusIcon className="text-primary-btn-text-color w-[20px] h-[20px] mb-[2px] cursor-pointer" />
                              }
                            />
                            <span className="inline-flex items-center leading-none h-full">
                              or
                            </span>
                            <Button
                              text={"Write with AI"}
                              type="secondary"
                              customClass="w-fit gap-1 items-center"
                              icon={
                                <AiIcon className="text-secondary-btn-text-color w-[22px] h-[22px] mb-[2px] cursor-pointer" />
                              }
                              onClick={() => openModal(modals.aiProject)}
                            />
                          </div>
                        ) : (
                          <ProjectLock />
                        )
                      ) : (
                        <AddCard
                          title={`${projects?.length === 0
                            ? "Upload your first case study"
                            : "Add case study"
                            }`}
                          subTitle="Show off your best work."
                          first={projects?.length !== 0}
                          buttonTitle="Add case study"
                          secondaryButtonTitle="Write using AI"
                          onClick={() => openModal(modals.project)}
                          icon={<MemoCasestudy className="cursor-pointer size-[72px]" />}
                          openModal={openModal}
                          className="flex justify-center items-center flex-col p-4 w-full"
                        />
                      )}
                    </Chat>
                  </div>
                )}
              </div>
            );
          }

          if (sectionId === 'reviews') {
            return (
              <div key="reviews" id="section-reviews" className="flex flex-col gap-6">
                <Chat direction="right">What do people usually say about working with you?
                </Chat>
                <Chat direction="left">
                  Here’s what some very kind humans had to say 🫶
                </Chat>
                <Chat direction="left">
                  {edit && reviews?.length == 0 && (
                    <AddCard
                      title={`${userDetails?.reviews?.length == 0
                        ? "My testimonials"
                        : "Add more reviews"
                        } `}
                      subTitle="Share colleague's feedback."
                      onClick={() => openSidebar(sidebars.review)}
                      className={
                        "flex justify-center items-center flex-col p-4 w-[340px]"
                      }
                      first={userDetails?.reviews?.length !== 0}
                      buttonTitle="Add testimonial"
                      icon={<MemoTestimonial className="cursor-pointer size-[72px]" />}
                    />
                  )}
                  <div className="space-y-4">
                    {reviews?.map((review) => {
                      const isExpanded = expandedReviewCards.includes(review?._id);
                      const plainTextLength = getPlainTextLength(review?.description || "");
                      const shouldShowToggle = plainTextLength > 180;

                      return (
                        <div key={review?._id} className="border border-tools-card-item-border-color p-5 rounded-2xl">
                          <Quote />
                          <div className="mt-4 text-df-base-text-color">
                            <div className={shouldShowToggle && !isExpanded ? "max-h-[110px] overflow-hidden relative" : ""}>
                              <SimpleTiptapRenderer
                                content={review?.description || ""}
                                mode="review"
                                enableBulletList={false}
                                className="bg-card rounded-none shadow-none"
                              />
                              {shouldShowToggle && !isExpanded && (
                                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                              )}
                            </div>
                            {shouldShowToggle && (
                              <button
                                onClick={() => toggleExpandReview(review?._id)}
                                className="mt-2 text-foreground/80 hover:text-foreground inline-flex items-center gap-1 underline underline-offset-4"
                              >
                                {isExpanded ? (
                                  <>
                                    Show Less
                                    <ChevronUp className="h-3 w-3" />
                                  </>
                                ) : (
                                  <>
                                    View More
                                    <ChevronDown className="h-3 w-3" />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-4">
                            <Avatar className="w-12 h-12 shrink-0">
                              <AvatarImage src={review?.avatar?.url || review?.avatar} alt={review?.name} />
                              <AvatarFallback
                                style={{
                                  backgroundColor: "#FF9966",
                                  color: "#FFFFFF",
                                  fontWeight: 500,
                                }}
                              >
                                {review?.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              {review.linkedinLink && review.linkedinLink !== "" ? (
                                <a
                                  href={review.linkedinLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-blue-500"
                                >
                                  <MemoLinkedin className="text-df-icon-color w-4 h-4" />
                                  <span className="font-semibold cursor-pointer text-base">{review?.name}</span>
                                </a>
                              ) : (
                                <h3 className="font-semibold text-base mb-0">{review?.name}</h3>
                              )}
                              <p className="text-sm text-df-description-color">
                                {review?.role ? `${review.role}, ` : ""}
                                {review?.company}
                              </p>
                            </div>
                            {edit && (
                              <Button
                                size="icon"
                                onClick={() => handleEditReview(review)}
                                type={"secondary"}
                                icon={
                                  <EditIcon className="text-df-icon-color cursor-pointer text-2xl" />
                                }
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {edit && reviews?.length > 0 && (
                    <div className="flex items-center gap-2 mt-4">
                      <AddItem
                        className="flex-1"
                        title="Add testimonial"
                        onClick={() => openSidebar(sidebars.review)}
                        iconLeft={
                          userDetails?.reviews?.length > 0 ? (
                            <Button
                              type="secondary"
                              icon={
                                <PlusIcon className="text-secondary-btn-text-color w-[12px] h-[12px] cursor-pointer" />
                              }
                              onClick={() => openSidebar(sidebars.review)}
                              size="small"
                            />
                          ) : (
                            <MemoWorkExperience />
                          )
                        }
                        theme={theme}
                      />
                      {reviews.length > 1 && (
                        <ButtonNew
                          variant="secondary"
                          size="icon"
                          onClick={() => {
                            setShowReviewSortModal(true);
                          }}
                          className="rounded-full h-14 w-14"
                        >
                          <SortIcon className="w-4 h-4 text-df-icon-color cursor-pointer" />
                        </ButtonNew>
                      )}
                    </div>
                  )}
                </Chat>
              </div>
            );
          }

          if (sectionId === 'tools') {
            return (
              <div key="tools" id="section-tools" className="flex flex-col gap-6">
                <Chat direction="right">What do you actually use to build all this?</Chat>
                <Chat direction="left"> A mix of design, code, and a bit of chaos 😄<br />
                  But mostly:</Chat>
                <Chat>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {tools?.map((tool, i) => (
                      <div
                        title={tool?.label}
                        key={i}
                        className={`cursor-default h-full flex gap-2 justify-between items-center bg-tools-card-item-bg-color text-tools-card-item-text-color border-tools-card-item-border-color  border border-solid rounded-[16px] p-3`}
                      >
                        {tool?.image && (
                          <img
                            src={tool?.image}
                            alt={tool?.label}
                            className="w-[34px] h-[34px] "
                          />
                        )}
                        <Text size="p-xsmall" className="text-tools-card-item-text-color">
                          {tool?.label}
                        </Text>
                      </div>
                    ))}
                    {edit && (
                      <Button
                        type="secondary"
                        icon={
                          <PlusIcon className="text-secondary-btn-text-color w-[18px] h-[18px] cursor-pointer" />
                        }
                        size="icon"
                        onClick={() => openModal(modals.tools)}
                      />
                    )}
                  </div>
                  This is my toolbox.
                </Chat>
                <Chat>I specialize in {getSkills()}</Chat>
              </div>
            );
          }

          if (sectionId === 'works') {
            return (
              <div key="works" id="section-works" className="flex flex-col gap-6">
                <Chat direction="right"> Where have you worked so far?
                </Chat>
                <Chat direction="left"> Here’s a quick look at my design journey 👇</Chat>
                <Chat direction="left" className="pb-5">
                  <div className="flex flex-col gap-6">
                    {experiences?.map((experience, index) => {
                      const isExpanded = expandedExperienceCards.includes(experience?._id);
                      const plainTextLength = getPlainTextLength(experience?.description || "");
                      const shouldShowToggle = plainTextLength > 200;

                      return (
                        <div key={experience?._id}>
                          <div className="flex justify-between items-center">
                            <Text
                              size="p-xsmall"
                              className="font-medium text-df-base-text-color"
                            >
                              {experience?.company}
                            </Text>
                            <Button
                              onClick={() => handleEditWork(experience)}
                              customClass="!p-[13.38px] !flex-shrink-0"
                              type={"secondary"}
                              size="icon"
                              icon={
                                <EditIcon className="text-df-icon-color cursor-pointer" />
                              }
                            />
                          </div>
                          <div className="flex">
                            <ExperienceShape className="w-[54px] relative bottom-2" />{" "}
                            <div className="mt-[8px] flex-1">
                              <Text
                                size="p-small"
                                className="font-semibold text-df-base-text-color"
                              >
                                {experience?.role}
                              </Text>
                              <Text
                                size="p-xsmall"
                                className="font-medium mt-[6px] text-df-description-color"
                              >
                                {`${experience?.startMonth} ${experience?.startYear} - ${experience?.currentlyWorking
                                  ? "Present"
                                  : `${experience?.endMonth} ${experience?.endYear}`
                                  }  `}
                              </Text>
                              <div className="text-df-base-text-color mt-4">
                                <div className={shouldShowToggle && !isExpanded ? "max-h-[110px]  overflow-hidden relative" : ""}>
                                  <SimpleTiptapRenderer
                                    content={experience?.description || ""}
                                    mode="work"
                                    enableBulletList={true}
                                  />
                                  {shouldShowToggle && !isExpanded && (
                                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                                  )}
                                </div>
                                {shouldShowToggle && (
                                  <button
                                    onClick={() => toggleExpandExperience(experience?._id)}
                                    className="mt-2 text-foreground/80 hover:text-foreground inline-flex items-center gap-1 underline underline-offset-4"
                                  >
                                    {isExpanded ? (
                                      <>
                                        Show Less
                                        <ChevronUp className="h-3 w-3" />
                                      </>
                                    ) : (
                                      <>
                                        View More
                                        <ChevronDown className="h-3 w-3" />
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {edit && (
                      <AddItem
                        title="Add your work experience"
                        onClick={() => openSidebar(sidebars.work)}
                        iconLeft={
                          userDetails?.experiences?.length > 0 ? (
                            <Button
                              type="secondary"
                              icon={
                                <PlusIcon className="text-secondary-btn-text-color w-[12px] h-[12px] cursor-pointer" />
                              }
                              onClick={() => openSidebar(sidebars.work)}
                              size="small"
                            />
                          ) : (
                            <div className="flex items-center">
                              <MemoWorkExperience />
                            </div>
                          )
                        }
                        iconRight={
                          userDetails?.experiences?.length == 0 ? (
                            <Button
                              type="secondary"
                              icon={
                                <PlusIcon className="text-secondary-btn-text-color w-[12px] h-[12px] cursor-pointer" />
                              }
                              onClick={() => openSidebar(sidebars.work)}
                              size="small"
                            />
                          ) : (
                            false
                          )
                        }
                        theme={theme}
                      />
                    )}
                  </div>
                </Chat>
              </div>
            );
          }
          return null;
        })}
        <Chat direction="right">Got any other places I should check out?</Chat>
        <Chat direction="left" className="pb-5">
          <div className="flex flex-col lg:flex-row gap-[24px]">
            {portfolios?.dribbble && (
              <Link
                href={portfolios?.dribbble}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  text={"Dribbble"}
                  type="secondary"
                  icon={
                    <DribbbleIcon className="text-df-icon-color cursor-pointer" />
                  }
                />
              </Link>
            )}
            {portfolios?.behance && (
              <Link
                href={portfolios?.behance}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  text={"Behance"}
                  type="secondary"
                  icon={
                    <BehanceIcon className="text-df-icon-color cursor-pointer" />
                  }
                />
              </Link>
            )}
            {portfolios?.notion && (
              <Link
                href={portfolios?.notion}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  text={"Notion"}
                  type="secondary"
                  icon={
                    <NotionIcon className="text-df-icon-color cursor-pointer" />
                  }
                />
              </Link>
            )}
            {portfolios?.medium && (
              <Link
                href={portfolios?.medium}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  text={"Medium"}
                  type="secondary"
                  icon={
                    <MediumIcon className="text-df-icon-color cursor-pointer" />
                  }
                />
              </Link>
            )}
          </div>
          {edit &&
            portfolios &&
            Object.values(portfolios).some((s) => s != "") && (
              <Button
                onClick={() => openModal(modals.portfolioLinks)}
                customClass="!p-[13.38px] w-fit mt-4"
                type={"secondary"}
                icon={<EditIcon className="text-df-icon-color cursor-pointer" />}
              />
            )}
          {edit &&
            (portfolios == undefined ||
              Object.values(portfolios).every(
                (portfolio) => portfolio == ""
              )) && (
              <AddItem
                title="Add your portfolio links"
                onClick={() => openModal("portfolio-links")}
                iconLeft={<MemoOtherlinks />}
                iconRight={
                  <Button
                    size="small"
                    type="secondary"
                    customClass="w-fit gap-0"
                    icon={
                      <PlusIcon className="text-secondary-btn-text-color w-[14px] h-[14px] cursor-pointer" />
                    }
                  />
                }
              />
            )}
        </Chat>
        <Chat direction="right">Where can I reach you?</Chat>
        <Chat direction="left">You can reach me here 👇🏻</Chat>
        <Chat direction="left" className="pb-5">
          {!resume && edit && (
            <AddItem
              title="Add your resume"
              iconLeft={<MemoResume />}
              onClick={() => openModal(modals.resume)}
              iconRight={
                <Button
                  size="small"
                  type="secondary"
                  customClass="w-fit gap-0"
                  icon={
                    <PlusIcon className="text-secondary-btn-text-color w-[14px] h-[14px] cursor-pointer" />
                  }
                />
              }
            />
          )}

          {edit && !!userDetails?.resume && (
            <>
              <a href={userDetails?.resume?.url} download={true} target="_blank">
                <Button
                  text={"Download Resume"}
                  customClass="w-full justify-start"
                  type="secondary"
                  icon={
                    <NoteIcon className="text-df-icon-color cursor-pointer" />
                  }
                />
              </a>
              <Button
                onClick={() => openModal(modals.resume)}
                type={"secondary"}
                customClass="mt-4"
                icon={<EditIcon className="text-df-icon-color cursor-pointer" />}
              />
            </>
          )}
        </Chat>
        <Chat direction="left" className="pb-5">
          <div className="flex flex-col lg:flex-row gap-[24px]">
            {socials?.instagram && (
              <Link
                href={socials?.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  text={"Instagram"}
                  type="secondary"
                  icon={
                    <InstagramIcon className="text-df-icon-color cursor-pointer" />
                  }
                />
              </Link>
            )}
            {socials?.twitter && (
              <Link
                href={socials?.twitter}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  text={"Twitter"}
                  type="secondary"
                  icon={
                    <TwitterIcon className="text-df-icon-color cursor-pointer" />
                  }
                />
              </Link>
            )}
            {socials?.linkedin && (
              <Link
                href={socials?.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  text={"LinkedIn"}
                  type="secondary"
                  icon={
                    <LinkedInIcon className="text-df-icon-color cursor-pointer" />
                  }
                />
              </Link>
            )}
          </div>
          {edit && socials && Object.values(socials).some((s) => s != "") && (
            <Button
              onClick={() => openModal(modals.socialMedia)}
              customClass="!p-[13.38px] w-fit mt-4"
              type={"secondary"}
              icon={<EditIcon className="text-df-icon-color cursor-pointer" />}
            />
          )}
          {edit &&
            (socials == undefined ||
              Object.values(socials).every((social) => social == "")) && (
              <AddItem
                title="Add your social media"
                onClick={() => openModal(modals.socialMedia)}
                iconLeft={<MemoSocial />}
                iconRight={
                  <Button
                    size="small"
                    type="secondary"
                    customClass="w-fit gap-0"
                    icon={
                      <PlusIcon className="text-secondary-btn-text-color w-[14px] h-[14px] cursor-pointer" />
                    }
                  />
                }
              />
            )}
        </Chat>

        {/* Reviews Sort Modal */}
        <SortableModal
          show={showReviewSortModal}
          onClose={() => setShowReviewSortModal(false)}
          items={userDetails?.reviews?.map((review) => review._id) || []}
          onSortEnd={handleReviewSortEnd}
          sensors={reviewSortSensors}
        >
          {userDetails?.reviews?.map((review) => (
            <SortableReviewItemBuilder2
              key={review._id}
              review={review}
              edit={edit}
            />
          ))}
        </SortableModal>

        <div
          className="flex justify-center mt-10"
          style={{ pointerEvent: "all" }}
        >
          <a href="#">
            <GoUp className="animate-bounce cursor-pointer" />
          </a>
        </div>
      </div>
    </TooltipProvider>
  );
}

const SortableReviewItemBuilder2 = ({ review, edit }) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex justify-between gap-4 items-center ${isDragging ? 'relative' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <ReviewCard review={review} sorting={true} edit={edit} />
      </div>
      <div className="flex-shrink-0">
        <DragHandle listeners={listeners} attributes={attributes} />
      </div>
    </div>
  );
};
