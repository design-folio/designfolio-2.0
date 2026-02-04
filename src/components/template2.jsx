import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGlobalContext } from "@/context/globalContext";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import BehanceIcon from "../../public/assets/svgs/behance.svg";
import DribbbleIcon from "../../public/assets/svgs/dribbble.svg";
import ExperienceShape from "../../public/assets/svgs/experience-shape.svg";
import GoUp from "../../public/assets/svgs/go-up.svg";
import InstagramIcon from "../../public/assets/svgs/instagram.svg";
import LinkedInIcon from "../../public/assets/svgs/linkedin.svg";
import MediumIcon from "../../public/assets/svgs/medium.svg";
import { default as NoteIcon, default as NotionIcon } from "../../public/assets/svgs/noteIcon.svg";
import ProjectShape from "../../public/assets/svgs/project-shape.svg";
import Quote from "../../public/assets/svgs/quote.svg";
import TwitterIcon from "../../public/assets/svgs/twitter.svg";
import Button from "./button";
import Chat from "./chat";
import MemoLeftArrow from "./icons/LeftArrow";
import DfImage from "./image";
import ProjectCard from "./ProjectCard";
import ClampableTiptapContent from "./ClampableTiptapContent";
import Text from "./text";
import { Button as ButtonNew } from "./ui/buttonNew";
import MemoLinkedin from "./icons/Linkedin";
import { AboutMeContent } from "./aboutMe";
export default function Template2({ userDetails, preview = false, edit = false, activeStep: activeStepProp, onStepComplete }) {
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
    lastName,
    hiddenSections = [],
  } = userDetails || {};
  const router = useRouter();

  const isSectionVisible = (id) => !hiddenSections.includes(id);
  const { projectRef, setCursor } = useGlobalContext();

  const [internalStep, setInternalStep] = useState(1);
  const isControlled = activeStepProp != null && typeof onStepComplete === "function";
  const activeStep = isControlled ? activeStepProp : internalStep;
  const setActiveStep = isControlled
    ? (fn) => {
      const next = typeof fn === "function" ? fn(activeStepProp) : fn;
      onStepComplete(next);
    }
    : setInternalStep;

  const portfolioCheck =
    portfolios &&
    !Object.values(portfolios).every((portfolio) => portfolio == "");

  useEffect(() => {
    setCursor(userDetails?.cursor ? userDetails?.cursor : 0);
  }, [userDetails?.cursor, setCursor]);

  useEffect(() => {
    const shouldSkipStep = (step) => {
      if (step === 3 || step === 4) return !isSectionVisible("projects") || !projects || projects.length === 0;
      if (step === 5) return !isSectionVisible("reviews") || !reviews || reviews.length === 0;
      if (step === 6) return !isSectionVisible("tools");
      if (step === 7) return !isSectionVisible("about") || !userDetails?.about || userDetails?.about?.trim?.() === "";
      if (step === 8) return !isSectionVisible("works") || !experiences || experiences.length === 0;
      if (step === 9) return !portfolioCheck;
      if (step === 10) return socials && !Object.values(socials).every((social) => social != "");
      return false;
    };
    let step = activeStep;
    const skippedSteps = [];
    const maxIterations = 15;
    let iterations = 0;
    while (shouldSkipStep(step) && step <= 10 && iterations < maxIterations) {
      skippedSteps.push(step);
      step += 1;
      iterations += 1;
    }
    if (skippedSteps.length > 0) {
      setActiveStep(step);
    }
  }, [activeStep, projects, reviews, experiences, portfolios, userDetails?.about, portfolioCheck, socials, hiddenSections]);

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
    <TooltipProvider>
      <div
        className={`max-w-[848px] mx-auto py-[32px] lg:py-[100px] px-2 md:px-4 lg:px-0`}
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
          {activeStep >= 3 && projects && projects?.length > 0 && isSectionVisible('projects') && (
            <Chat direction="right" delay={400} onComplete={handleStepCompletion}>
              So… what have you been working on lately?
            </Chat>
          )}

          {activeStep >= 4 && projects && projects?.length > 0 && isSectionVisible('projects') && (
            <div id="section-projects" className="flex flex-col gap-6">
              <Chat
                direction="left"
                delay={200}
                onComplete={handleStepCompletion}
                className="w-full"
              >
                Glad you asked 😌 <br />
                Here are a few things I've built.
              </Chat>
              <div className="flex flex-row flex-wrap gap-6">
                {projects?.filter((project) => !project.hidden || !preview).map((project, index) => {
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
            </div>
          )}

          {activeStep >= 5 && reviews && reviews.length > 0 && isSectionVisible('reviews') && (
            <div id="section-reviews" className="flex flex-col gap-6">
              <Chat direction="right" delay={400} onComplete={handleStepCompletion}>
                What do people usually say about working with you?
              </Chat>
              <Chat direction="left" delay={300}>
                Here's what some very kind humans had to say 🫶
              </Chat>
              <Chat direction="left" delay={200} onComplete={handleStepCompletion} className="w-full">

                <div className="space-y-4">
                  {reviews?.map((review) => (
                    <div key={review?._id} className="border border-tools-card-item-border-color p-5 rounded-2xl">
                      <Quote />
                      <div className="mt-4 text-df-base-text-color">
                        <ClampableTiptapContent
                          content={review?.description || ""}
                          mode="review"
                          enableBulletList={false}
                          maxLines={3}
                          itemId={review?._id}
                          expandedIds={expandedReviewCards}
                          onToggleExpand={toggleExpandReview}
                          buttonClassName="mt-2 text-foreground/80 hover:text-foreground inline-flex items-center gap-1 underline underline-offset-4"
                        />
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
                      </div>
                    </div>
                  ))}
                </div>
              </Chat>
            </div>
          )}

          {activeStep >= 6 && isSectionVisible('tools') && (
            <div id="section-tools" className="flex flex-col gap-6">
              <Chat direction="right" delay={400} onComplete={handleStepCompletion}>
                What do you actually use to build all this?
              </Chat>
              <Chat delay={300} onComplete={handleStepCompletion}>
                A mix of design, code, and a bit of chaos 😄<br />
                But mostly:
              </Chat>
              <Chat delay={300} onComplete={handleStepCompletion} className="w-full">
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
              <Chat delay={300} onComplete={handleStepCompletion} className="w-full">
                I specialize in {getSkills()}
              </Chat>
            </div>
          )}

          {activeStep >= 7 && isSectionVisible('about') && (edit || (userDetails?.about !== null && userDetails?.about !== undefined)) && (
            <div id="section-about" className="flex flex-col gap-6">
              <Chat direction="right" delay={400} onComplete={handleStepCompletion}>
                Tell me a little about yourself?
              </Chat>
              <Chat direction="left" delay={200} onComplete={handleStepCompletion} className="w-full">
                <AboutMeContent
                  userDetails={userDetails}
                  edit={false}
                  variant="pegboard"
                  textClassName="text-df-base-text-color"
                />
              </Chat>
            </div>
          )}

          {activeStep >= 8 && experiences && experiences?.length > 0 && isSectionVisible('works') && (
            <div id="section-works" className="flex flex-col gap-6">
              <Chat direction="right" delay={400} onComplete={handleStepCompletion}>
                Where have you worked so far?
              </Chat>
              <Chat direction="left" delay={300}>
                Here's a quick look at my design journey 👇
              </Chat>
              <Chat
                direction="left"
                className="w-full pb-5"
                delay={200}
                onComplete={handleStepCompletion}
              >
                <div className="flex flex-col gap-6">
                  {experiences?.map((experience) => (
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
                            <ClampableTiptapContent
                              content={experience?.description || ""}
                              mode="work"
                              enableBulletList={true}
                              maxLines={3}
                              itemId={experience?._id}
                              expandedIds={expandedExperienceCards}
                              onToggleExpand={toggleExpandExperience}
                              buttonClassName="mt-2 text-foreground/80 hover:text-foreground inline-flex items-center gap-1 underline underline-offset-4"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Chat>
            </div>
          )}

          {activeStep >= 9 && portfolioCheck && (
            <>
              <Chat direction="right" delay={400} onComplete={handleStepCompletion}>
                Got any other places I should check out?
              </Chat>
              <Chat
                direction="left"
                className="w-full pb-5"
                delay={300}
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

          {activeStep >= 10 &&
            (resume ||
              (socials &&
                Object.values(socials).some(
                  (social) => social && social != ""
                ))) && (
              <>
                <Chat
                  direction="right"
                  delay={400}
                  onComplete={handleStepCompletion}
                >
                  Where can I reach you?
                </Chat>
                <Chat direction="left" className="w-full">You can reach me here 👇🏻</Chat>
                {resume && (
                  <Chat direction="left" className="w-full pb-5">
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
                    <Chat direction="left" className="w-full pb-5" delay={200}>
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

          {activeStep >= 3 && (
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
    </TooltipProvider>
  );
}
