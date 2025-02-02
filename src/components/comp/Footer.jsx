import { Button } from "@/components/ui/button";
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

export const Footer = ({ userDetails }) => {
  const { portfolios, socials } = userDetails || {};

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
    <footer className="pt-16 pb-[160px] border-t border-secondary-border">
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

          <div className="flex flex-wrap gap-4 justify-center">
            <a href={userDetails?.resume?.url} download={true} target="_blank">
              <Button size="lg" variant="outline" className="text-lg px-8">
                <Download className="mr-2" />
                Download Resume
              </Button>
            </a>
          </div>

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
                className="hover:text-foreground dark:hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkedInIcon />
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
        </motion.div>
      </div>
    </footer>
  );
};
