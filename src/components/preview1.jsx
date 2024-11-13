import React from "react";
import { motion } from "framer-motion";
import BottomLayout from "@/components/bottomLayout";
import Others from "@/components/others";
import OthersPreview from "@/components/othersPreview";
import Profile from "@/components/profile";
import Projects from "@/components/Projects";
import Reviews from "@/components/reviews";
import Tools from "@/components/tools";
import Works from "@/components/works";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1, // Children animations start at the same time but staggered
      type: "spring",
    },
  },
};

const itemVariants = {
  hidden: { y: 50 }, // Starting position of children below their final position
  visible: {
    y: 0, // Final position of children
    transition: {
      type: "spring",
      stiffness: 180, // Smoothness adjusted
      damping: 15, // Controlled bounciness
      duration: 0.4, // Duration of each child's animation
    },
  },
};

export default function Preview1({ userDetails, projectRef }) {
  return (
    <BottomLayout userDetails={userDetails}>
      <main className="min-h-screen bg-df-bg-color">
        <div
          className={`max-w-[890px] mx-auto py-[40px] px-2 md:px-4 lg:px-0 pb-[140px]`}
        >
          {userDetails && (
            <motion.div
              className="flex-1 flex flex-col gap-4 md:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <Profile userDetails={userDetails} preview />
              </motion.div>
              {userDetails?.projects?.length > 0 && (
                <motion.div variants={itemVariants}>
                  <Projects
                    userDetails={userDetails}
                    projectRef={projectRef}
                    preview
                  />
                </motion.div>
              )}
              {userDetails?.reviews?.length > 0 && (
                <motion.div variants={itemVariants}>
                  <Reviews userDetails={userDetails} />
                </motion.div>
              )}
              <motion.div variants={itemVariants}>
                <Tools userDetails={userDetails} />
              </motion.div>
              {userDetails?.experiences?.length > 0 && (
                <motion.div variants={itemVariants}>
                  <Works userDetails={userDetails} />
                </motion.div>
              )}
              {(!!userDetails?.socials?.instagram ||
                !!userDetails?.socials?.twitter ||
                !!userDetails?.socials?.linkedin ||
                !!userDetails?.portfolios?.dribbble ||
                !!userDetails?.portfolios?.notion ||
                !!userDetails?.portfolios?.behance ||
                !!userDetails?.portfolios?.medium) && (
                <motion.div variants={itemVariants}>
                  <OthersPreview userDetails={userDetails} />
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </BottomLayout>
  );
}
