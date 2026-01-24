import { sidebars } from "@/lib/constant";
import { _updateUser } from "@/network/post-request";
import React, { useContext, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Section from "./section";
import WorkCard from "./workCard";
import AddItem from "./addItem";
import PlusIcon from "../../public/assets/svgs/plus.svg";
import Button from "./button";
import Modal from "./modal";
import Text from "./text";
import CloseIcon from "../../public/assets/svgs/close.svg";
import SortIcon from "../../public/assets/svgs/sort.svg";
import { useTheme } from "next-themes";
import MemoWorkExperience from "./icons/WorkExperience";
import DragHandle from "./DragHandle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { PencilIcon, ChevronDown, ChevronUp } from "lucide-react";
import SimpleTiptapRenderer from "./SimpleTiptapRenderer";
import { useGlobalContext } from "@/context/globalContext";
import { Button as ButtonNew } from "./ui/buttonNew";
import { getPlainTextLength } from "@/lib/tiptapUtils";

export default function Works({
  edit,
  openSidebar,
  userDetails,
  setUserDetails,
  updateCache,
}) {
  const scrollContainerRef = useRef(null); // Ref for the scrollable container
  const [showModal, setShowModal] = useState(false);
  const { theme } = useTheme();
  const { setSelectedWork } = useGlobalContext();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = userDetails.experiences.findIndex(
      (exp) => exp._id === active.id
    );
    const newIndex = userDetails.experiences.findIndex(
      (exp) => exp._id === over.id
    );

    const sortedExperiences = arrayMove(
      userDetails.experiences,
      oldIndex,
      newIndex
    );

    setUserDetails((prev) => ({ ...prev, experiences: sortedExperiences }));
    _updateUser({ experiences: sortedExperiences }).then((res) =>
      updateCache("userDetails", res?.data?.user)
    );
  };

  return (
    <Section
      wallpaper={userDetails?.wallpaper}
      title={"Work experience"}
      edit={edit}
      className="!w-fit !h-fit"
      btnType="normal"
      icon={
        userDetails?.experiences?.length != 0 && (
          <SortIcon className="w-4 h-4 text-df-icon-color cursor-pointer" />
        )
      }
      onClick={() => {
        setShowModal(true);
      }}
      imageClassName={"pr-4"}
    >
      <div className="space-y-4">
        {userDetails?.experiences?.map((experience, index) => {
          return (
            <WorkExperienceCard
              key={experience?._id}
              experience={experience}
              index={index}
              edit={edit}
              setSelectedWork={setSelectedWork}
              openSidebar={openSidebar}
            />
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
                <MemoWorkExperience />
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
      <Modal show={showModal}>
        <div className="rounded-2xl flex flex-col justify-between  m-auto lg:w-[500px] max-h-[550px] my-auto overflow-hidden bg-modal-bg-color">
          <div className="flex p-5 justify-between items-center">
            <Text size="p-small" className="font-semibold">
              Change the order
            </Text>
            <Button
              // customClass="lg:hidden"
              type="secondary"
              customClass="!p-2"
              icon={<CloseIcon className="text-icon-color cursor-pointer" />}
              onClick={() => {
                setShowModal(false);
              }}
            />
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={userDetails?.experiences?.map((exp) => exp._id) || []}
              strategy={verticalListSortingStrategy}
            >
              <div
                ref={scrollContainerRef}
                className="flex flex-col gap-[24px] py-5 list-none max-h-[450px] overflow-auto "
              >
                {userDetails?.experiences?.map((experience) => (
                  <SortableItem
                    key={experience._id}
                    experience={experience}
                    edit={edit}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="h-5" />
        </div>
      </Modal>
    </Section>
  );
}

const WorkExperienceCard = ({ experience, index, edit, setSelectedWork, openSidebar }) => {
  const [expandedCards, setExpandedCards] = useState([]);

  const toggleExpand = (id) => {
    setExpandedCards((prev) =>
      prev.includes(id) ? prev.filter((cardId) => cardId !== id) : [...prev, id]
    );
  };

  const isExpanded = expandedCards.includes(experience?._id);
  const plainTextLength = getPlainTextLength(experience?.description || "");
  const hasDescription = experience?.description && plainTextLength > 0;
  const shouldShowToggle = plainTextLength > 100; // Show toggle for descriptions longer than ~2 lines

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group flex gap-5 p-3 rounded-2xl border border-border/30 bg-work-experience-bg-color hover-elevate transition-all duration-300"
    >
      <div className="shrink-0">
        <Avatar className="w-12 h-12 rounded-xl border border-border/50">
          <AvatarImage
            src={
              experience?.logo && !experience.logo.includes('dicebear')
                ? experience.logo
                : `https://api.dicebear.com/7.x/initials/svg?seed=${experience?.company?.substring(0, 2)?.toUpperCase() || 'CO'}`
            }
            alt={experience?.company}
          />
          <AvatarFallback className="bg-muted text-xs">
            {experience?.company?.substring(0, 2)?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-base truncate">
            {experience?.role}
          </h3>
          <span className="text-xs font-medium text-foreground-landing/40 shrink-0">
            {`${experience?.startMonth} ${experience?.startYear} - ${experience?.currentlyWorking
              ? "Present"
              : `${experience?.endMonth} ${experience?.endYear}`
              }`}
          </span>
        </div>
        <div className={`flex items-center gap-2 ${hasDescription ? 'mb-2' : ''}`}>
          <span className="text-sm font-medium text-foreground-landing/60">
            {experience?.company}
          </span>
        </div>
        {hasDescription && (
          <div className="text-sm text-foreground-landing/50 leading-relaxed">
            {shouldShowToggle && !isExpanded ? (
              <div className="line-clamp-2">
                <SimpleTiptapRenderer
                  content={experience?.description || ""}
                  mode="work"
                  enableBulletList={true}
                />
              </div>
            ) : (
              <SimpleTiptapRenderer
                content={experience?.description || ""}
                mode="work"
                enableBulletList={true}
              />
            )}
            {shouldShowToggle && (
              <button
                onClick={() => toggleExpand(experience?._id)}
                className="mt-2 text-foreground-landing/80 hover:text-foreground-landing inline-flex items-center gap-1 underline underline-offset-4"
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
        )}
      </div>

      {edit && (
        <ButtonNew
          className="h-11 w-11 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => {
            setSelectedWork(experience);
            openSidebar(sidebars.work);
          }}
          variant={"secondary"}
          size="icon"
        >
          <PencilIcon className="text-df-icon-color cursor-pointer" />
        </ButtonNew>
      )}
    </motion.div>
  );
};

const SortableItem = ({ experience, edit }) => {
  const { theme } = useTheme();
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white px-5 flex justify-between gap-5 items-start dark:bg-[#23252F] ${isDragging ? 'relative' : ''}`}
    >
      <div className="flex-1">
        <WorkCard work={experience} show={false} sorting={true} />
      </div>
      <DragHandle listeners={listeners} attributes={attributes} />
    </div>
  );
};
