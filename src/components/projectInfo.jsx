import { _analyzeCaseStudy, _analyzeCaseStudyStatus, _updateProject } from "@/network/post-request";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback, startTransition } from "react";
import * as Yup from "yup";
import LeftArrow from "../../public/assets/svgs/left-arrow.svg";
import LockIcon from "../../public/assets/svgs/lock.svg";
import LockOpenIcon from "../../public/assets/svgs/lock-open.svg";
import Button from "./button";
import { Button as UIButton } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { popovers } from "@/lib/constant";
import { ErrorMessage, Field, Form, Formik } from "formik";
import Toggle from "./toggle";
import Text from "./text";
import EyeIcon from "../../public/assets/svgs/eye.svg";
import EyeCloseIcon from "../../public/assets/svgs/eye-close.svg";
import { ImageWithOverlayAndPicker } from "./ImageWithOverlayAndPicker";
import queryClient from "@/network/queryClient";
import { toast } from "react-toastify";
import { useTheme } from "next-themes";
import Modal from "./modal";
import AnalyzeCaseStudy from "./analyzeCaseStudy";
import { useGlobalContext } from "@/context/globalContext";
import AnimatedLoading from "./AnimatedLoading";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TEMPLATE_IDS } from "@/lib/templates";
import CanvasProjectInfo from "@/components/templates/Canvas/CanvasProjectInfo";
import ProfessionalProjectInfo from "@/components/templates/Professional/ProfessionalProjectInfo";
import ChatProjectView from "@/components/templates/Chat/ChatProjectView";
export default function ProjectInfo({
  projectDetails,
  userDetails,
  setPopoverMenu,
  popoverMenu,
  edit,
  ownerTemplate,
}) {
  const {
    client,
    industry,
    platform,
    role,
    title,
    thumbnail,
    description,
    password,
    _id,
    template,
  } = projectDetails;

  const [isPassword, setPassword] = useState(projectDetails?.protected);
  const [passwordInput, setPasswordInput] = useState(password || "");
  const [showEye, setShowEye] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { setTheme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const {
    wordCount,
    setShowUpgradeModal,
    setUpgradeModalSource,
    analysisCreditsRemaining,
    setAnalysisCreditsRemaining,
  } = useGlobalContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [AnalyzeStatus, setAnalyzeStatus] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [score, setScore] = useState(0);
  const [rating, setRating] = useState("");
  // ownerTemplate (from SSR prop) takes priority; fall back to the logged-in user's template
  // only in builder/preview contexts where ownerTemplate is not passed.
  const activeTemplate = ownerTemplate ?? userDetails?.template ?? TEMPLATE_IDS.CANVAS;
  const isMacOS = activeTemplate === TEMPLATE_IDS.RETRO_OS;
  const isCanvas = activeTemplate === TEMPLATE_IDS.CANVAS;
  const isChatfolio = activeTemplate === TEMPLATE_IDS.CHATFOLIO;
  const isMono = activeTemplate === TEMPLATE_IDS.MONO;
  const isProfessional = activeTemplate === TEMPLATE_IDS.PROFESSIONAL;
  // Use the project's own _id when available (e.g. when rendered inside a
  // floating ProjectWindow where router.query.id is not set).
  const projectId = _id || router.query.id;

  const saveProject = (key, value) => {
    _updateProject(projectId, { [key]: value }).then((res) => {
      setTheme(res?.data?.project?.theme == 1 ? "dark" : "light");
      updateProjectCache(key, value);
    });
  };

  const updateProjectCache = (key, value) => {
    if (userDetails) {
      const updatedProjects = userDetails?.projects?.map((item) =>
        item._id === projectId ? { ...item, [key]: value } : item
      );
      queryClient.setQueriesData({ queryKey: ["userDetails"] }, (oldData) => {
        return { user: { ...oldData?.user, projects: updatedProjects } };
      });
    }
  };

  const fetchAnalyzeStatus = useCallback(async () => {
    try {
      const response = await _analyzeCaseStudyStatus(projectDetails._id);
      if (response.data.status) {
        setSuggestions(response.data.data.data.response);
        setScore(response.data.data.data.weightedAverageRounded);
        setRating(response.data.data.data.rating);
      }
      setAnalyzeStatus(true);
    } catch (e) {
      console.log(e);
    }
  }, [projectDetails]);

  const handleInput = (e) => {
    const textContent = e.target.textContent;
    if (textContent.length > 110) {
      // Prevent typing beyond 110 characters
      e.target.textContent = textContent.slice(0, 110);
      // Move the cursor to the end of the text
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(e.target);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  const handleOnBlur = (field, e) => {
    saveProject(field, e.target.textContent);
    e.target.textContent = e.target.textContent.length > 0 ? e.target.textContent : "Type here...";
  };

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

  const handleAnalyzeClick = async () => {
    if (suggestions.length > 0) {
      setShowModal(true);
      return;
    }
    if (analysisCreditsRemaining !== null && analysisCreditsRemaining <= 0) {
      setUpgradeModalSource("analyze");
      setShowUpgradeModal(true);
      return;
    }
    setIsAnalyzing(true);
    const data = {
      userId: _id,
      caseStudy: projectDetails,
      projectId: projectDetails._id,
    };
    try {
      const response = await _analyzeCaseStudy(data);
      setShowModal(true);
      setSuggestions(response.data.response);
      setScore(response.data.weightedAverageRounded);
      setRating(response.data.rating);
      setAnalysisCreditsRemaining((prev) =>
        prev !== null && prev !== Infinity ? Math.max(0, prev - 1) : prev
      );
    } catch (e) {
      setUpgradeModalSource("analyze");
      setShowUpgradeModal(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReAnalyze = async () => {
    setIsAnalyzing(true);
    const data = {
      userId: _id,
      caseStudy: projectDetails,
      projectId: projectDetails._id,
    };
    try {
      const response = await _analyzeCaseStudy(data);
      setShowModal(true);
      setSuggestions(response.data.response);
      setScore(response.data.weightedAverageRounded);
      setRating(response.data.rating);
      setAnalysisCreditsRemaining((prev) =>
        prev !== null && prev !== Infinity ? Math.max(0, prev - 1) : prev
      );
    } catch (e) {
      setUpgradeModalSource("analyze");
      setShowUpgradeModal(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const validationSchema = Yup.object().shape({
    password: isPassword
      ? Yup.string()
          .required("Password is required.")
          .min(6, "Password is too short - should be 6 chars minimum.")
      : Yup.string().min(6, "Password is too short - should be 6 chars minimum."),
  });

  const handleBack = () => {
    router.back({ scroll: false });
  };

  const handlePasswordRadio = async () => {
    await _updateProject(projectId, { protected: !isPassword }).then((res) => {
      updateProjectCache("protected", res?.data?.project?.protected);
      setPassword((prev) => !prev);
    });
  };

  const handlePasswordSave = () => {
    _updateProject(projectId, { password: passwordInput }).then((res) => {
      updateProjectCache("password", res?.data?.project?.password);
      updateProjectCache("protected", res?.data?.project?.protected);
      toast.success("Password saved.");
    });
  };

  useEffect(() => {
    startTransition(() => void fetchAnalyzeStatus());
  }, [fetchAnalyzeStatus]);

  // ─── Professional (template 5) layout ────────────────────────────────────
  if (isProfessional) {
    return (
      <ProfessionalProjectInfo
        projectDetails={projectDetails}
        userDetails={userDetails}
        edit={edit}
        ownerTemplate={ownerTemplate}
      />
    );
  }

  // ─── Canvas (template 0) layout ─────────────────────────────────────────
  if (isCanvas) {
    return (
      <CanvasProjectInfo
        projectDetails={projectDetails}
        userDetails={userDetails}
        edit={edit}
        ownerTemplate={ownerTemplate}
      />
    );
  }

  // ─── Chatfolio (template 1) layout ────────────────────────────────────────
  if (isChatfolio) {
    return (
      <ChatProjectView
        project={projectDetails}
        ownerUser={userDetails}
        onBack={handleBack}
        edit={edit}
      />
    );
  }

  // ─── Mono (template 3) layout ─────────────────────────────────────────────
  if (isMono) {
    const monoDetailFields = [
      { key: "client", label: "Client", value: client },
      { key: "role", label: "My Role", value: role },
      { key: "industry", label: "Industry", value: industry },
      { key: "platform", label: "Platform", value: platform },
    ].filter(({ value }) => edit || !!value);

    return (
      <div className="flex flex-col w-full">
        {/* Header: Back + editing controls */}
        {(!isMacOS || edit) && (
          <div className="px-5 md:px-8 pt-8 pb-6 flex items-center justify-between gap-3">
            {!isMacOS && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-[13px] font-medium text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] transition-colors group"
              >
                <ChevronLeft
                  size={18}
                  className="transition-transform group-hover:-translate-x-1"
                />
                Go back
              </button>
            )}
            {edit && (
              <div className="flex items-center gap-2">
                {/* Lock dropdown */}
                {!isMacOS && (
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <UIButton
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#2A2520]/50 hover:bg-black/5 dark:hover:bg-white/5 text-[#1A1A1A] dark:text-[#F0EDE7] transition-all focus-visible:ring-0 focus-visible:ring-offset-0"
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
                      </UIButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="w-[300px] p-4 bg-white/95 dark:bg-[#2A2520]/95 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-2xl shadow-xl z-50"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <Label className="text-[14px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] cursor-pointer">
                              Protect Project
                            </Label>
                            <p className="text-[12px] text-[#7A736C] dark:text-[#9E9893] leading-snug">
                              Require a password to view this project (e.g., for NDAs).
                            </p>
                          </div>
                          <Switch
                            checked={!!isPassword}
                            onCheckedChange={handlePasswordRadio}
                            className="mt-0.5 data-[state=checked]:bg-[#1A1A1A] dark:data-[state=checked]:bg-[#F0EDE7]"
                          />
                        </div>
                        <AnimatePresence>
                          {isPassword && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-col gap-2">
                                <Input
                                  type="password"
                                  placeholder="Enter password"
                                  value={passwordInput}
                                  onChange={(e) => setPasswordInput(e.target.value)}
                                  className="h-10 bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30"
                                />
                                <UIButton
                                  size="sm"
                                  onClick={handlePasswordSave}
                                  className="rounded-xl h-9 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-black/80 dark:hover:bg-white/90 text-[13px]"
                                >
                                  Save Password
                                </UIButton>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Analyze with AI */}
                {AnalyzeStatus && (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={cn(
                            "inline-flex",
                            isAnalyzeDisabled ? "cursor-not-allowed" : "cursor-pointer"
                          )}
                        >
                          <UIButton
                            variant="outline"
                            size="sm"
                            onClick={handleAnalyzeClick}
                            disabled={isAnalyzeDisabled}
                            className={cn(
                              "h-7 text-[12px] rounded-full border border-black/10 dark:border-white/10",
                              "bg-white/50 dark:bg-[#2A2520]/50 text-[#1A1A1A] dark:text-[#F0EDE7]",
                              "flex items-center gap-1.5 px-3 transition-all focus-visible:ring-0 focus-visible:ring-offset-0",
                              "cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
                              !isAnalyzeDisabled && "hover:bg-black/5 dark:hover:bg-white/5"
                            )}
                          >
                            {isAnalyzing ? (
                              <svg
                                className="w-[18px] h-[5px] shrink-0"
                                viewBox="0 0 22 6"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <circle
                                  className="bounce"
                                  cx="3.03448"
                                  cy="3.0003"
                                  r="2.53448"
                                  fill="#FF553E"
                                />
                                <circle
                                  className="bounce"
                                  cx="11.0001"
                                  cy="3.0003"
                                  r="2.53448"
                                  fill="#FF553E"
                                />
                                <circle
                                  className="bounce"
                                  cx="18.9655"
                                  cy="3.0003"
                                  r="2.53448"
                                  fill="#FF553E"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4 shrink-0"
                                viewBox="0 0 25 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M10.5 7L9.98415 8.39405C9.30774 10.222 8.96953 11.136 8.30278 11.8028C7.63603 12.4695 6.72204 12.8077 4.89405 13.4842L3.5 14L4.89405 14.5158C6.72204 15.1923 7.63603 15.5305 8.30278 16.1972C8.96953 16.864 9.30774 17.778 9.98415 19.6059L10.5 21L11.0158 19.6059C11.6923 17.778 12.0305 16.864 12.6972 16.1972C13.364 15.5305 14.278 15.1923 16.1059 14.5158L17.5 14L16.1059 13.4842C14.278 12.8077 13.364 12.4695 12.6972 11.8028C12.0305 11.136 11.6923 10.222 11.0158 8.39405L10.5 7Z"
                                  fill="#FF553E"
                                />
                                <path
                                  d="M18.5 3L18.2789 3.59745C17.989 4.38087 17.8441 4.77259 17.5583 5.05833C17.2726 5.34408 16.8809 5.48903 16.0975 5.77892L15.5 6L16.0975 6.22108C16.8809 6.51097 17.2726 6.65592 17.5583 6.94167C17.8441 7.22741 17.989 7.61913 18.2789 8.40255L18.5 9L18.7211 8.40255C19.011 7.61913 19.1559 7.22741 19.4417 6.94166C19.7274 6.65592 20.1191 6.51097 20.9025 6.22108L21.5 6L20.9025 5.77892C20.1191 5.48903 19.7274 5.34408 19.4417 5.05833C19.1559 4.77259 19.011 4.38087 18.7211 3.59745L18.5 3Z"
                                  fill="#FF553E"
                                />
                              </svg>
                            )}
                            {analyzeButtonLabel}
                          </UIButton>
                        </span>
                      </TooltipTrigger>
                      {tooltipMessage && (
                        <TooltipContent
                          side="bottom"
                          className="bg-foreground text-background text-xs px-2 py-1 rounded"
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
        )}

        <div className="custom-dashed-t" />

        {/* Title + subtitle */}
        <div className="px-5 md:px-8 pt-8 pb-6">
          <h1
            className="text-[24px] font-semibold mb-3 tracking-tight text-[#1A1A1A] dark:text-[#F0EDE7]"
            contentEditable={edit}
            suppressContentEditableWarning
            onBlur={(e) => handleOnBlur("title", e)}
            onFocus={(e) => {
              if (e.target.textContent === "Type here...") e.target.textContent = "";
            }}
          >
            {title ? title : "Type here..."}
          </h1>
          {(edit || !!description) && (
            <p
              className="text-[#7A736C] dark:text-[#B5AFA5] text-base leading-relaxed min-w-0 webkit-fill"
              style={{ fontWeight: 450 }}
              contentEditable={edit}
              suppressContentEditableWarning
              onBlur={(e) => handleOnBlur("description", e)}
              onFocus={(e) => {
                if (e.target.textContent === "Type here...") e.target.textContent = "";
              }}
            >
              {description ? description : "Type here..."}
            </p>
          )}
        </div>

        {/* Featured Image */}
        <div className="px-5 md:px-8 pb-4">
          {edit ? (
            <ImageWithOverlayAndPicker
              src={thumbnail?.url}
              project={projectDetails}
              aspectRatio="3/2"
              recommendedSize="1600 × 900px"
            />
          ) : (
            <figure className="relative w-full aspect-[3/2] rounded-xl overflow-hidden drop-shadow-sm border border-black/5 dark:border-white/10">
              <img
                src={thumbnail?.url}
                alt="project image"
                className={`w-full h-full object-cover transition-opacity duration-100 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                loading="lazy"
                fetchPriority="high"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && <div className="absolute inset-0 bg-[#E5D7C4] dark:bg-[#2A2520]" />}
            </figure>
          )}
        </div>

        {/* Project Details */}
        {monoDetailFields.length > 0 && (
          <div className="px-5 md:px-8 py-5">
            <div className="flex items-center gap-2 mb-4">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-[#463B34] dark:text-[#D4C9BC]"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <h2 className="text-[11px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-mono uppercase tracking-widest">
                Project Details
              </h2>
            </div>
            <div className="border border-[#C8C4BD] dark:border-[#3A352E] rounded-lg overflow-hidden bg-[#E7E3D9] dark:bg-[#2A2520]">
              {monoDetailFields.map(({ key, label, value }, index) => (
                <div
                  key={key}
                  className={`flex justify-between items-center px-4 py-3 ${index !== monoDetailFields.length - 1 ? "border-b border-[#C8C4BD] dark:border-[#3A352E]" : ""}`}
                >
                  <span className="text-[12px] font-medium text-[#463B34] dark:text-[#D4C9BC] uppercase tracking-wide">
                    {label}
                  </span>
                  <p
                    className="text-base text-[#7A736C] dark:text-[#B5AFA5]"
                    style={{ fontWeight: 450 }}
                    contentEditable={edit}
                    suppressContentEditableWarning
                    onBlur={(e) => handleOnBlur(key, e)}
                    onFocus={(e) => {
                      if (e.target.textContent === "Type here...") e.target.textContent = "";
                    }}
                    onInput={handleInput}
                  >
                    {value ? value : "Type here..."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="custom-dashed-t" />

        <Modal show={showModal} className={"md:block"}>
          <AnalyzeCaseStudy
            wordCount={wordCount}
            setShowModal={() => setShowModal(false)}
            suggestions={suggestions}
            rating={rating}
            projectId={projectDetails._id}
            analyzeCallback={handleReAnalyze}
            isAnalyzing={isAnalyzing}
          />
        </Modal>
      </div>
    );
  }

  // ─── Default layout (all other templates) ────────────────────────────────
  return (
    <div className="bg-df-section-card-bg-color rounded-[26px] p-[16px] md:p-[32px]">
      <div className="flex justify-between items-center mb-2">
        {!isMacOS && (
          <Button
            text="Go Back"
            onClick={handleBack}
            type="secondary"
            size="small"
            icon={<LeftArrow className="text-df-icon-color cursor-pointer" />}
          />
        )}

        {edit && (
          <div className="flex gap-3 items-center justify-center">
            {AnalyzeStatus && (
              <>
                <Button
                  type="secondary"
                  size="small"
                  customClass="hidden md:flex"
                  text={suggestions?.length > 0 ? "Show Score Card" : "Analyze with AI"}
                  onClick={() => handleAnalyzeClick()}
                  iconPosition={isAnalyzing ? "right" : "left"}
                  icon={
                    isAnalyzing ? (
                      <AnimatedLoading className="cursor-pointer" />
                    ) : (
                      <AnalyzeIcon className="cursor-pointer" />
                    )
                  }
                  isDisabled={
                    isAnalyzing ||
                    (suggestions?.length === 0 && wordCount !== null && wordCount < 400)
                  }
                />
                <Button
                  type="secondary"
                  size="small"
                  onClick={() => handleAnalyzeClick()}
                  customClass="md:hidden"
                  iconPosition={isAnalyzing ? "right" : "left"}
                  icon={
                    isAnalyzing ? (
                      <AnalyzeIcon className="cursor-pointer" />
                    ) : (
                      <AnimatedLoading className="cursor-pointer" />
                    )
                  }
                  isDisabled={
                    isAnalyzing ||
                    (suggestions?.length === 0 && wordCount !== null && wordCount < 400)
                  }
                />
              </>
            )}
            {!isMacOS && (
              <div className=" relative" data-popover-id={popovers.password}>
                <Button
                  type="secondary"
                  size="small"
                  onClick={() =>
                    setPopoverMenu((prev) => (prev == popovers.password ? null : popovers.password))
                  }
                  icon={
                    isPassword ? (
                      <LockIcon className="stroke-bg-df-icon-color cursor-pointer" />
                    ) : (
                      <LockOpenIcon className="stroke-bg-df-icon-color cursor-pointer" />
                    )
                  }
                  customClass="p-2.5"
                />

                <div
                  className={`pt-2 origin-top-right absolute z-50 right-0 transition-all will-change-transform translateZ(0) duration-120 ease-in-out ${
                    popoverMenu === popovers.password
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-90 pointer-events-none"
                  }`}
                >
                  <div className=" w-[350px] md:w-[386px]  bg-popover-bg-color rounded-2xl shadow-lg border-[5px] border-popover-border-color p-2">
                    <Formik
                      initialValues={{
                        password: password,
                      }}
                      validateOnChange
                      validateOnBlur
                      validationSchema={validationSchema}
                      onSubmit={(values, actions) => {
                        _updateProject(projectId, {
                          password: values.password,
                        }).then((res) => {
                          updateProjectCache("password", res?.data?.project?.password);
                          updateProjectCache("protected", res?.data?.project?.protected);
                          actions.setSubmitting(false);
                          toast.success("Password has been updated.");
                        });
                      }}
                    >
                      {({ isSubmitting, errors, touched, validateField }) => (
                        <Form id="projectForm" autoComplete="off">
                          <div className="bg-input-password-bg-color rounded-lg  py-4 px-3 transition-all">
                            <div className="flex justify-between gap-[12px] items-center">
                              <div>
                                <Text
                                  size={"p-xxsmall"}
                                  className="font-medium text-input-password-heading-color"
                                >
                                  Set Password
                                </Text>
                                <Text
                                  size={"p-xxsmall"}
                                  className="font-medium text-input-password-description-color"
                                >
                                  Protect your project if you&apos;ve an NDA.
                                </Text>
                              </div>
                              <Toggle onClick={handlePasswordRadio} value={isPassword} />
                            </div>
                            {isPassword && (
                              <>
                                <div className="relative mt-2">
                                  <Field
                                    name="password"
                                    type={showEye ? "text" : "password"}
                                    className={`text-input mt-2 ${
                                      errors.password &&
                                      touched.password &&
                                      "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                                    }`}
                                    placeholder="Password"
                                    autocomplete="new-password"
                                  />
                                  <div
                                    className="absolute top-[24px] right-4 cursor-pointer"
                                    onClick={(event) => {
                                      event.stopPropagation(); // Prevent event from bubbling up

                                      setShowEye((prev) => !prev);
                                      validateField("password");
                                    }}
                                  >
                                    {showEye ? (
                                      <EyeIcon className="text-df-icon-color" />
                                    ) : (
                                      <EyeCloseIcon className="text-df-icon-color" />
                                    )}
                                  </div>
                                </div>
                                <ErrorMessage
                                  name="password"
                                  component="div"
                                  className="error-message"
                                />
                              </>
                            )}
                          </div>
                          {isPassword && (
                            <div className="flex gap-2 justify-end mt-4">
                              <Button
                                text="Cancel"
                                onClick={() => setPopoverMenu(null)}
                                type="secondary"
                              />
                              <Button
                                type="modal"
                                text={"Change"}
                                isLoading={isSubmitting}
                                btnType="submit"
                                form="projectForm"
                              />
                            </div>
                          )}
                        </Form>
                      )}
                    </Formik>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <h1
        className="text-3xl font-semibold text-df-heading-color"
        contentEditable={edit}
        suppressContentEditableWarning
        onBlur={(e) => handleOnBlur("title", e)}
        onFocus={(e) => {
          if (e.target.textContent === "Type here...") {
            e.target.textContent = "";
          }
        }}
      >
        {title ? title : "Type here..."}
      </h1>

      {(edit || !!description) && (
        <p
          className="text-[16px] text-df-description-color font-inter font-[500] mt-2 min-w-0 webkit-fill"
          contentEditable={edit}
          suppressContentEditableWarning
          onBlur={(e) => handleOnBlur("description", e)}
          onFocus={(e) => {
            if (e.target.textContent === "Type here...") {
              e.target.textContent = "";
            }
          }}
        >
          {description ? description : "Type here..."}
        </p>
      )}

      <div className="flex flex-col gap-4 md:grid md:grid-cols-4 md:gap-6 mt-4">
        {(edit || !!client) && (
          <div>
            <p className="text-[14px] text-df-heading-color font-inter font-[500]">
              App name / Client
            </p>
            <p
              className="text-[14px] text-df-description-color font-inter font-[500]"
              contentEditable={edit}
              suppressContentEditableWarning
              onBlur={(e) => handleOnBlur("client", e)}
              onFocus={(e) => {
                if (e.target.textContent === "Type here...") {
                  e.target.textContent = "";
                }
              }}
              onInput={handleInput}
            >
              {client ? client : "Type here..."}
            </p>
          </div>
        )}

        {(edit || !!role) && (
          <div>
            <p className="text-[14px] text-df-heading-color font-inter font-[500]">My Role</p>
            <p
              className="text-[14px] text-df-description-color font-inter font-[500]"
              contentEditable={edit}
              suppressContentEditableWarning
              onBlur={(e) => handleOnBlur("role", e)}
              onFocus={(e) => {
                if (e.target.textContent === "Type here...") {
                  e.target.textContent = "";
                }
              }}
              onInput={handleInput}
            >
              {role ? role : "Type here..."}
            </p>
          </div>
        )}
        {(edit || !!industry) && (
          <div>
            <p className="text-[14px] text-df-heading-color font-inter font-[500]">Industry</p>
            <p
              className="text-[14px] text-df-description-color font-inter font-[500]"
              contentEditable={edit}
              suppressContentEditableWarning
              onBlur={(e) => handleOnBlur("industry", e)}
              onFocus={(e) => {
                if (e.target.textContent === "Type here...") {
                  e.target.textContent = "";
                }
              }}
              onInput={handleInput}
            >
              {industry ? industry : "Type here..."}
            </p>
          </div>
        )}
        {(edit || !!platform) && (
          <div>
            <p className="text-[14px] text-df-heading-color font-inter font-[500]">Platform</p>
            <p
              className="text-[14px] text-df-description-color font-inter font-[500]"
              contentEditable={edit}
              suppressContentEditableWarning
              onBlur={(e) => handleOnBlur("platform", e)}
              onFocus={(e) => {
                if (e.target.textContent === "Type here...") {
                  e.target.textContent = "";
                }
              }}
              onInput={handleInput}
            >
              {platform ? platform : "Type here..."}
            </p>
          </div>
        )}
      </div>
      {edit ? (
        <ImageWithOverlayAndPicker
          src={thumbnail?.url}
          project={projectDetails}
          aspectRatio="3/2"
          recommendedSize="1600 × 900px"
          className="mt-6 md:mt-8"
        />
      ) : (
        <figure className="relative w-full aspect-[3/2] rounded-[20px] overflow-hidden mt-6 md:mt-8">
          <img
            src={thumbnail?.url}
            alt="project image"
            className={`w-full h-full object-cover transition-opacity duration-100 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            loading="lazy"
            fetchPriority="high"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && <div className="absolute inset-0 bg-df-placeholder-color" />}
        </figure>
      )}
      <Modal show={showModal} className={"md:block"}>
        <AnalyzeCaseStudy
          wordCount={wordCount}
          setShowModal={() => setShowModal(false)}
          suggestions={suggestions}
          rating={rating}
          projectId={projectDetails._id}
          analyzeCallback={handleReAnalyze}
          isAnalyzing={isAnalyzing}
        />
      </Modal>
    </div>
  );
}

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
