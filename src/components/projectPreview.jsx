import React from "react";
import { motion } from "framer-motion";
import ProjectInfo from "./projectInfo";
import { useGlobalContext } from "@/context/globalContext";
import BlockRenderer from "./blockRenderer";
import TiptapRenderer from "./tiptapRenderer";
import { containerVariants, itemVariants } from "@/lib/animationVariants";
import { TEMPLATE_IDS } from "@/lib/templates";
import CanvasProjectCta from "./templates/Canvas/CanvasProjectCta";
import MonoProjectFooter from "./templates/Mono/MonoProjectFooter";

export default function ProjectPreview({ projectDetails }) {
  const { userDetails, showModal } = useGlobalContext();

  const contentVersion = projectDetails?.project?.contentVersion || 1;
  const hasTiptapContent = contentVersion === 2 && projectDetails?.project?.tiptapContent;
  const hasEditorJSContent = contentVersion === 1 && projectDetails?.project?.content;
  const template = userDetails?.template;
  const isMono = template === TEMPLATE_IDS.MONO;
  const isCanvas = template === TEMPLATE_IDS.CANVAS;
  const isProtected = projectDetails?.isProtected;

  return (
    <motion.div
      className={`flex-1 flex flex-col ${isMono ? "" : "gap-3"}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {projectDetails && (
        <>
          <motion.div variants={itemVariants}>
            <ProjectInfo
              projectDetails={projectDetails?.project}
              userDetails={userDetails}
              showModal={showModal}
            />
          </motion.div>
          {hasTiptapContent && (
            <motion.div variants={itemVariants} className={isMono ? "px-5 md:px-8 py-6" : ""}>
              <TiptapRenderer
                key={projectDetails?.project?._id}
                content={projectDetails?.project?.tiptapContent}
              />
            </motion.div>
          )}
          {hasEditorJSContent && (
            <motion.div variants={itemVariants} className={isMono ? "px-5 md:px-8 py-6" : ""}>
              <BlockRenderer editorJsData={projectDetails?.project?.content} />
            </motion.div>
          )}
          {isCanvas && !isProtected && (
            <motion.div variants={itemVariants}>
              <CanvasProjectCta ownerUser={userDetails} />
            </motion.div>
          )}
          {isMono && !isProtected && (
            <MonoProjectFooter ownerUser={userDetails} />
          )}
        </>
      )}
    </motion.div>
  );
}
