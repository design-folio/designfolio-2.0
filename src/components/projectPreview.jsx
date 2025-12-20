import React from "react";
import { motion } from "framer-motion";
import ProjectInfo from "./projectInfo";
import { useGlobalContext } from "@/context/globalContext";
import BlockRenderer from "./blockRenderer";
import TiptapRenderer from "./tiptapRenderer";
import { containerVariants, itemVariants } from "@/lib/animationVariants";

export default function ProjectPreview({ projectDetails }) {
  const { userDetails, showModal } = useGlobalContext();

  const contentVersion = projectDetails?.project?.contentVersion || 1;
  const hasTiptapContent = contentVersion === 2 && projectDetails?.project?.tiptapContent;
  const hasEditorJSContent = contentVersion === 1 && projectDetails?.project?.content;

  return (
    <motion.div
      className="flex-1 flex flex-col gap-3"
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
            <motion.div variants={itemVariants}>
              <TiptapRenderer content={projectDetails?.project?.tiptapContent} />
            </motion.div>
          )}
          {hasEditorJSContent && (
            <motion.div variants={itemVariants}>
              <BlockRenderer editorJsData={projectDetails?.project?.content} />
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
