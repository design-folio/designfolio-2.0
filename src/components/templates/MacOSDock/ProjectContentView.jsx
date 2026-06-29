import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import BlockRenderer from "@/components/blockRenderer";
import ProjectInfo from "@/components/projectInfo";
import ProjectPassword from "@/components/projectPassword";
import TiptapRenderer from "@/components/tiptapRenderer";
import { _getProjectDetails } from "@/network/get-request";
import { containerVariants, itemVariants } from "@/lib/animationVariants";

/**
 * Renders project content for the in-place dock window.
 * Uses the same React Query key as the project page so prefetched data shows immediately.
 */
const ProjectContentView = ({ projectId, userDetails }) => {
  const [unlockedProjectData, setUnlockedProjectData] = useState(null);

  const contextProject = useMemo(() => {
    if (!projectId || !userDetails?.projects) return null;
    return userDetails.projects.find((p) => p._id === projectId);
  }, [projectId, userDetails]);

  const shouldFetch = !!projectId && userDetails !== null && !contextProject;

  const {
    data: fetchedData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [`project-${projectId}`],
    queryFn: async () => {
      const response = await _getProjectDetails(projectId, 1);
      return response.data;
    },
    enabled: shouldFetch,
    staleTime: 60000,
    cacheTime: 300000,
  });

  const projectData = useMemo(() => {
    if (unlockedProjectData) {
      return {
        project: unlockedProjectData?.project,
        isProtected: unlockedProjectData?.isProtected ?? false,
      };
    }
    if (contextProject) {
      return {
        project: contextProject,
        isProtected: contextProject.protected ?? false,
      };
    }
    if (fetchedData) {
      return {
        project: fetchedData?.project,
        isProtected: fetchedData?.isProtected ?? false,
      };
    }
    return null;
  }, [unlockedProjectData, contextProject, fetchedData]);

  const project = projectData?.project;
  const isProtected = projectData?.isProtected ?? false;
  const loading = (isLoading || isFetching) && !contextProject && !project;

  if (loading) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 p-8 text-[#666]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#d1d1d1] border-t-[#007aff]" />
        <span className="text-sm">Loading project…</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center p-8 text-sm text-[#666]">
        Project not found.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[848px] px-4 pt-4 pb-10 lg:px-0">
      <motion.div
        className="flex flex-col gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isProtected ? (
          <motion.div variants={itemVariants}>
            <ProjectPassword
              status={1}
              projectDetails={project}
              id={projectId}
              setIsProtected={(value) => {
                if (!value && unlockedProjectData) {
                  setUnlockedProjectData((prev) => (prev ? { ...prev, isProtected: false } : null));
                }
              }}
              setProjectDetails={(newData) => setUnlockedProjectData(newData)}
            />
          </motion.div>
        ) : (
          <>
            <motion.div variants={itemVariants}>
              <ProjectInfo projectDetails={project} />
            </motion.div>
            {project?.contentVersion === 2 && project?.tiptapContent ? (
              <motion.div variants={itemVariants}>
                <TiptapRenderer content={project.tiptapContent} cla />
              </motion.div>
            ) : project?.content ? (
              <motion.div variants={itemVariants}>
                <BlockRenderer editorJsData={project.content} />
              </motion.div>
            ) : null}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ProjectContentView;
