import { useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import TiptapRenderer from "@/components/tiptapRenderer";
import BlockRenderer from "@/components/blockRenderer";
import { _analyzeCaseStudy, _analyzeCaseStudyStatus, _updateProject } from "@/network/post-request";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { useGlobalContext } from "@/context/globalContext";
import queryClient from "@/network/queryClient";
import Modal from "@/components/modal";
import AnalyzeCaseStudy from "@/components/analyzeCaseStudy";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
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
      <path d="M10.5 7L9.98415 8.39405C9.30774 10.222 8.96953 11.136 8.30278 11.8028C7.63603 12.4695 6.72204 12.8077 4.89405 13.4842L3.5 14L4.89405 14.5158C6.72204 15.1923 7.63603 15.5305 8.30278 16.1972C8.96953 16.864 9.30774 17.778 9.98415 19.6059L10.5 21L11.0158 19.6059C11.6923 17.778 12.0305 16.864 12.6972 16.1972C13.364 15.5305 14.278 15.1923 16.1059 14.5158L17.5 14L16.1059 13.4842C14.278 12.8077 13.364 12.4695 12.6972 11.8028C12.0305 11.136 11.6923 10.222 11.0158 8.39405L10.5 7Z" fill="#FF553E" />
      <path d="M18.5 3L18.2789 3.59745C17.989 4.38087 17.8441 4.77259 17.5583 5.05833C17.2726 5.34408 16.8809 5.48903 16.0975 5.77892L15.5 6L16.0975 6.22108C16.8809 6.51097 17.2726 6.65592 17.5583 6.94167C17.8441 7.22741 17.989 7.61913 18.2789 8.40255L18.5 9L18.7211 8.40255C19.011 7.61913 19.1559 7.22741 19.4417 6.94166C19.7274 6.65592 20.1191 6.51097 20.9025 6.22108L21.5 6L20.9025 5.77892C20.1191 5.48903 19.7274 5.34408 19.4417 5.05833C19.1559 4.77259 19.011 4.38087 18.7211 3.59745L18.5 3Z" fill="#FF553E" />
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

export default function ChatProjectView({
  project,
  ownerUser,
  onBack,
  edit = false,
}) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { wordCount } = useGlobalContext();
  const avatarSrc = useMemo(
    () => getUserAvatarImage(ownerUser),
    [ownerUser],
  );
  const [avatarImageSrc, setAvatarImageSrc] = useState(avatarSrc);
  const firstName = ownerUser?.firstName || ownerUser?.name || "Me";
  const [isPassword, setIsPassword] = useState(project?.protected);
  const [passwordInput, setPasswordInput] = useState(project?.password || "");
  const [showModal, setShowModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [rating, setRating] = useState("");

  const projectId = project?._id || router.query.id;

  // Build a details grid from whatever project fields are present
  const detailFields = [
    (edit || project?.client) && { key: "client", label: "Client", value: project?.client },
    (edit || project?.role) && { key: "role", label: "Role", value: project?.role },
    (edit || project?.industry) && { key: "industry", label: "Industry", value: project?.industry },
    (edit || project?.platform) && { key: "platform", label: "Platform", value: project?.platform },
  ].filter(Boolean);

  const hasContent =
    (project?.contentVersion === 2 && project?.tiptapContent) ||
    project?.content;
  const showProcessPrompt = hasContent || edit;
  const showProcessMessages = !edit && hasContent;
  const needsMoreWords = suggestions?.length === 0 && wordCount < 400;
  const isAnalyzeDisabled = isAnalyzing || needsMoreWords;
  const analyzeButtonLabel = isAnalyzing
    ? "Analyzing..."
    : suggestions?.length > 0
      ? "Show Score Card"
      : needsMoreWords
        ? `${400 - wordCount} more words`
        : "Analyze with AI";

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
      item._id === projectId ? { ...item, [key]: value } : item,
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

  const fetchAnalyzeStatus = async () => {
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
  };

  const handleAnalyzeClick = async () => {
    if (suggestions.length > 0) {
      setShowModal(true);
      return;
    }
    setIsAnalyzing(true);
    const data = { userId: projectId, caseStudy: project, projectId: project?._id };
    try {
      const response = await _analyzeCaseStudy(data);
      setShowModal(true);
      setSuggestions(response.data.response);
      setRating(response.data.rating);
    } catch (e) {
      console.log(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReAnalyze = async () => {
    setIsAnalyzing(true);
    const data = { userId: projectId, caseStudy: project, projectId: project?._id };
    try {
      const response = await _analyzeCaseStudy(data);
      setShowModal(true);
      setSuggestions(response.data.response);
      setRating(response.data.rating);
    } catch (e) {
      console.log(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePasswordToggle = async () => {
    if (!projectId) return;
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
    if (!edit) return;
    fetchAnalyzeStatus();
  }, [edit]);

  useEffect(() => {
    setAvatarImageSrc(avatarSrc || "/assets/svgs/avatar.svg");
  }, [avatarSrc]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(
        "bg-[#F0EDE7] dark:bg-[#1A1A1A] flex justify-center font-inter text-[#1A1A1A] dark:text-[#F0EDE7] selection:bg-[#1A8CFF] selection:text-white transition-colors duration-700",
        edit ? "min-h-0" : "min-h-screen",
      )}
    >
      <div
        className={cn(
          "w-full max-w-[640px] flex flex-col relative px-4 sm:px-6",
          edit ? "pt-2 pb-6" : "min-h-screen pt-8 pb-24",
        )}
      >

        <motion.div variants={itemVariants} className="mb-6 pt-2">
          <div className={cn("py-2 px-4 flex justify-between items-center w-full", edit && "mt-20")}>
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] transition-colors group"
            >
              <ChevronLeft
                size={18}
                className="transition-transform group-hover:-translate-x-1"
              />
              Back to Projects
            </button>
            {edit && (
              <div className="flex items-center gap-2">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#2A2520]/50 hover:bg-black/5 dark:hover:bg-white/5 text-[#1A1A1A] dark:text-[#F0EDE7] transition-all focus-visible:ring-0 focus-visible:ring-offset-0"
                      title="Lock Project"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </Button>
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
                            className="h-10 bg-black/[0.03] dark:bg-white/[0.03] border-transparent rounded-xl text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 shadow-none placeholder:text-black/30 dark:placeholder:text-white/30"
                          />
                          <Button
                            size="sm"
                            onClick={handlePasswordSave}
                            className="rounded-xl h-9 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-black/80 dark:hover:bg-white/90 text-[13px]"
                          >
                            Save Password
                          </Button>
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {analyzeStatus && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAnalyzeClick}
                    disabled={isAnalyzeDisabled}
                    className={cn(
                      "h-7 text-[12px] rounded-full border border-black/10 dark:border-white/10",
                      "bg-white/50 dark:bg-[#2A2520]/50 text-[#1A1A1A] dark:text-[#F0EDE7]",
                      "flex items-center gap-1.5 px-3 transition-all focus-visible:ring-0 focus-visible:ring-offset-0",
                      "disabled:opacity-60 disabled:cursor-not-allowed",
                      !isAnalyzeDisabled && "hover:bg-black/5 dark:hover:bg-white/5",
                    )}
                  >
                    {isAnalyzing ? (
                      <AnimatedLoadingDots className="w-[18px] h-[5px] shrink-0" />
                    ) : (
                      <AnalyzeIcon className="w-4 h-4 shrink-0" />
                    )}
                    <span>{analyzeButtonLabel}</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        <div className="space-y-6">

          {/* Message 1 — title + description + cover image */}
          <motion.div
            variants={itemVariants}
            className="flex gap-3 max-w-[95%] pt-2"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-auto border border-black/5 dark:border-white/5">
              <img
                src={avatarImageSrc || "/assets/svgs/avatar.svg"}
                alt={firstName}
                className="w-full h-full object-cover"
                onError={() => setAvatarImageSrc("/assets/svgs/avatar.svg")}
              />
            </div>
            <div className="flex flex-col gap-1 w-full">
              <span className="text-[11px] text-[#7A736C] dark:text-[#B5AFA5] ml-1 font-medium">
                {firstName}
              </span>
              <div className="bg-[#E5E2DB] dark:bg-[#2A2520] p-4 rounded-2xl rounded-bl-sm transition-colors duration-700 border border-black/5 dark:border-white/5 w-full flex flex-col gap-4">
                <div className="flex flex-col text-left px-1">
                  <h1
                    className={cn(
                      "text-2xl font-semibold mb-2 leading-tight text-[#1A1A1A] dark:text-[#F0EDE7]",
                      edit && !project?.title && "text-[#C5BFB8] dark:text-[#4A4238] italic",
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
                        "text-[15px] leading-relaxed",
                        edit && !project?.description
                          ? "text-[#C5BFB8] dark:text-[#4A4238] italic"
                          : "text-[#7A736C] dark:text-[#B5AFA5]",
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
                  <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-[#F5F5F5] dark:bg-[#1A1A1A] relative border border-black/5 dark:border-white/5">
                    {edit ? (
                      <ImageWithOverlayAndPicker
                        src={project?.thumbnail?.url}
                        project={project}
                        aspectRatio="4/3"
                        recommendedSize="1200 × 900px"
                        className="rounded-none"
                      />
                    ) : (
                      <img
                        src={project.thumbnail.url}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* You: "Can you share more details?" */}
          <motion.div variants={itemVariants} className="flex justify-end">
            <div className="flex flex-col gap-1 max-w-[85%] items-end">
              <span className="text-[11px] text-[#7A736C] dark:text-[#B5AFA5] mr-1 font-medium">
                You
              </span>
              <div className="bg-[#1A8CFF] dark:bg-[#0073E6] text-white px-4 py-3 rounded-2xl rounded-br-sm text-[15px] leading-relaxed shadow-sm">
                Can you share more details about this project?
              </div>
            </div>
          </motion.div>

          {/* Message 2 — details grid (only if fields exist) */}
          {detailFields.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="flex gap-3 max-w-[95%]"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-auto border border-black/5 dark:border-white/5">
                <img
                  src={avatarImageSrc || "/assets/svgs/avatar.svg"}
                  alt={firstName}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarImageSrc("/assets/svgs/avatar.svg")}
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <span className="text-[11px] text-[#7A736C] dark:text-[#B5AFA5] ml-1 font-medium">
                  {firstName}
                </span>
                <div className="bg-[#E5E2DB] dark:bg-[#2A2520] px-5 py-4 rounded-2xl rounded-bl-sm transition-colors duration-700 border border-black/5 dark:border-white/5 w-full">
                  <p className="text-[#1A1A1A] dark:text-[#F0EDE7] text-[15px] mb-4">
                    Sure! Here are the core details:
                  </p>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    {detailFields.map(({ key, label, value }) => (
                      <div key={key} className="flex flex-col gap-1">
                        <span className="text-[12px] font-medium text-[#7A736C] dark:text-[#9E9893] uppercase tracking-wide">
                          {label}
                        </span>
                        <p
                          className={cn(
                            "text-[14px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7]",
                            edit && !value && "text-[#C5BFB8] dark:text-[#4A4238] italic",
                          )}
                          contentEditable={edit}
                          suppressContentEditableWarning
                          onBlur={(e) => handleOnBlur(key, e)}
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
              <div className="flex flex-col gap-1 max-w-[85%] items-end">
                <span className="text-[11px] text-[#7A736C] dark:text-[#B5AFA5] mr-1 font-medium">
                  You
                </span>
                <div className="bg-[#1A8CFF] dark:bg-[#0073E6] text-white px-4 py-3 rounded-2xl rounded-br-sm text-[15px] leading-relaxed shadow-sm">
                  What was the process like?
                </div>
              </div>
            </motion.div>
          )}

          {/* Message 3 — tiptap / block content */}
          {showProcessMessages && (
            <motion.div
              variants={itemVariants}
              className="flex gap-3 max-w-[95%]"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 mt-auto border border-black/5 dark:border-white/5">
                <img
                  src={avatarImageSrc || "/assets/svgs/avatar.svg"}
                  alt={firstName}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarImageSrc("/assets/svgs/avatar.svg")}
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <span className="text-[11px] text-[#7A736C] dark:text-[#B5AFA5] ml-1 font-medium">
                  {firstName}
                </span>
                <div className="">
                  {project?.contentVersion === 2 && project?.tiptapContent ? (
                    <TiptapRenderer
                      className="bg-[#E5E2DB] dark:bg-[#2A2520] !p-4 rounded-2xl rounded-bl-sm transition-colors duration-700 border border-black/5 dark:border-white/5 w-full"
                      key={project._id}
                      content={project.tiptapContent}
                    />
                  ) : project?.content ? (
                    <BlockRenderer editorJsData={project.content} className="bg-[#E5E2DB] dark:bg-[#2A2520] !p-4 rounded-2xl rounded-bl-sm transition-colors duration-700 border border-black/5 dark:border-white/5 w-full" />
                  ) : null}
                </div>
              </div>
            </motion.div>
          )}

          {/* CTA */}
          {!edit && (<motion.div
            variants={itemVariants}
            className="flex justify-center mt-12 mb-8"
          >
            <button
              onClick={onBack}
              className="rounded-full bg-[#1A1A1A] text-white hover:bg-[#333] dark:bg-white dark:text-[#1A1A1A] dark:hover:bg-gray-200 h-12 px-8 shadow-sm text-[15px] font-medium transition-colors"
            >
              Back to Projects
            </button>
          </motion.div>)}

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
