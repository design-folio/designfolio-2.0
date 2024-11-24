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
import { useRouter } from "next/router";
import { chatBubbleItems } from "@/lib/constant";
export default function Template2({ userDetails, preview = false }) {
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
  const [activeBubbles, setActiveBubbles] = useState(["name"]);

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
  const onDeleteProject = () => {};

  const handleRouter = (id) => {
    if (preview) {
      router.push(`/project/${id}/preview`);
    } else {
      router.push(`/project/${id}`);
    }
  };

  const isBubbleActive = (name) => {
    return activeBubbles.includes(name);
  };

  const handleLoading = (name) => {
    setActiveBubbles((prev) => [...prev, name]);
  };
  console.log(activeBubbles);

  const isProjectQuestionPresent = () => {
    if (
      isBubbleActive(chatBubbleItems.tools) &&
      isBubbleActive(chatBubbleItems.projectQuestion) &&
      projects &&
      projects.length > 0
    ) {
      return true;
    } else {
      return false;
    }
  };

  const isWorkExperiencePresent = () => {
    if (
      ((isBubbleActive(chatBubbleItems.tools) &&
        isBubbleActive(chatBubbleItems.projectQuestion) &&
        !isProjectQuestionPresent()) ||
        isBubbleActive(chatBubbleItems.workExperience)) &&
      experiences &&
      experiences.length != 0
    ) {
      return true;
    } else {
      return false;
    }
  };

  const isOtherPortfolioPresent = () => {
    if (
      (isBubbleActive(chatBubbleItems.tools) &&
        isBubbleActive(chatBubbleItems.projects) &&
        isBubbleActive(chatBubbleItems.experience) &&
        !isWorkExperiencePresent() &&
        !isProjectQuestionPresent()) ||
      (isBubbleActive(chatBubbleItems.otherPortfolioQuestion) &&
        portfolios &&
        Object?.keys(portfolios)?.length != 0)
    ) {
      return true;
    } else {
      return false;
    }
  };

  const isSocilaMediaPresent = () => {
    if (
      (isBubbleActive(chatBubbleItems.tools) &&
        isBubbleActive(chatBubbleItems.projects) &&
        isBubbleActive(chatBubbleItems.experience) &&
        isBubbleActive(chatBubbleItems.otherPortfolios) &&
        !isWorkExperiencePresent() &&
        !isProjectQuestionPresent() &&
        !isOtherPortfolioPresent()) ||
      (isBubbleActive(chatBubbleItems.socialMediaQuestion) &&
        socials &&
        Object?.keys(socials)?.length != 0)
    ) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <div className={`max-w-[890px] mx-auto py-[40px] px-2 md:px-4 lg:px-0`}>
      <div className="flex flex-col gap-6">
        <div className="flex gap-2 items-end">
          <DfImage
            src={avatar?.url ? avatar?.url : "/assets/svgs/avatar.svg"}
            className={"w-[76px] h-[76px] rounded-[24px]"}
          />
          <div>
            <Chat
              direction="left"
              delay={1000}
              onComplete={() => handleLoading("bio")}
            >
              Hey there! I'm {username}
            </Chat>
          </div>
        </div>
        {isBubbleActive("bio") && (
          <Chat
            direction="left"
            delay={400}
            onComplete={() => handleLoading("skill-question")}
          >
            {bio}
          </Chat>
        )}

        {isBubbleActive("skill-question") && (
          <Chat
            delay={100}
            direction="right"
            onComplete={() => handleLoading("skills")}
          >
            Hey! What are your core skills?
          </Chat>
        )}

        {isBubbleActive("skills") && (
          <Chat delay={1000} onComplete={() => handleLoading("tools")}>
            I specialize in {getSkills()}
          </Chat>
        )}

        {isBubbleActive("tools") && (
          <Chat
            delay={400}
            onComplete={() => handleLoading("project-question")}
          >
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
                  <Text
                    size="p-xsmall"
                    className="text-tools-card-item-text-color"
                  >
                    {tool?.label}
                  </Text>
                </div>
              ))}
            </div>
            This is my toolbox.
          </Chat>
        )}

        {isProjectQuestionPresent() && (
          <Chat
            direction="right"
            delay={400}
            onComplete={() => handleLoading("project-chat")}
          >
            Awesome! Can you share any of your recent work? Would love to see
            them
          </Chat>
        )}

        {isBubbleActive(chatBubbleItems.projectChat) && (
          <Chat
            direction="left"
            delay={200}
            onComplete={() => handleLoading("projects")}
          >
            Here you go!
          </Chat>
        )}
        {isBubbleActive(chatBubbleItems.projects) &&
          projects?.map((project, index) => {
            return (
              <div className="max-w-[444px] relative">
                <ProjectShape className="text-template-text-left-bg-color" />
                <Chat
                  direction="left"
                  className="rounded-tl-none"
                  onComplete={() => handleLoading("work-experience")}
                >
                  <ProjectCard
                    project={project}
                    onDeleteProject={onDeleteProject}
                    edit={false}
                    handleRouter={handleRouter}
                  />
                </Chat>
              </div>
            );
          })}
        {isWorkExperiencePresent() && (
          <Chat
            direction="left"
            delay={200}
            onComplete={() => handleLoading("experience")}
          >
            Also, here's more!
          </Chat>
        )}

        {isBubbleActive("experience") && (
          <Chat
            direction="left"
            className="pb-5"
            delay={200}
            onComplete={() => handleLoading("other-portfolio-question")}
          >
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
            </div>
          </Chat>
        )}
        {isOtherPortfolioPresent() && (
          <Chat
            direction="right"
            delay={400}
            onComplete={() => handleLoading("other-portfolios")}
          >
            Do you have any other portfolios?
          </Chat>
        )}
        {isBubbleActive("other-portfolios") && (
          <Chat
            direction="left"
            className="pb-5"
            delay={200}
            onComplete={() => handleLoading("social-media-question")}
          >
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
          </Chat>
        )}
        {isSocilaMediaPresent() && (
          <Chat
            direction="right"
            delay={400}
            onComplete={() => handleLoading("social-media")}
          >
            Where can I reach you?
          </Chat>
        )}
        {isBubbleActive("social-media") && (
          <Chat
            direction="left"
            className="pb-5"
            delay={200}
            onComplete={() => handleLoading("scroll-up")}
          >
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
          </Chat>
        )}

        {/* {(isBubbleActive("scroll-up") ||
          isBubbleActive("other-portfolios") ||
          isBubbleActive("projects")) && (
          <div
            className="flex justify-center mt-10"
            style={{ pointerEvent: "all" }}
          >
            <a href="#">
              <GoUp className="animate-bounce cursor-pointer" />
            </a>
          </div>
        )} */}
      </div>
    </div>
  );
}
