import { sidebars } from "@/lib/constant";
import React, { useState } from "react";
import Section from "./section";
import AddItem from "./addItem";
import PlusIcon from "../../public/assets/svgs/plus.svg";
import Button from "./button";
import SortIcon from "../../public/assets/svgs/sort.svg";
import { useTheme } from "next-themes";
import MemoWorkExperience from "./icons/WorkExperience";
import { motion } from "framer-motion";
import { PencilIcon, Building, ChevronDown } from "lucide-react";
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
  const [showAllExperience, setShowAllExperience] = useState(false);
  const { theme } = useTheme();
  const workExperiences = userDetails?.experiences || [];
  const displayedExperiences = showAllExperience || workExperiences.length <= 3
    ? workExperiences
    : workExperiences.slice(0, 3);
  const { setSelectedWork } = useGlobalContext();

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
      tooltip="Reorder experience"
      onClick={() => openSidebar(sidebars.sortWorks)}
      imageClassName={"pr-4"}
    >
      <div className="space-y-4">
        {displayedExperiences.map((experience, index) => {
          return (
            <WorkExperienceCard
              key={experience?._id}
              experience={experience}
              index={index}
              showDivider={index < displayedExperiences.length - 1}
              edit={edit}
              setSelectedWork={setSelectedWork}
              openSidebar={openSidebar}
            />
          );
        })}

        {!showAllExperience && workExperiences.length > 3 && (
          <div className="mt-4 flex justify-center">
            <ButtonNew
              variant="ghost"
              size="sm"
              className="text-foreground/40 hover:text-foreground text-xs font-medium uppercase tracking-widest gap-2 group transition-all"
              onClick={() => setShowAllExperience(true)}
            >
              View More Experience
              <ChevronDown className="w-3 h-3 transition-transform group-hover:translate-y-0.5" />
            </ButtonNew>
          </div>
        )}

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

