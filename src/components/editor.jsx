import React, { useMemo } from "react";
import ProjectInfo from "./projectInfo";
import { useGlobalContext } from "@/context/globalContext";
import dynamic from "next/dynamic";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { TEMPLATE_IDS } from "@/lib/templates";

const tiptapClassNamesByTemplate = {
  [TEMPLATE_IDS.MONO]: {
    editor: "bg-background",
    wrapper: "p-0 md:p-0",
  },
  [TEMPLATE_IDS.CHATFOLIO]: {
    editor:
      "bg-[#E5E2DB] dark:bg-[#2A2520] border border-black/5 dark:border-white/5 rounded-2xl rounded-bl-sm shadow-none",
    container: "!pb-0",
    wrapper: "p-4 md:p-4",
  },
  [TEMPLATE_IDS.PROFESSIONAL]: {
    editor: "",
    container: "",
    wrapper: "bg-background",
  },
  [TEMPLATE_IDS.CANVAS]: {
    editor: "rounded-[26px]",
  },
  [TEMPLATE_IDS.SPOTLIGHT]: {
    editor: "rounded-[26px]",
  },
};

const ProjectEditor = dynamic(() => import("./projectEditor"), {
  ssr: false,
});
const TiptapEditor = dynamic(() => import("./tiptapEditor"), {
  ssr: false,
});

export default function Editor({ edit, projectDetails, refetchProjectDetail }) {
  const { userDetails, setUserDetails, setPopoverMenu, showModal, popoverMenu } =
    useGlobalContext();

  const isMono = userDetails?.template === TEMPLATE_IDS.MONO;
  const isChatfolio = userDetails?.template === TEMPLATE_IDS.CHATFOLIO;
  const avatarSrc = useMemo(() => getUserAvatarImage(userDetails), [userDetails]);
  const firstName = userDetails?.firstName || userDetails?.name || "Me";

  const tiptapClassNames = {
    editor: "",
    container: "",
    wrapper: "",
    ...tiptapClassNamesByTemplate[userDetails?.template],
  };

  const editorBody =
    projectDetails?.project?.contentVersion === 2 ? (
      <TiptapEditor
        classNames={tiptapClassNames}
        projectDetails={projectDetails?.project}
        userDetails={userDetails}
        setUserDetails={setUserDetails}
        refetchProjectDetail={refetchProjectDetail}
      />
    ) : (
      <ProjectEditor
        projectDetails={projectDetails?.project}
        userDetails={userDetails}
        setUserDetails={setUserDetails}
        refetchProjectDetail={refetchProjectDetail}
      />
    );

  return (
    <div className="editor-container flex flex-1 flex-col gap-3">
      {projectDetails && (
        <>
          <ProjectInfo
            projectDetails={projectDetails.project}
            userDetails={userDetails}
            setUserDetails={setUserDetails}
            showModal={showModal}
            edit={edit}
            setPopoverMenu={setPopoverMenu}
            popoverMenu={popoverMenu}
            refetchProjectDetail={refetchProjectDetail}
          />
          <div className={isMono ? "px-5 py-6 md:px-8" : ""}>
            {isChatfolio ? (
              <div className="mb-20 flex max-w-[95%] items-end gap-3">
                <div className="mb-0.5 h-8 w-8 shrink-0 overflow-hidden rounded-full border border-black/5 dark:border-white/5">
                  <img src={avatarSrc} alt={firstName} className="h-full w-full object-cover" />
                </div>
                <div className="flex w-full flex-col gap-1">
                  <span className="ml-1 text-[11px] font-medium text-[#7A736C] dark:text-[#B5AFA5]">
                    {firstName}
                  </span>
                  {editorBody}
                </div>
              </div>
            ) : (
              editorBody
            )}
          </div>
        </>
      )}
    </div>
  );
}
