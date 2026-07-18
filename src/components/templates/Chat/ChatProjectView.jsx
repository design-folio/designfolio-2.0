import { useCallback, useEffect, useMemo, useState, startTransition } from "react";
import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import TiptapRenderer from "@/components/tiptapRenderer";
import BlockRenderer from "@/components/blockRenderer";
import { _analyzeCaseStudy, _analyzeCaseStudyStatus, _updateProject } from "@/network/post-request";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { useGlobalContext } from "@/context/globalContext";
import { useProGate } from "@/hooks/useProGate";
import queryClient from "@/network/queryClient";
import Modal from "@/components/modal";
import AnalyzeCaseStudy from "@/components/analyzeCaseStudy";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getMetaLabel, getMetaValue } from "@/lib/constant";
import { toast } from "react-toastify";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ImageWithOverlayAndPicker } from "@/components/ImageWithOverlayAndPicker";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 10 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] },
  },
};

function AnalyzeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.5 7L9.98415 8.39405C9.30774 10.222 8.96953 11.136 8.30278 11.8028C7.63603 12.4695 6.72204 12.8077 4.89405 13.4842L3.5 14L4.89405 14.5158C6.72204 15.1923 7.63603 15.5305 8.30278 16.1972C8.96953 16.864 9.30774 17.778 9.98415 19.6059L10.5 21L11.0158 19.6059C11.6923 17.778 12.0305 16.864 12.6972 16.1972C13.364 15.5305 14.278 15.1923 16.1059 14.5158L17.5 14L16.1059 13.4842C14.278 12.8077 13.364 12.4695 12.6972 11.8028C12.0305 11.136 11.6923 10.222 11.0158 8.39405L10.5 7Z"
        fill="#FF553E"
      />
      <path
        d="M18.5 3L18.2789 3.59745C17.989 4.38087 17.8441 4.77259 17.5583 5.05833C17.2726 5.34408 16.8809 5.48903 16.0975 5.77892L15.5 6L16.0975 6.22108C16.8809 6.51097 17.2726 6.65592 17.5583 6.94167C17.8441 7.22741 17.989 7.61913 18.2789 8.40255L18.5 9L18.7211 8.40255C19.011 7.61913 19.1559 7.22741 19.4417 6.94166C19.7274 6.65592 20.1191 6.51097 20.9025 6.22108L21.5 6L20.9025 5.77892C20.1191 5.48903 19.7274 5.34408 19.4417 5.05833C19.1559 4.77259 19.011 4.38087 18.7211 3.59745L18.5 3Z"
        fill="#FF553E"
      />
    </svg>
  );
}

function AnimatedLoadingDots({ className = "w-[22px] h-[6px]" }) {
  return (
    <svg className={className} viewBox="0 0 22 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle className="bounce" cx="3.03448" cy="3.0003" r="2.53448" fill="#FF553E" />
      <circle className="bounce" cx="11.0001" cy="3.0003" r="2.53448" fill="#FF553E" />
      <circle className="bounce" cx="18.9655" cy="3.0003" r="2.53448" fill="#FF553E" />
    </svg>
  );
}

export default function ChatProjectView({ project, ownerUser, onBack, edit = false }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const {
    wordCount,
    setWordCount,
    setShowUpgradeModal,
    setUpgradeModalSource,
    analysisCreditsRemaining,
    setAnalysisCreditsRemaining,
  } = useGlobalContext();
  const avatarSrc = useMemo(() => getUserAvatarImage(ownerUser), [ownerUser]);
  const [avatarImageSrc, setAvatarImageSrc] = useState(avatarSrc);
  const firstName = ownerUser?.firstName || ownerUser?.name || "Me";
  const [isPassword, setIsPassword] = useState(project?.protected);
  const requirePro = useProGate();
  const [passwordInput, setPasswordInput] = useState(project?.password || "");
  const [showModal, setShowModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [rating, setRating] = useState("");

  const projectId = project?._id || router.query.id;

  // Build a details grid from whatever project fields are present
  const detailFields = [
    { index: 0, label: getMetaLabel(project, 0), value: getMetaValue(project, 0) },
    { index: 2, label: getMetaLabel(project, 2), value: getMetaValue(project, 2) },
    { index: 1, label: getMetaLabel(project, 1), value: getMetaValue(project, 1) },
    { index: 3, label: getMetaLabel(project, 3), value: getMetaValue(project, 3) },
  ].filter(({ value }) => edit || !!value);

  const hasContent = (project?.contentVersion === 2 && project?.tiptapContent) || project?.content;
  const showProcessPrompt = hasContent || edit;
  const showProcessMessages = !edit && hasContent;
  const needsMoreWords = suggestions?.length === 0 && wordCount !== null && wordCount < 400;
  const outOfCredits = analysisCreditsRemaining !== null && analysisCreditsRemaining <= 0;
  const isAnalyzeDisabled = isAnalyzing || needsMoreWords;
  const analyzeButtonLabel = isAnalyzing
    ? "Analyzing..."
    : suggestions?.length > 0
      ? "Show Score Card"
      : "Analyze with AI";
  const tooltipMessage = outOfCredits
    ? "Upgrade to Pro to analyze Case Study"
    : needsMoreWords
      ? "400 words required to analyze"
      : wordCount != null
        ? `${wordCount} words`
        : null;

  const saveProject = (key, value) => {
    if (!projectId) return;
    _updateProject(projectId, { [key]: value }).then((res) => {
      setTheme(res?.data?.project?.theme == 1 ? "dark" : "light");
      updateProjectCache(key, value);
    });
  };

  const updateProjectCache = (key, value) => {
    if (!ownerUser) return;
    const updatedProjects = ownerUser?.projects?.map((item) =>
      item._id === projectId ? { ...item, [key]: value } : item
    );
    queryClient.setQueriesData({ queryKey: ["userDetails"] }, (oldData) => ({
      user: { ...oldData?.user, projects: updatedProjects },
    }));
  };

  const handleOnBlur = (field, e) => {
    saveProject(field, e.target.textContent.trim());
    e.target.textContent =
      e.target.textContent.trim().length > 0 ? e.target.textContent : "Type here...";
  };

  const saveMetaValue = (index, newValue) => {
    if (!projectId) return;
    const currentMeta = project?.metaFields ?? [
      { label: "Client", value: "" },
      { label: "Industry", value: "" },
      { label: "Role", value: "" },
      { label: "Platform", value: "" },
    ];
    const updated = currentMeta.map((f, i) => (i === index ? { ...f, value: newValue } : f));
    _updateProject(projectId, { metaFields: updated }).then((res) => {
      setTheme(res?.data?.project?.theme == 1 ? "dark" : "light");
      updateProjectCache("metaFields", updated);
    });
  };

  const handleInput = (e) => {
    const textContent = e.target.textContent;
    if (textContent.length > 110) {
      e.target.textContent = textContent.slice(0, 110);
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(e.target);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  const fetchAnalyzeStatus = useCallback(async () => {
    if (!project?._id) return;
    try {
      const response = await _analyzeCaseStudyStatus(project._id);
      if (response.data.status) {
        setSuggestions(response.data.data.data.response);
        setRating(response.data.data.data.rating);
      }
      setAnalyzeStatus(true);
    } catch (e) {
      console.log(e);
    }
  }, [project]);

  const handleAnalyzeClick = async () => {
    if (suggestions.length > 0) {
      setShowModal(true);
      return;
    }
    if (outOfCredits) {
      setUpgradeModalSource("analyze");
      setShowUpgradeModal(true);
      return;
    }
    setIsAnalyzing(true);
    const aiProject = {
      ...project,
      metaFields: project?.metaFields?.map(({ value }) => ({ value })),
    };
    const data = { userId: projectId, caseStudy: aiProject, projectId: project?._id };
    try {
      const response = await _analyzeCaseStudy(data);
      setShowModal(true);
      setSuggestions(response.data.response);
      setRating(response.data.rating);
      setAnalysisCreditsRemaining((prev) =>
        prev !== null && prev !== Infinity ? Math.max(0, prev - 1) : prev
      );
    } catch (e) {
      setAnalysisCreditsRemaining(0);
      setUpgradeModalSource("analyze");
      setShowUpgradeModal(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReAnalyze = async () => {
    setIsAnalyzing(true);
    const aiProject = {
      ...project,
      metaFields: project?.metaFields?.map(({ value }) => ({ value })),
    };
    const data = { userId: projectId, caseStudy: aiProject, projectId: project?._id };
    try {
      const response = await _analyzeCaseStudy(data);
      setShowModal(true);
      setSuggestions(response.data.response);
      setRating(response.data.rating);
      setAnalysisCreditsRemaining((prev) =>
        prev !== null && prev !== Infinity ? Math.max(0, prev - 1) : prev
      );
    } catch (e) {
      setAnalysisCreditsRemaining(0);
      setUpgradeModalSource("analyze");
      setShowUpgradeModal(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePasswordToggle = async () => {
    if (!projectId) return;
    // Enabling protection is Pro-only; disabling stays free.
    if (!isPassword && requirePro("password-protect")) return;
    await _updateProject(projectId, { protected: !isPassword }).then((res) => {
      updateProjectCache("protected", res?.data?.project?.protected);
      setIsPassword((prev) => !prev);
    });
  };

  const handlePasswordSave = () => {
    if (!projectId) return;
    _updateProject(projectId, { password: passwordInput }).then((res) => {
      updateProjectCache("password", res?.data?.project?.password);
      updateProjectCache("protected", res?.data?.project?.protected);
      toast.success("Password has been updated.");
    });
  };

  useEffect(() => {
    startTransition(() => setWordCount(null));
    if (!edit) return;
    startTransition(() => void fetchAnalyzeStatus());
  }, [edit, fetchAnalyzeStatus, setWordCount]);

  useEffect(() => {
    startTransition(() => setAvatarImageSrc(avatarSrc || "/assets/svgs/avatar.svg"));
  }, [avatarSrc]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(
        "font-inter flex justify-center bg-[#F0EDE7] text-[#1A1A1A] transition-colors duration-100 selection:bg-[#1A8CFF] selection:text-white dark:bg-[#1A1A1A] dark:text-[#F0EDE7]",
        edit ? "min-h-0" : "min-h-screen"
      )}
    >
      <div
        className={cn(
          "relative flex w-full max-w-[700px] flex-col",
          edit ? "pt-2 pb-6" : "min-h-screen pt-8 pb-24"
        )}
      >
        <motion.div variants={itemVariants} className="mb-6 pt-2">
          <div
            className={cn("flex w-full items-center justify-between px-4 py-2", edit && "mt-20")}
          >
            <button
              onClick={onBack}
              className="group text-scaled-13 flex items-center gap-1.5 font-medium text-[#7A736C] transition-colors hover:text-[#1A1A1A] dark:text-[#9E9893] dark:hover:text-[#F0EDE7]"
            >
              <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              Back to Projects
            </button>
            {edit && (
              <div className="flex items-center gap-2">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full border border-black/10 bg-white/50 text-[#1A1A1A] transition-all hover:bg-black/5 focus-visible:ring-0 focus-visible:ring-offset-0 dark:border-white/10 dark:bg-[#2A2520]/50 dark:text-[#F0EDE7] dark:hover:bg-white/5"
                      title="Lock Project"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    className="z-50 w-[300px] rounded-2xl border border-black/10 bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#2A2520]/95"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <Label className="text-scaled-14 cursor-pointer font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
                            Protect Project
                          </Label>
                          <p className="text-scaled-12 leading-snug text-[#7A736C] dark:text-[#9E9893]">
                            Require a password to view this project.
                          </p>
                        </div>
                        <Switch
                          checked={!!isPassword}
                          onCheckedChange={handlePasswordToggle}
                          className="mt-0.5 data-[state=checked]:bg-[#1A1A1A] dark:data-[state=checked]:bg-[#F0EDE7]"
                        />
                      </div>
                      {isPassword && (
                        <div className="flex flex-col gap-2">
                          <Input
                            type="password"
                            placeholder="Enter password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            className="text-scaled-14 h-10 rounded-xl border-transparent bg-black/[0.03] text-[#1A1A1A] shadow-none placeholder:text-black/30 focus-visible:ring-2 focus-visible:ring-black/10 dark:bg-white/[0.03] dark:text-[#F0EDE7] dark:placeholder:text-white/30 dark:focus-visible:ring-white/10"
                          />
                          <Button
                            size="sm"
                            onClick={handlePasswordSave}
                            className="text-scaled-13 h-9 rounded-xl bg-[#1A1A1A] text-white hover:bg-black/80 dark:bg-white dark:text-[#1A1A1A] dark:hover:bg-white/90"
                          >
                            Save Password
                          </Button>
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {analyzeStatus && (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={cn(
                            "inline-flex",
                            isAnalyzeDisabled ? "cursor-not-allowed" : "cursor-pointer"
                          )}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAnalyzeClick}
                            disabled={isAnalyzeDisabled}
                            className={cn(
                              "text-scaled-12 h-7 rounded-full border border-black/10 dark:border-white/10",
                              "bg-white/50 text-[#1A1A1A] dark:bg-[#2A2520]/50 dark:text-[#F0EDE7]",
                              "flex items-center gap-1.5 px-3 transition-all focus-visible:ring-0 focus-visible:ring-offset-0",
                              "cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
                              !isAnalyzeDisabled && "hover:bg-black/5 dark:hover:bg-white/5"
                            )}
                          >
                            {isAnalyzing ? (
                              <AnimatedLoadingDots className="h-[5px] w-[18px] shrink-0" />
                            ) : (
                              <AnalyzeIcon className="h-4 w-4 shrink-0" />
                            )}
                            {analyzeButtonLabel}
                          </Button>
                        </span>
                      </TooltipTrigger>
                      {tooltipMessage && (
                        <TooltipContent
                          side="bottom"
                          className="bg-foreground text-background text-scaled-12 rounded px-2 py-1"
                        >
                          {tooltipMessage}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Message 1 — title + description + cover image */}
          <motion.div variants={itemVariants} className="flex max-w-[95%] gap-3 pt-2">
            <div className="mt-auto h-8 w-8 shrink-0 overflow-hidden rounded-full border border-black/5 dark:border-white/5">
              <img
                src={avatarImageSrc || "/assets/svgs/avatar.svg"}
                alt={firstName}
                className="h-full w-full object-cover"
                onError={() => setAvatarImageSrc("/assets/svgs/avatar.svg")}
              />
            </div>
            <div className="flex w-full flex-col gap-1">
              <span className="text-scaled-11 ml-1 font-medium text-[#7A736C] dark:text-[#B5AFA5]">
                {firstName}
              </span>
              <div className="flex w-full flex-col gap-4 rounded-2xl rounded-bl-sm border border-black/5 bg-[#E5E2DB] p-4 transition-colors duration-700 dark:border-white/5 dark:bg-[#2A2520]">
                <div className="flex flex-col px-1 text-left">
                  <h1
                    className={cn(
                      "text-scaled-24 mb-2 leading-tight font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]",
                      edit && !project?.title && "text-[#C5BFB8] italic dark:text-[#4A4238]"
                    )}
                    contentEditable={edit}
                    suppressContentEditableWarning
                    onBlur={(e) => handleOnBlur("title", e)}
                    onFocus={(e) => {
                      if (e.target.textContent === "Type here...") e.target.textContent = "";
                    }}
                  >
                    {project?.title || "Type here..."}
                  </h1>
                  {(edit || !!project?.description) && (
                    <p
                      className={cn(
                        "text-scaled-15 leading-relaxed",
                        edit && !project?.description
                          ? "text-[#C5BFB8] italic dark:text-[#4A4238]"
                          : "text-[#7A736C] dark:text-[#B5AFA5]"
                      )}
                      contentEditable={edit}
                      suppressContentEditableWarning
                      onBlur={(e) => handleOnBlur("description", e)}
                      onFocus={(e) => {
                        if (e.target.textContent === "Type here...") e.target.textContent = "";
                      }}
                    >
                      {project?.description || "Type here..."}
                    </p>
                  )}
                </div>
                {(edit || project?.thumbnail?.url) && (
                  <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-black/5 bg-[#F5F5F5] dark:border-white/5 dark:bg-[#1A1A1A]">
                    {edit ? (
                      <ImageWithOverlayAndPicker
                        src={project?.thumbnail?.url}
                        project={project}
                        aspectRatio="3/2"
                        recommendedSize="1600 × 900px"
                        className="rounded-none"
                      />
                    ) : (
                      <img
                        src={project.thumbnail.url}
                        alt={project.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* You: "Can you share more details?" */}
          <motion.div variants={itemVariants} className="flex justify-end">
            <div className="flex max-w-[85%] flex-col items-end gap-1">
              <span className="text-scaled-11 mr-1 font-medium text-[#7A736C] dark:text-[#B5AFA5]">
                You
              </span>
              <div className="text-scaled-15 rounded-2xl rounded-br-sm bg-[#1A8CFF] px-4 py-3 leading-relaxed text-white shadow-sm dark:bg-[#0073E6]">
                Can you share more details about this project?
              </div>
            </div>
          </motion.div>

          {/* Message 2 — details grid (only if fields exist) */}
          {detailFields.length > 0 && (
            <motion.div variants={itemVariants} className="flex max-w-[95%] gap-3">
              <div className="mt-auto h-8 w-8 shrink-0 overflow-hidden rounded-full border border-black/5 dark:border-white/5">
                <img
                  src={avatarImageSrc || "/assets/svgs/avatar.svg"}
                  alt={firstName}
                  className="h-full w-full object-cover"
                  onError={() => setAvatarImageSrc("/assets/svgs/avatar.svg")}
                />
              </div>
              <div className="flex w-full flex-col gap-1">
                <span className="text-scaled-11 ml-1 font-medium text-[#7A736C] dark:text-[#B5AFA5]">
                  {firstName}
                </span>
                <div className="w-full rounded-2xl rounded-bl-sm border border-black/5 bg-[#E5E2DB] px-5 py-4 transition-colors duration-700 dark:border-white/5 dark:bg-[#2A2520]">
                  <p className="text-scaled-15 mb-4 text-[#1A1A1A] dark:text-[#F0EDE7]">
                    Sure! Here are the core details:
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {detailFields.map(({ index, label, value }) => (
                      <div key={index} className="flex flex-col gap-1">
                        <span className="text-scaled-12 font-medium tracking-wide text-[#7A736C] uppercase dark:text-[#9E9893]">
                          {label}
                        </span>
                        <p
                          className={cn(
                            "text-scaled-14 font-medium text-[#1A1A1A] dark:text-[#F0EDE7]",
                            edit && !value && "text-[#C5BFB8] italic dark:text-[#4A4238]"
                          )}
                          contentEditable={edit}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const text = e.target.textContent;
                            saveMetaValue(index, text === "Type here..." ? "" : text.trim());
                            e.target.textContent = text.trim().length > 0 ? text : "Type here...";
                          }}
                          onFocus={(e) => {
                            if (e.target.textContent === "Type here...") e.target.textContent = "";
                          }}
                          onInput={handleInput}
                        >
                          {value || "Type here..."}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* You: "What was the process like?" */}
          {showProcessPrompt && (
            <motion.div variants={itemVariants} className="flex justify-end">
              <div className="flex max-w-[85%] flex-col items-end gap-1">
                <span className="text-scaled-11 mr-1 font-medium text-[#7A736C] dark:text-[#B5AFA5]">
                  You
                </span>
                <div className="text-scaled-15 rounded-2xl rounded-br-sm bg-[#1A8CFF] px-4 py-3 leading-relaxed text-white shadow-sm dark:bg-[#0073E6]">
                  What was the process like?
                </div>
              </div>
            </motion.div>
          )}

          {/* Message 3 — tiptap / block content */}
          {showProcessMessages && (
            <motion.div variants={itemVariants} className="flex gap-3">
              <div className="mt-auto h-8 w-8 shrink-0 overflow-hidden rounded-full border border-black/5 dark:border-white/5">
                <img
                  src={avatarImageSrc || "/assets/svgs/avatar.svg"}
                  alt={firstName}
                  className="h-full w-full object-cover"
                  onError={() => setAvatarImageSrc("/assets/svgs/avatar.svg")}
                />
              </div>
              <div className="flex w-full flex-col gap-1">
                <span className="text-scaled-11 ml-1 font-medium text-[#7A736C] dark:text-[#B5AFA5]">
                  {firstName}
                </span>
                <div className="">
                  {project?.contentVersion === 2 && project?.tiptapContent ? (
                    <TiptapRenderer
                      className="w-full rounded-2xl rounded-bl-sm border border-black/5 bg-[#E5E2DB] p-4! transition-colors duration-700 dark:border-white/5 dark:bg-[#2A2520]"
                      key={project._id}
                      content={project.tiptapContent}
                    />
                  ) : project?.content ? (
                    <BlockRenderer
                      editorJsData={project.content}
                      className="w-full rounded-2xl rounded-bl-sm border border-black/5 bg-[#E5E2DB] p-4! transition-colors duration-700 dark:border-white/5 dark:bg-[#2A2520]"
                    />
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}

          {/* CTA */}
          {!edit && (
            <motion.div variants={itemVariants} className="mt-12 mb-8 flex justify-center">
              <button
                onClick={onBack}
                className="text-scaled-15 h-12 rounded-full bg-[#1A1A1A] px-8 font-medium text-white shadow-sm transition-colors hover:bg-[#333] dark:bg-white dark:text-[#1A1A1A] dark:hover:bg-gray-200"
              >
                Back to Projects
              </button>
            </motion.div>
          )}
        </div>
      </div>
      <Modal show={showModal} className={"md:block"}>
        <AnalyzeCaseStudy
          wordCount={wordCount}
          setShowModal={() => setShowModal(false)}
          suggestions={suggestions}
          rating={rating}
          projectId={project?._id}
          analyzeCallback={handleReAnalyze}
          isAnalyzing={isAnalyzing}
        />
      </Modal>
    </motion.div>
  );
}
