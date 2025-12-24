import React, { useEffect, useState } from "react";
import DfImage from "./image";
import Chat from "./chat";
import Text from "./text";
import ProjectCard from "./ProjectCard";
import ProjectShape from "../../public/assets/svgs/project-shape.svg";
import ExperienceShape from "../../public/assets/svgs/experience-shape.svg";
import Link from "next/link";
import Button from "./button";
import { Button as ButtonNew } from "./ui/buttonNew"
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
import Quote from "../../public/assets/svgs/quote.svg";
import SimpleTiptapRenderer from "./SimpleTiptapRenderer";
import Linkedin from "../../public/assets/svgs/linkedinIcon.svg";
import { useGlobalContext } from "@/context/globalContext";
import LeftArrow from "../../public/assets/svgs/left-arrow.svg";
import NoteIcon from "../../public/assets/svgs/noteIcon.svg";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import MemoLeftArrow from "./icons/LeftArrow";
import { cn } from "@/lib/utils";
import { getPlainTextLength } from "@/lib/tiptapUtils";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Template2({ userDetails, preview = false }) {
  const {
    bio,
    skills,
    tools,
    projects,
    experiences,
    portfolios,
    avatar,
    socials,
    reviews,
    introduction,
    resume,
    username,
    firstName,
    lastName
  } = userDetails || {};
  const router = useRouter();
  const { projectRef, setCursor } = useGlobalContext();

  const [activeStep, setActiveStep] = useState(1);

  const portfolioCheck =
    portfolios &&
    !Object.values(portfolios).every((portfolio) => portfolio == "");

  useEffect(() => {
    setCursor(userDetails?.cursor ? userDetails?.cursor : 0);
  }, [userDetails?.cursor, setCursor]);

  useEffect(() => {
    if (activeStep === 6 && projects && projects.length === 0) {
      setActiveStep((prev) => prev + 1); // update step when no projects exist
    } else if (activeStep === 7 && projects && projects.length === 0) {
      setActiveStep((prev) => prev + 1); // update step when no projects exist
    } else if (activeStep === 8 && reviews && reviews.length === 0) {
      setActiveStep((prev) => prev + 1); // update step when no reviews exist
    } else if (activeStep === 9 && experiences && experiences.length === 0) {
      setActiveStep((prev) => prev + 1); // update step when no experiences exist
    } else if (activeStep === 10 && !portfolioCheck) {
      setActiveStep((prev) => prev + 1);
    } else if (
      activeStep === 11 &&
      socials &&
      !Object.values(socials).every((social) => social != "")
    ) {
      setActiveStep((prev) => prev + 1);
    }
  }, [activeStep, projects, reviews, experiences, portfolios]);
  // Trigger effect when activeStep or projects change
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
  const onDeleteProject = () => { };

  const handleRouter = (id) => {
    if (preview) {
      router.push(`/project/${id}/preview`);
    } else {
      router.push(`/project/${id}`);
    }
  };
  const getHref = (id) => {
    if (preview) {
      return `/project/${id}/preview`;
    } else {
      return `/project/${id}`;
    }
  };

  const handleStepCompletion = () => {
    setActiveStep((prev) => prev + 1);
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
  return (
    <div
      className={`max-w-[890px] mx-auto py-[32px] lg:py-[100px] px-2 md:px-4 lg:px-0`}
    >
      {preview && (
        <Link href={"/builder"}>
          <ButtonNew
            variant="secondary"
            className="rounded-full px-4 h-9 mb-5 text-sm font-medium"
          >
            <MemoLeftArrow className="!size-2.5" />
            Exit preview
          </ButtonNew>
        </Link>
      )}
      <div className="flex flex-col gap-6">
        {activeStep >= 1 && introduction && (
          <div className="flex gap-2 items-end">
            <DfImage
              src={getUserAvatarImage(userDetails)}
              className={cn("w-[76px] h-[76px] ", !userDetails?.avatar ? "bg-[#FFB088] rounded-[24px]" : "")}
            />
            <Chat
              direction="left"
              delay={1000}
              onComplete={handleStepCompletion}
            >
              Hey there! I'm {firstName} {lastName}
            </Chat>
          </div>
        )}
        {activeStep >= 2 && (
          <Chat direction="left" delay={400} onComplete={handleStepCompletion}>
            {bio}
          </Chat>
        )}
        {activeStep >= 3 && (
          <Chat delay={100} direction="right" onComplete={handleStepCompletion}>
            Hey! What are your core skills?
          </Chat>
        )}

        {activeStep >= 4 && (
          <Chat delay={1000} onComplete={handleStepCompletion}>
            I specialize in {getSkills()}
          </Chat>
        )}

        {activeStep >= 5 && (
          <Chat delay={400} onComplete={handleStepCompletion}>
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

        {activeStep >= 6 && projects && projects?.length > 0 && (
          <Chat direction="right" delay={400} onComplete={handleStepCompletion}>
            Awesome! Can you share any of your recent work? Would love to see
            them
          </Chat>
        )}

        {activeStep >= 7 && projects && projects?.length > 0 && (
          <>
            <Chat
              direction="left"
              delay={200}
              onComplete={handleStepCompletion}
            >
              Here you go!
            </Chat>
            <div className="flex flex-row flex-wrap gap-6">
              {projects?.map((project, index) => {
                return (
                  <div
                    className="w-full md:w-[calc(50%-12px)] max-w-[444px] relative"
                    key={project._id}
                    ref={projectRef}
                  >
                    <ProjectShape className="text-template-text-left-bg-color" />
                    <Chat direction="left" className="rounded-tl-none w-full">
                      <ProjectCard
                        project={project}
                        onDeleteProject={onDeleteProject}
                        edit={false}
                        handleRouter={handleRouter}
                        href={getHref(project._id)}
                      />
                    </Chat>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeStep >= 8 && reviews && reviews.length > 0 && (
          <>
            <Chat direction="left">
              I’ve always gotten great feedback from my clients & colleagues.
            </Chat>
            <Chat direction="left" onComplete={handleStepCompletion}>

              <div className="space-y-4">
                {reviews?.map((review) => {
                  const isExpanded = expandedReviewCards.includes(review?._id);
                  const plainTextLength = getPlainTextLength(review?.description || "");
                  const shouldShowToggle = plainTextLength > 180;
                  console.log(plainTextLength);
                  return (
                    <div key={review?._id} className="border border-tools-card-item-border-color p-5 rounded-2xl">
                      <Quote />
                      <div className="mt-4 text-df-base-text-color">
                        <div className={shouldShowToggle && !isExpanded ? "max-h-[110px] overflow-hidden relative" : ""}>
                          <SimpleTiptapRenderer
                            className="bg-card"
                            content={review?.description || ""}
                            mode="review"
                            enableBulletList={false}
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
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Chat>
          </>
        )}

        {activeStep >= 9 && experiences && experiences?.length > 0 && (
          <>
            <Chat direction="left" delay={200}>
              Also, here's more!
            </Chat>

            <Chat
              direction="left"
              className="pb-5"
              delay={200}
              onComplete={handleStepCompletion}
            >
              <div className="flex flex-col gap-6">
                {experiences?.map((experience, index) => {
                  const isExpanded = expandedExperienceCards.includes(experience?._id);
                  const plainTextLength = getPlainTextLength(experience?.description || "");
                  const shouldShowToggle = plainTextLength > 200;

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
                          <Text
                            size="p-xsmall"
                            className="font-medium mt-[6px]"
                          >
                            {`${experience?.startMonth} ${experience?.startYear
                              } - ${experience?.currentlyWorking
                                ? "Present"
                                : `${experience?.endMonth} ${experience?.endYear}`
                              }  `}
                          </Text>
                          <div className={`text-[16px] font-light leading-[22.4px] font-inter`}>
                            <div className={shouldShowToggle && !isExpanded ? "max-h-[110px] overflow-hidden relative" : ""}>
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
              </div>
            </Chat>
          </>
        )}

        {activeStep >= 10 && portfolioCheck && (
          <>
            <Chat direction="right" delay={400}>
              Do you have any other portfolios?
            </Chat>
            <Chat
              direction="left"
              className="pb-5"
              delay={200}
              onComplete={handleStepCompletion}
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
          </>
        )}

        {activeStep >= 11 &&
          ((socials &&
            Object.values(socials).every((social) => social == "")) ||
            resume) && (
            <>
              <Chat
                direction="right"
                delay={400}
                onComplete={handleStepCompletion}
              >
                Where can I reach you?
              </Chat>
              {resume && (
                <Chat direction="left" className="pb-5">
                  <a
                    href={userDetails?.resume?.url}
                    download={true}
                    target="_blank"
                  >
                    <Button
                      text={"Download Resume"}
                      customClass="w-full justify-start"
                      type="secondary"
                      icon={
                        <NoteIcon className="text-df-icon-color cursor-pointer" />
                      }
                    />
                  </a>
                </Chat>
              )}

              {socials &&
                Object.values(socials).some(
                  (social) => social && social != ""
                ) && (
                  <Chat direction="left" className="pb-5" delay={200}>
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
            </>
          )}

        {activeStep >= 6 && (
          <div
            className="flex justify-center mt-10"
            style={{ pointerEvent: "all" }}
          >
            <a href="#">
              <GoUp
                className="animate-bounce cursor-pointer"
                style={{ cursor: "pointer" }}
              />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
