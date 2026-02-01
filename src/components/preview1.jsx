import React from "react";
import { motion } from "framer-motion";
import BottomLayout from "@/components/bottomLayout";
// import Others from "@/components/others";
// import OthersPreview from "@/components/othersPreview";
import PortfolioFooter from "@/components/portfolioFooter";
import Profile from "@/components/profile";
import Projects from "@/components/Projects";
import Reviews from "@/components/reviews";
import Tools from "@/components/tools";
import Works from "@/components/works";
import { containerVariants, itemVariants } from "@/lib/animationVariants";
import { DEFAULT_SECTION_ORDER, normalizeSectionOrder } from "@/lib/constant";
import AboutMe from "@/components/aboutMe";

export default function Preview1({ userDetails, projectRef, embeddedPreview = false }) {
  // Get section order from userDetails or use template default
  const sectionOrder = normalizeSectionOrder(userDetails?.sectionOrder, DEFAULT_SECTION_ORDER);

  // Get hidden sections array
  const hiddenSections = userDetails?.hiddenSections || [];

  // Section component mapping
  const sectionComponents = {
    about: !hiddenSections.includes('about') && (
      <motion.div variants={itemVariants} id="section-about">
        <AboutMe userDetails={userDetails} />
      </motion.div>
    ),
    projects: userDetails?.projects?.length > 0 && !hiddenSections.includes('projects') && (
      <motion.div variants={itemVariants} id="section-projects">
        <Projects
          userDetails={userDetails}
          projectRef={projectRef}
          preview
        />
      </motion.div>
    ),
    reviews: userDetails?.reviews?.length > 0 && !hiddenSections.includes('reviews') && (
      <motion.div variants={itemVariants} id="section-reviews">
        <Reviews userDetails={userDetails} />
      </motion.div>
    ),
    tools: !embeddedPreview && !hiddenSections.includes('tools') && (
      <motion.div variants={itemVariants} id="section-tools">
        <Tools userDetails={userDetails} />
      </motion.div>
    ),
    works: userDetails?.experiences?.length > 0 && !hiddenSections.includes('works') && (
      <motion.div variants={itemVariants} id="section-works">
        <Works userDetails={userDetails} />
      </motion.div>
    ),
  };

  const mainContent = (
    <main className="min-h-screen">
      <div
        className={`max-w-[848px] mx-auto py-[40px] px-2 md:px-4 lg:px-0 pb-[140px]`}
      >
        {userDetails && (
          <motion.div
            className="flex-1 flex flex-col gap-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Profile userDetails={userDetails} preview embeddedPreview={embeddedPreview} />
            </motion.div>
            {sectionOrder.map((sectionId) => sectionComponents[sectionId])}
            <motion.div variants={itemVariants}>
              <PortfolioFooter edit={false} userDetails={userDetails} />
            </motion.div>
          </motion.div>
        )}
      </div>
    </main>
  );

  if (embeddedPreview) {
    return mainContent;
  }

  return (
    <BottomLayout userDetails={userDetails}>
      {mainContent}
    </BottomLayout>
  );
}
