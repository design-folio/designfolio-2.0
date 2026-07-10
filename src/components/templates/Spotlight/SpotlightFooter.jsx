import { Download } from "lucide-react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

import InstagramIcon from "../../../../public/assets/svgs/instagram.svg";
import TwitterIcon from "../../../../public/assets/svgs/twitter.svg";
import LinkedInIcon from "../../../../public/assets/svgs/linkedin.svg";
import DribbbleIcon from "../../../../public/assets/svgs/dribbble.svg";
import NotionIcon from "../../../../public/assets/svgs/noteIcon.svg";
import MediumIcon from "../../../../public/assets/svgs/medium.svg";
import PlusIcon from "../../../../public/assets/svgs/plus.svg";
import DeleteIcon from "../../../../public/assets/svgs/deleteIcon.svg";

import AddItem from "@/components/addItem";
import { sidebars } from "@/lib/constant";
import { Button } from "@/components/ui/button";
import Button2 from "@/components/button";
import { useGlobalContext } from "@/context/globalContext";
import { _deleteResume } from "@/network/post-request";
import MemoResume from "@/components/icons/Resume";
import MemoSocial from "@/components/icons/Social";
import MemoOtherlinks from "@/components/icons/Otherlinks";

export const SpotlightFooter = ({ userDetails, edit }) => {
  const { portfolios, socials } = userDetails || {};
  const { openSidebar, userDetailsRefecth } = useGlobalContext();

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
    <footer className="border-secondary-border border-t pt-16 pb-[140px] lg:pb-[80px]">
      <div className="container mx-auto max-w-3xl px-4">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center gap-8"
        >
          <h2 className="text-foreground text-scaled-30 max-w-2xl text-center leading-tight font-bold">
            Let&apos;s work together
          </h2>
          {userDetails?.resume?.url && (
            <div className="flex flex-wrap justify-center gap-4">
              <a href={userDetails?.resume?.url} download={true} target="_blank">
                <Button size="lg" variant="outline" className="text-scaled-18 px-8">
                  <Download className="mr-2" />
                  Download Resume
                </Button>
              </a>
              {edit && (
                <Button2
                  icon={
                    <DeleteIcon className="stroke-delete-btn-icon-color h-6 w-6 cursor-pointer" />
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
              iconLeft={<MemoResume />}
              onClick={() => openSidebar(sidebars.footer)}
              iconRight={
                <Button2
                  size="small"
                  type="secondary"
                  customClass="w-fit gap-0"
                  icon={
                    <PlusIcon className="text-secondary-btn-text-color h-[14px] w-[14px] cursor-pointer" />
                  }
                />
              }
              className="bg-card w-full"
            />
          )}
          <div className="text-foreground/60 flex items-center gap-8 dark:text-gray-400">
            {socials?.instagram && (
              <a
                href={socials?.instagram}
                className="hover:text-foreground transition-colors dark:hover:text-white"
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
                className="hover:text-foreground cursor-pointer transition-colors dark:hover:text-white"
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
                className="hover:text-foreground transition-colors dark:hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TwitterIcon />
                <span className="sr-only">X</span>
              </a>
            )}
            {portfolios?.dribbble && (
              <a
                href={portfolios?.dribbble}
                className="hover:text-foreground transition-colors dark:hover:text-white"
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
                className="hover:text-foreground transition-colors dark:hover:text-white"
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
                className="hover:text-foreground transition-colors dark:hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                <NotionIcon />
                <span className="sr-only">Notion</span>
              </a>
            )}
          </div>
          {edit && (
            <div className="flex flex-col gap-4 lg:flex-row">
              <AddItem
                title="Add your social media"
                onClick={() => openSidebar(sidebars.footer)}
                iconLeft={<MemoSocial />}
                iconRight={
                  <Button2
                    size="small"
                    type="secondary"
                    customClass="w-fit gap-0"
                    icon={
                      <PlusIcon className="text-secondary-btn-text-color h-[14px] w-[14px] cursor-pointer" />
                    }
                  />
                }
                className="bg-card shadow-df-section-card-shadow w-full"
              />
              <AddItem
                title="Add your portfolio links"
                onClick={() => openSidebar(sidebars.footer)}
                iconLeft={<MemoOtherlinks />}
                iconRight={
                  <Button2
                    size="small"
                    type="secondary"
                    customClass="w-fit gap-0"
                    icon={
                      <PlusIcon className="text-secondary-btn-text-color h-[14px] w-[14px] cursor-pointer" />
                    }
                  />
                }
                className="bg-card shadow-df-section-card-shadow w-full"
              />
            </div>
          )}
        </motion.div>
      </div>
    </footer>
  );
};
