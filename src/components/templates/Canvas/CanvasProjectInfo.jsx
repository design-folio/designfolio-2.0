import {
  _analyzeCaseStudy,
  _analyzeCaseStudyStatus,
  _updateProject,
} from "@/network/post-request";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImageWithOverlayAndPicker } from "@/components/ImageWithOverlayAndPicker";
import queryClient from "@/network/queryClient";
import { toast } from "react-toastify";
import { useTheme } from "next-themes";
import AnalyzeIcon from "../../../../public/assets/svgs/analyze.svg";
import Modal from "@/components/modal";
import AnalyzeCaseStudy from "@/components/analyzeCaseStudy";
import { useGlobalContext } from "@/context/globalContext";
import AnimatedLoading from "@/components/AnimatedLoading";
import { TEMPLATE_IDS } from "@/lib/templates";
import { cn } from "@/lib/utils";

// Returns muted italic style for empty contentEditable placeholders
const ph = (val) =>
  val
    ? "text-[#1A1A1A] dark:text-[#F0EDE7]"
    : "text-[#C5BFB8] dark:text-[#4A4238] italic";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
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

function ProjectDetailField({ label, value, field, edit, handleOnBlur, handleInput }) {
  const [isPlaceholder, setIsPlaceholder] = useState(!value);

  useEffect(() => {
    setIsPlaceholder(!value);
  }, [value]);

  if (!edit && !value) return null;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-[#7A736C] dark:text-[#9E9893] uppercase tracking-wide">
        {label}
      </span>
      <p
        className={cn(
          "text-[15px] font-medium",
          isPlaceholder
            ? "text-[#C5BFB8] dark:text-[#4A4238] italic"
            : "text-[#1A1A1A] dark:text-[#F0EDE7]",
        )}
        contentEditable={edit}
        suppressContentEditableWarning
        onBlur={(e) => {
          const isEmpty = !e.target.textContent.trim();
          setIsPlaceholder(isEmpty);
          handleOnBlur(field, e);
        }}
        onFocus={(e) => {
          if (e.target.textContent === "Type here...") {
            e.target.textContent = "";
            setIsPlaceholder(true);
          } else {
            setIsPlaceholder(false);
          }
        }}
        onInput={(e) => {
          setIsPlaceholder(!e.currentTarget.textContent.trim());
          handleInput(e);
        }}
      >
        {value || "Type here..."}
      </p>
    </div>
  );
}

export default function CanvasProjectInfo({
  projectDetails,
  userDetails,
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
  } = projectDetails;

  // Track which fields are showing the placeholder so color updates live while typing
  const [titleIsPlaceholder, setTitleIsPlaceholder] = useState(!title);
  const [descIsPlaceholder, setDescIsPlaceholder] = useState(!description);

  const [isPassword, setIsPassword] = useState(projectDetails?.protected);
  const [passwordInput, setPasswordInput] = useState(password || "");
  const [imageLoaded, setImageLoaded] = useState(false);
  const { setTheme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const { wordCount } = useGlobalContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [rating, setRating] = useState("");

  const activeTemplate = ownerTemplate ?? userDetails?.template;
  const isMacOS = activeTemplate === TEMPLATE_IDS.RETRO_OS;
  const projectId = _id || router.query.id;
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
      queryClient.setQueriesData({ queryKey: ["userDetails"] }, (oldData) => ({
        user: { ...oldData?.user, projects: updatedProjects },
      }));
    }
  };

  const fetchAnalyzeStatus = async () => {
    try {
      const response = await _analyzeCaseStudyStatus(projectDetails._id);
      if (response.data.status) {
        setSuggestions(response.data.data.data.response);
        setRating(response.data.data.data.rating);
      }
      setAnalyzeStatus(true);
    } catch (e) {
      console.log(e);
    }
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

  const handleOnBlur = (field, e) => {
    saveProject(field, e.target.textContent);
    e.target.textContent =
      e.target.textContent.length > 0 ? e.target.textContent : "Type here...";
  };

  const handleAnalyzeClick = async () => {
    if (suggestions.length > 0) {
      setShowModal(true);
    } else {
      setIsAnalyzing(true);
      const data = { userId: _id, caseStudy: projectDetails, projectId: projectDetails._id };
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
    }
  };

  const handleReAnalyze = async () => {
    setIsAnalyzing(true);
    const data = { userId: _id, caseStudy: projectDetails, projectId: projectDetails._id };
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
    await _updateProject(projectId, { protected: !isPassword }).then((res) => {
      updateProjectCache("protected", res?.data?.project?.protected);
      setIsPassword((prev) => !prev);
    });
  };

  const handlePasswordSave = () => {
    _updateProject(projectId, { password: passwordInput }).then((res) => {
      updateProjectCache("password", res?.data?.project?.password);
      updateProjectCache("protected", res?.data?.project?.protected);
      toast.success("Password has been updated.");
    });
  };

  useEffect(() => {
    fetchAnalyzeStatus();
  }, []);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-3 w-full"
    >
      {/* Toolbar: Back + breadcrumb + lock + analyze */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-[#2A2520] rounded-[24px] border border-[#E5D7C4] dark:border-white/10 py-2 px-4 flex justify-between items-center w-full"
      >
        {!isMacOS ? (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[13px] font-medium text-[#7A736C] dark:text-[#9E9893] hover:text-[#1A1A1A] dark:hover:text-[#F0EDE7] transition-colors group"
          >
            <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
            Back to Projects
          </button>
        ) : <div />}

        <div className="flex items-center gap-4">
          {edit && (
            <div className="flex items-center gap-2">
              {/* Lock dropdown */}
              {!isMacOS && (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#2A2520]/50 hover:bg-black/5 dark:hover:bg-white/5 text-[#1A1A1A] dark:text-[#F0EDE7] transition-all focus-visible:ring-0 focus-visible:ring-offset-0"
                      title="Lock Case Study"
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
                            Require a password to view this project (e.g., for NDAs).
                          </p>
                        </div>
                        <Switch
                          checked={!!isPassword}
                          onCheckedChange={handlePasswordToggle}
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
                              <Button
                                size="sm"
                                onClick={handlePasswordSave}
                                className="rounded-xl h-9 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#1A1A1A] hover:bg-black/80 dark:hover:bg-white/90 text-[13px]"
                              >
                                Save Password
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Analyze with AI */}
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
                    <span className="pointer-events-none scale-75">
                      <AnimatedLoading />
                    </span>
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

      {/* Title + Description + Featured Image — combined */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-[#2A2520] rounded-[32px] border border-[#E5D7C4] dark:border-white/10 p-2 md:p-3 w-full"
      >
        <div className="p-4 md:p-5 pb-6 md:pb-8">
          <h1
            className={`text-[24px] font-semibold tracking-tight leading-tight mb-4 ${titleIsPlaceholder ? "text-[#C5BFB8] dark:text-[#4A4238] italic" : "text-[#1A1A1A] dark:text-[#F0EDE7]"}`}
            contentEditable={edit}
            suppressContentEditableWarning
            onFocus={(e) => {
              setTitleIsPlaceholder(false);
              if (e.target.textContent === "Type here...") e.target.textContent = "";
            }}
            onBlur={(e) => {
              const isEmpty = !e.target.textContent.trim();
              setTitleIsPlaceholder(isEmpty);
              handleOnBlur("title", e);
            }}
          >
            {title ? title : "Type here..."}
          </h1>
          {(edit || !!description) && (
            <p
              className={`text-[16px] leading-relaxed max-w-[600px] min-w-0 webkit-fill ${descIsPlaceholder ? "text-[#C5BFB8] dark:text-[#4A4238] italic" : "text-[#7A736C] dark:text-[#B5AFA5]"}`}
              contentEditable={edit}
              suppressContentEditableWarning
              onFocus={(e) => {
                setDescIsPlaceholder(false);
                if (e.target.textContent === "Type here...") e.target.textContent = "";
              }}
              onBlur={(e) => {
                const isEmpty = !e.target.textContent.trim();
                setDescIsPlaceholder(isEmpty);
                handleOnBlur("description", e);
              }}
            >
              {description ? description : "Type here..."}
            </p>
          )}
        </div>
        <div className="w-full rounded-[24px] overflow-hidden bg-[#F5F5F5] dark:bg-[#1A1A1A]">
          {edit ? (
            <ImageWithOverlayAndPicker src={thumbnail?.url} project={projectDetails} />
          ) : (
            <>
              <img
                src={thumbnail?.url}
                alt={title || "project image"}
                className={`w-full h-auto object-cover transition-opacity duration-100 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                loading="lazy"
                fetchPriority="high"
                decoding="async"
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && <div className="w-full aspect-[4/3] bg-[#F0EDE7] dark:bg-[#2A2520]" />}
            </>
          )}
        </div>
      </motion.div>

      {/* Project Details */}
      {(edit || !!client || !!role || !!industry || !!platform) && (
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-[#2A2520] rounded-[32px] border border-[#E5D7C4] dark:border-white/10 p-6 md:p-8 w-full"
        >
          <h2 className="text-[#7A736C] dark:text-[#B5AFA5] font-dm-mono font-medium text-[14px] mb-6">
            PROJECT DETAILS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Client", value: client, field: "client" },
              { label: "My Role", value: role, field: "role" },
              { label: "Industry", value: industry, field: "industry" },
              { label: "Platform", value: platform, field: "platform" },
            ].map(({ label, value, field }) => (
              <ProjectDetailField
                key={field}
                label={label}
                value={value}
                field={field}
                edit={edit}
                handleOnBlur={handleOnBlur}
                handleInput={handleInput}
              />
            ))}
          </div>
        </motion.div>
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
    </motion.div>
  );
}
