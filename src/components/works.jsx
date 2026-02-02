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
import { motion } from "framer-motion";
import { PencilIcon, Building } from "lucide-react";
import ClampableTiptapContent from "./ClampableTiptapContent";
import { getPlainTextLength } from "@/lib/tiptapUtils";
import { useGlobalContext } from "@/context/globalContext";
import { Button as ButtonNew } from "./ui/buttonNew";

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
      className="!h-fit"
      sectionId="works"
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
              showDivider={index < (userDetails?.experiences?.length || 0) - 1}
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

const WorkExperienceCard = ({ experience, index, edit, setSelectedWork, openSidebar, showDivider }) => {
  const [expandedCards, setExpandedCards] = useState([]);

  const toggleExpand = (id) => {
    setExpandedCards((prev) =>
      prev.includes(id) ? prev.filter((cardId) => cardId !== id) : [...prev, id]
    );
  };

  const hasDescription = experience?.description && getPlainTextLength(experience?.description || "") > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-1 md:gap-6">
        <div className="shrink-0">
          <span className="text-xs font-medium text-foreground-landing/40 uppercase tracking-wider">
            {`${experience?.startMonth} ${experience?.startYear} - ${experience?.currentlyWorking
              ? "Present"
              : `${experience?.endMonth} ${experience?.endYear}`
              }`}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                <h3 className="font-semibold text-base text-foreground-landing truncate">
                  {experience?.role}
                </h3>
                <span className="text-foreground-landing/30">at</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Building className="w-4 h-4 text-foreground-landing/40 shrink-0" />
                  <span className="font-semibold text-base text-foreground-landing truncate">
                    {experience?.company}
                  </span>
                </div>
              </div>

              {hasDescription && (
                <div className="text-sm text-foreground-landing/60 leading-relaxed max-w-xl">
                  <ClampableTiptapContent
                    content={experience?.description || ""}
                    mode="work"
                    enableBulletList={true}
                    maxLines={3}
                    itemId={experience?._id}
                    expandedIds={expandedCards}
                    onToggleExpand={toggleExpand}
                    buttonClassName="mt-2 text-foreground-landing/80 hover:text-foreground-landing inline-flex items-center gap-1 underline underline-offset-4"
                  />
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
          </div>
        </div>
      </div>

      {showDivider && <div className="mt-6 border-b border-border/10" />}
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
