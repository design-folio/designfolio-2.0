import { useGlobalContext } from "@/context/globalContext";
import { useRouter } from "next/router";
import React, { useState } from "react";
import DfImage from "./image";
import Chat from "./chat";
import Text from "./text";
import ProjectCard from "./ProjectCard";
import ProjectShape from "../../public/assets/svgs/project-shape.svg";
import ExperienceShape from "../../public/assets/svgs/experience-shape.svg";
import Link from "next/link";
import Button from "./button";
import DribbbleIcon from "../../public/assets/svgs/dribbble.svg";
import BehanceIcon from "../../public/assets/svgs/behance.svg";
import NotionIcon from "../../public/assets/svgs/noteIcon.svg";
import MediumIcon from "../../public/assets/svgs/medium.svg";
import InstagramIcon from "../../public/assets/svgs/instagram.svg";
import TwitterIcon from "../../public/assets/svgs/twitter.svg";
import LinkedInIcon from "../../public/assets/svgs/linkedin.svg";
import GoUp from "../../public/assets/svgs/go-up.svg";
import PlusIcon from "../../public/assets/svgs/plus.svg";
import ProjectIcon from "../../public/assets/svgs/projectIcon.svg";
import EditIcon from "../../public/assets/svgs/edit.svg";
import AiIcon from "../../public/assets/svgs/ai.svg";
import { modals } from "@/lib/constant";
import AddCard from "./AddCard";
import AddItem from "./addItem";
import { useTheme } from "next-themes";
import TextWithLineBreaks from "./TextWithLineBreaks";
import Quote from "../../public/assets/svgs/quote.svg";
import PenIcon from "../../public/assets/svgs/pen-icon.svg";
import BagIcon from "../../public/assets/svgs/bag.svg";
import PuzzleIcon from "../../public/assets/svgs/puzzle.svg";
import OthersIcon from "../../public/assets/svgs/others.svg";
import SortableList, { SortableItem } from "react-easy-sort";
import { arrayMoveImmutable as arrayMove } from "array-move";
import { _updateUser } from "@/network/post-request";
import Linkedin from "../../public/assets/svgs/linkedinIcon.svg";
import ResumeIcon from "../../public/assets/svgs/resume.svg";
import NoteIcon from "../../public/assets/svgs/noteIcon.svg";
import ProjectLock from "./projectLock";
export default function Builder2({ edit = false }) {
  const {
    userDetails,
    openModal,
    setSelectedProject,
    setSelectedWork,
    setSelectedReview,
    setUserDetails,
    updateCache,
  } = useGlobalContext();
  const { theme } = useTheme();

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
  } = userDetails || {};
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
  const handleEditWork = (work) => {
    setSelectedWork(work);
    openModal(modals.work);
  };
  const handleEditReview = (review) => {
    openModal(modals.review);
    setSelectedReview(review);
  };

  const onSortEnd = (oldIndex, newIndex) => {
    const sortedProjects = arrayMove(userDetails.projects, oldIndex, newIndex);
    const payload = { projects: sortedProjects };
    _updateUser(payload).then((res) => {
      updateCache("userDetails", res?.data?.user);
      setUserDetails((prev) => ({
        ...prev,
        projects: arrayMove(res?.data?.user?.projects, oldIndex, newIndex),
      }));
    });
  };
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 items-end">
        <DfImage
          src={avatar?.url ? avatar?.url : "/assets/svgs/avatar.svg"}
          className={"w-[76px] h-[76px] rounded-[24px]"}
        />
        <div>
          <Chat direction="left">Hey there! I'm {username}</Chat>
        </div>
      </div>

      <Chat direction="left">
        {bio}
        {edit && (
          <div>
            <Button
              onClick={() => openModal(modals.onboarding)}
              customClass="!p-[13.38px] w-fit mt-2"
              type={"secondary"}
              icon={<EditIcon className="text-df-icon-color cursor-pointer" />}
            />
          </div>
        )}
      </Chat>

      <Chat direction="right">Hey! What are your core skills?</Chat>
      <Chat>I specialize in {getSkills()}</Chat>
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
              onClick={() => openModal(modals.tools)}
            />
          )}
        </div>
        This is my toolbox.
      </Chat>

      <Chat direction="right">
        Awesome! Can you share any of your recent work? Would love to see them
      </Chat>

      <Chat direction="left">Here you go!</Chat>
      <SortableList
        onSortEnd={onSortEnd}
        className="list flex flex-col gap-6"
        draggedItemClassName="dragged"
      >
        {projects?.map((project) => {
          return (
            <SortableItem key={project._id}>
              <div className="max-w-[444px] relative">
                <ProjectShape className="text-template-text-left-bg-color" />
                <Chat direction="left" className="rounded-tl-none w-full">
                  <ProjectCard
                    project={project}
                    onDeleteProject={() => onDeleteProject(project)}
                    edit={true}
                    handleRouter={handleRouter}
                  />
                </Chat>
              </div>
            </SortableItem>
          );
        })}
      </SortableList>

      {edit && (
        <div className="max-w-[444px] relative">
          <ProjectShape className="text-template-text-left-bg-color" />
          <Chat direction="left" className="rounded-tl-none w-fit">
            {projects.length > 0 ? (
              userDetails?.pro || userDetails?.projects.length < 2 ? (
                <div className="flex items-center gap-3">
                  <Button
                    text={"Add case study"}
                    customClass="w-fit gap-1 items-center"
                    onClick={() => openModal(modals.project)}
                    icon={
                      <PlusIcon className="text-primary-btn-text-color w-[20px] h-[20px] mb-[2px] cursor-pointer" />
                    }
                  />
                  or
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
                title={`${
                  projects?.length === 0
                    ? "Upload your first case study"
                    : "Add case study"
                }`}
                subTitle="Show off your best work."
                first={projects?.length !== 0}
                buttonTitle="Add case study"
                secondaryButtonTitle="Write using AI"
                onClick={() => openModal(modals.project)}
                icon={<ProjectIcon className="cursor-pointer" />}
                openModal={openModal}
                className="flex justify-center items-center flex-col p-4"
              />
            )}
          </Chat>
        </div>
      )}
      <Chat direction="left">
        I’ve always gotten great feedback from my clients & colleagues.
      </Chat>
      <Chat direction="left">
        {edit && reviews?.length == 0 && (
          <AddCard
            title={`${
              userDetails?.reviews?.length == 0
                ? "My testimonials"
                : "Add more reviews"
            } `}
            subTitle="Share colleague's feedback."
            onClick={() => openModal(modals.review)}
            className={
              "flex justify-center items-center flex-col p-4 w-[340px]"
            }
            first={userDetails?.reviews?.length !== 0}
            buttonTitle="Add testimonial"
            icon={<PenIcon className="cursor-pointer" />}
          />
        )}

        {reviews?.map((review) => (
          <div className="border border-tools-card-item-border-color p-5 rounded-2xl">
            <Quote />
            <TextWithLineBreaks
              text={review?.description}
              color={"text-df-base-text-color mt-4"}
            />
            <div>
              <div className="flex gap-4 justify-between items-center">
                <div className="flex gap-2  mt-3">
                  <Linkedin />
                  <div>
                    <Text
                      size="p-xsmall"
                      className="text-review-card-text-color"
                    >
                      {review?.name}
                    </Text>
                    <Text
                      size="p-xxsmall"
                      className="text-review-card-description-color"
                    >
                      {review?.company}
                    </Text>
                  </div>
                </div>
                {edit && (
                  <Button
                    onClick={() => handleEditReview(review)}
                    type={"secondary"}
                    icon={
                      <EditIcon className="text-df-icon-color cursor-pointer text-2xl" />
                    }
                  />
                )}
              </div>
            </div>
          </div>
        ))}
        {edit && reviews?.length > 0 && (
          <AddItem
            title="Add testimonial"
            onClick={() => openModal(modals.review)}
            iconLeft={
              userDetails?.reviews?.length > 0 ? (
                <Button
                  type="secondary"
                  icon={
                    <PlusIcon className="text-secondary-btn-text-color w-[12px] h-[12px] cursor-pointer" />
                  }
                  onClick={() => openModal(modals.review)}
                  size="small"
                />
              ) : (
                <BagIcon />
              )
            }
            theme={theme}
            className="mt-4"
          />
        )}
      </Chat>

      <Chat direction="left">Also, here's more!</Chat>
      <Chat direction="left" className="pb-5">
        <div className="flex flex-col gap-6">
          {experiences?.map((experience, index) => {
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
                      className="font-medium mt-[6px] text-work-card-description-color"
                    >
                      {`${experience?.startMonth} ${experience?.startYear} - ${
                        experience?.currentlyWorking
                          ? "Present"
                          : `${experience?.endMonth} ${experience?.endYear}`
                      }  `}
                    </Text>
                    <TextWithLineBreaks
                      text={experience?.description}
                      color={"text-df-base-text-color mt-4"}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {edit && (
            <AddItem
              title="Add your work experience"
              onClick={() => openModal(modals.work)}
              iconLeft={
                userDetails?.experiences?.length > 0 ? (
                  <Button
                    type="secondary"
                    icon={
                      <PlusIcon className="text-secondary-btn-text-color w-[12px] h-[12px] cursor-pointer" />
                    }
                    onClick={() => openModal(modals.work)}
                    size="small"
                  />
                ) : (
                  <BagIcon />
                )
              }
              iconRight={
                userDetails?.experiences?.length == 0 ? (
                  <Button
                    type="secondary"
                    icon={
                      <PlusIcon className="text-secondary-btn-text-color w-[12px] h-[12px] cursor-pointer" />
                    }
                    onClick={() => openModal(modals.work)}
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
      <Chat direction="right">Do you have any other portfolios?</Chat>
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
              iconLeft={<OthersIcon className="text-df-icon-color" />}
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
      <Chat direction="left" className="pb-5">
        {!resume && edit && (
          <AddItem
            title="Add your resume"
            iconLeft={<ResumeIcon className="text-df-icon-color" />}
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
              iconLeft={<PuzzleIcon className="text-df-icon-color" />}
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
      <div
        className="flex justify-center mt-10"
        style={{ pointerEvent: "all" }}
      >
        <a href="#">
          <GoUp className="animate-bounce cursor-pointer" />
        </a>
      </div>
    </div>
  );
}
