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
import EditIcon2 from "../../public/assets/svgs/editIcon2.svg";
import PlusIcon from "../../public/assets/svgs/plus.svg";
import AiIcon from "../../public/assets/svgs/ai.svg";
import ProjectIcon from "../../public/assets/svgs/projectIcon.svg";

import { modals } from "@/lib/constant";
import AddCard from "./AddCard";

export default function Builder2({ edit = false }) {
  const { userDetails, openModal, setSelectedProject } = useGlobalContext();

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
    if (edit) {
      router.push(`/project/${id}/preview`);
    } else {
      router.push(`/project/${id}/editor`);
    }
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
          <Button
            icon={
              <EditIcon2 className="text-secondary-btn-text-color cursor-pointer" />
            }
            customClass="w-fit mt-2"
            type="secondary"
            onClick={() => openModal(modals.onboarding)}
          />
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
        These are my toolbox.
      </Chat>

      <Chat direction="right">
        Awesome! Can you share any of your recent work? Would love to see them
      </Chat>

      <Chat direction="left">Here you go!</Chat>
      {projects?.map((project, index) => {
        return (
          <div className="max-w-[444px] relative">
            <ProjectShape className="text-template-text-left-bg-color" />
            <Chat direction="left" className="rounded-tl-none">
              <ProjectCard
                project={project}
                onDeleteProject={() => onDeleteProject(project)}
                edit={true}
                handleRouter={handleRouter}
              />
            </Chat>
          </div>
        );
      })}
      {edit && (
        <div className="max-w-[444px] relative">
          <ProjectShape className="text-template-text-left-bg-color" />
          <Chat direction="left" className="rounded-tl-none">
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
              className="flex justify-center items-center flex-col"
            />
          </Chat>
        </div>
      )}
      <Chat direction="left">Also, here's more!</Chat>
      <Chat direction="left" className="pb-5">
        <div className="flex flex-col gap-6">
          {experiences?.map((experience, index) => {
            return (
              <div key={experience?._id}>
                <Text size="p-xsmall" className="font-medium">
                  {experience?.company}
                </Text>
                <div className="flex">
                  <ExperienceShape className="w-[54px]" />
                  <div className="mt-[14px] flex-1">
                    <Text size="p-small" className="font-semibold">
                      {experience?.role}
                    </Text>
                    <Text size="p-xsmall" className="font-medium mt-[6px]">
                      Jan 2023 - Now
                    </Text>
                    <p
                      className={`text-[16px] font-light leading-[22.4px] font-inter`}
                      dangerouslySetInnerHTML={{
                        __html: experience?.description,
                      }}
                    ></p>
                  </div>
                </div>
              </div>
            );
          })}
          {edit && (
            <Button
              icon={
                <EditIcon2 className="text-secondary-btn-text-color cursor-pointer" />
              }
              customClass="w-fit mt-2"
              type="secondary"
              onClick={() => openModal(modals.work)}
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
        {edit && (
          <Button
            icon={
              <EditIcon2 className="text-secondary-btn-text-color cursor-pointer" />
            }
            customClass="w-fit mt-2"
            type="secondary"
            onClick={() => openModal(modals.portfolioLinks)}
          />
        )}
      </Chat>
      <Chat direction="right">Where can I reach you?</Chat>
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
        {edit && (
          <Button
            icon={
              <EditIcon2 className="text-secondary-btn-text-color cursor-pointer" />
            }
            customClass="w-fit mt-2"
            type="secondary"
            onClick={() => openModal(modals.socialMedia)}
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
