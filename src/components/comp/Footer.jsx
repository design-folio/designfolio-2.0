import { Download } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

import InstagramIcon from "../../../public/assets/svgs/instagram.svg";
import TwitterIcon from "../../../public/assets/svgs/twitter.svg";
import LinkedInIcon from "../../../public/assets/svgs/linkedin.svg";
import DribbbleIcon from "../../../public/assets/svgs/dribbble.svg";
import BehanceIcon from "../../../public/assets/svgs/behance.svg";
import NotionIcon from "../../../public/assets/svgs/noteIcon.svg";
import MediumIcon from "../../../public/assets/svgs/medium.svg";
import ResumeIcon from "../../../public/assets/svgs/resume.svg";
import PlusIcon from "../../../public/assets/svgs/plus.svg";
import DeleteIcon from "../../../public/assets/svgs/deleteIcon.svg";
import PuzzleIcon from "../../../public/assets/svgs/puzzle.svg";
import OthersIcon from "../../../public/assets/svgs/others.svg";

import AddItem from "../addItem";
import { modals } from "@/lib/constant";
import { Button } from "../ui/button";
import Button2 from "../button";
import { useGlobalContext } from "@/context/globalContext";
import { _deleteResume } from "@/network/post-request";

export const Footer = ({ userDetails, edit }) => {
  const { portfolios, socials } = userDetails || {};
  const { openModal, userDetailsRefecth } = useGlobalContext();

  const handleDelete = () => {
    _deleteResume().then((res) => userDetailsRefecth());
  };

  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    rootMargin: "-100px",
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.33, 1, 0.68, 1],
      },
    },
  };

  return (
    <footer className="pt-16 pb-[80px] lg:pb-[80px] border-t border-secondary-border">
      <div className="container max-w-3xl mx-auto px-4">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center gap-8"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground max-w-2xl text-center leading-tight">
            Let's work together
          </h2>
          {userDetails?.resume?.url && (
            <div className="flex flex-wrap gap-4 justify-center">
              <a
                href={userDetails?.resume?.url}
                download={true}
                target="_blank"
              >
                <Button size="lg" variant="outline" className="text-lg px-8">
                  <Download className="mr-2" />
                  Download Resume
                </Button>
              </a>
              {edit && (
                <Button2
                  icon={
                    <DeleteIcon className="stroke-delete-btn-icon-color w-6 h-6 cursor-pointer" />
                  }
                  type="normal"
                  className=""
                  onClick={handleDelete}
                />
              )}
            </div>
          )}

          {edit && !userDetails?.resume?.url && (
            <AddItem
              title="Add your resume"
              iconLeft={<ResumeIcon className="text-df-icon-color" />}
              onClick={() => openModal(modals.resume)}
              iconRight={
                <Button2
                  size="small"
                  type="secondary"
                  customClass="w-fit gap-0"
                  icon={
                    <PlusIcon className="text-secondary-btn-text-color w-[14px] h-[14px] cursor-pointer" />
                  }
                />
              }
              className="bg-df-section-card-bg-color w-full"
            />
          )}
          <div className="flex items-center gap-8 text-foreground/60 dark:text-gray-400">
            {socials?.instagram && (
              <a
                href={socials?.instagram}
                className="hover:text-foreground dark:hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon />
                <span className="sr-only">Instagram</span>
              </a>
            )}
            {socials?.linkedin && (
              <a
                href={socials?.linkedin}
                className="hover:text-foreground dark:hover:text-white transition-colors cursor-pointer"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedInIcon className="cursor-pointer" />
                <span className="sr-only">LinkedIn</span>
              </a>
            )}
            {socials?.twitter && (
              <a
                href={socials?.twitter}
                className="hover:text-foreground dark:hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TwitterIcon />
                <span className="sr-only">X</span>
              </a>
            )}
            {portfolios?.behance && (
              <a
                href={portfolios?.behance}
                className="hover:text-foreground dark:hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BehanceIcon />
                <span className="sr-only">Behance</span>
              </a>
            )}
            {portfolios?.dribbble && (
              <a
                href={portfolios?.dribbble}
                className="hover:text-foreground dark:hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <DribbbleIcon />
                <span className="sr-only">Dribbble</span>
              </a>
            )}
            {portfolios?.medium && (
              <a
                href={portfolios?.medium}
                className="hover:text-foreground dark:hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MediumIcon />
                <span className="sr-only">Medium</span>
              </a>
            )}
            {portfolios?.notion && (
              <a
                href={portfolios?.notion}
                className="hover:text-foreground dark:hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <NotionIcon />
                <span className="sr-only">Notion</span>
              </a>
            )}
          </div>
          {edit && (
            <div className="flex flex-col lg:flex-row gap-4">
              <AddItem
                title="Add your social media"
                onClick={() => openModal(modals.socialMedia)}
                iconLeft={<PuzzleIcon className="text-df-icon-color" />}
                iconRight={
                  <Button2
                    size="small"
                    type="secondary"
                    customClass="w-fit gap-0"
                    icon={
                      <PlusIcon className="text-secondary-btn-text-color w-[14px] h-[14px] cursor-pointer" />
                    }
                  />
                }
                className="bg-df-section-card-bg-color shadow-df-section-card-shadow w-full"
              />
              <AddItem
                title="Add your portfolio links"
                onClick={() => openModal(modals.portfolioLinks)}
                iconLeft={<OthersIcon className="text-df-icon-color" />}
                iconRight={
                  <Button2
                    size="small"
                    type="secondary"
                    customClass="w-fit gap-0"
                    icon={
                      <PlusIcon className="text-secondary-btn-text-color w-[14px] h-[14px] cursor-pointer" />
                    }
                  />
                }
                className="bg-df-section-card-bg-color shadow-df-section-card-shadow w-full"
              />
            </div>
          )}
        </motion.div>
      </div>
    </footer>
  );
};
