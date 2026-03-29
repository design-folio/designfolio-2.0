import {
  _analyzeCaseStudy,
  _analyzeCaseStudyStatus,
  _updateProject,
} from "@/network/post-request";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/router";
import TiptapRenderer from "@/components/tiptapRenderer";
import BlockRenderer from "@/components/blockRenderer";
import { ImageWithOverlayAndPicker } from "@/components/ImageWithOverlayAndPicker";
import { itemVariants, frameBorderClass, screwClass, extractText } from "./professional-utils";
import queryClient from "@/network/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Modal from "@/components/modal";
import AnalyzeCaseStudy from "@/components/analyzeCaseStudy";
import { useGlobalContext } from "@/context/globalContext";
import { toast } from "react-toastify";

const ScrewDot = ({ className }) => (
  <div className={`absolute ${className} ${screwClass}`} />
);

const FrameScrews = () => (
  <>
    <ScrewDot className="top-2.5 left-2.5 md:top-3 md:left-3" />
    <ScrewDot className="top-2.5 right-2.5 md:top-3 md:right-3" />
    <ScrewDot className="bottom-2.5 left-2.5 md:bottom-3 md:left-3" />
    <ScrewDot className="bottom-2.5 right-2.5 md:bottom-3 md:right-3" />
  </>
);

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

// Editable detail field used in edit mode
function EditableDetailField({ label, field, value, onBlur }) {
  const [isPlaceholder, setIsPlaceholder] = useState(!value);
  useEffect(() => { setIsPlaceholder(!value); }, [value]);

  return (
    <div>
      <h4 className="font-jetbrains text-[11px] text-[#7A736C] dark:text-[#9E9893] uppercase tracking-wider mb-2">
        {label}
      </h4>
      <p
        className={`font-jetbrains text-[13px] uppercase outline-none ${isPlaceholder ? "text-[#B5AFA5] dark:text-[#4A4238] italic" : "text-[#1A1A1A] dark:text-[#F0EDE7]"}`}
        contentEditable
        suppressContentEditableWarning
        onFocus={(e) => {
          setIsPlaceholder(false);
          if (e.target.textContent === "Type here...") e.target.textContent = "";
        }}
        onBlur={(e) => {
          const isEmpty = !e.target.textContent.trim();
          setIsPlaceholder(isEmpty);
          onBlur(field, e);
          if (isEmpty) e.target.textContent = "Type here...";
        }}
      >
        {value || "Type here..."}
      </p>
    </div>
  );
}

export default function ProfessionalProjectInfo({ projectDetails, userDetails, edit = false }) {
  const router = useRouter();
  const { wordCount } = useGlobalContext();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [titleIsPlaceholder, setTitleIsPlaceholder] = useState(false);
  const [descIsPlaceholder, setDescIsPlaceholder] = useState(false);
  const [isPassword, setIsPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isLockOpen, setIsLockOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [rating, setRating] = useState("");

  const {
    title,
    description,
    thumbnail,
    client,
    role,
    industry,
    platform,
    contentVersion,
    tiptapContent,
    content,
    _id,
    password,
    protected: isProtected,
  } = projectDetails || {};

  useEffect(() => {
    setIsPassword(!!isProtected);
    setPasswordInput(password || "");
    setTitleIsPlaceholder(!title);
    setDescIsPlaceholder(!description);
  }, [isProtected, password, title, description]);

  useEffect(() => {
    if (edit) fetchAnalyzeStatus();
  }, [edit]);

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

  const saveProject = (key, value) => {
    _updateProject(projectId, { [key]: value }).then(() => {
      updateProjectCache(key, value);
    });
  };

  const handleOnBlur = (field, e) => {
    const val = e.target.textContent.trim();
    saveProject(field, val);
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

  const detailFields = [
    { label: "Client", value: client, field: "client" },
    { label: "My Role", value: role, field: "role" },
    { label: "Industry", value: industry, field: "industry" },
    { label: "Platform", value: platform, field: "platform" },
  ];

  const viewDetailFields = detailFields.filter((f) => f.value);
  const hasTiptapContent = contentVersion === 2 && tiptapContent;
  const hasEditorJSContent = contentVersion === 1 && content;
  const descriptionText = extractText(description);

  const innerContent = (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`w-full max-w-[640px] relative bg-[#EFECE6] dark:bg-[#1A1A1A] flex flex-col transition-colors duration-700 border-x border-[#D5D0C6] dark:border-[#3A352E] ${edit ? "" : "min-h-screen"}`}
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className={`border-b border-[#D5D0C6] dark:border-[#3A352E] flex justify-between items-center px-4 py-3 font-jetbrains text-[13px] uppercase tracking-wide text-[#1A1A1A] dark:text-[#B5AFA5] bg-[#EFECE6] dark:bg-[#1A1A1A] ${edit ? "" : "sticky top-0 z-50"}`}
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 hover:text-[#E37941] transition-colors"
        >
          <ChevronLeft size={16} /> BACK
        </button>

        <div className="flex items-center gap-3">
          {edit && (
            <>
              {/* Lock dropdown */}
              <DropdownMenu modal={false} open={isLockOpen} onOpenChange={setIsLockOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-1.5 hover:text-[#E37941] transition-colors"
                  // title="Lock Case Study"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-[280px] p-4 bg-[#EFECE6] dark:bg-[#1A1A1A] border border-[#D5D0C6] dark:border-[#3A352E] rounded-none shadow-xl z-50 font-jetbrains"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <Label className="text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7] uppercase tracking-wider cursor-pointer">
                          Protect Project
                        </Label>
                        <p className="text-[11px] text-[#7A736C] dark:text-[#9E9893] leading-snug">
                          Require a password (e.g., for NDAs).
                        </p>
                      </div>
                      <Switch
                        checked={!!isPassword}
                        onCheckedChange={handlePasswordToggle}
                        className="mt-0.5"
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
                              className="h-9 text-[13px] rounded-none border-[#D5D0C6] dark:border-[#3A352E] bg-white/50 dark:bg-white/5"
                            />
                            <Button
                              size="sm"
                              onClick={handlePasswordSave}
                              className="rounded-none h-8 bg-[#1A1A1A] dark:bg-[#F0EDE7] text-white dark:text-[#1A1A1A] text-[12px] font-jetbrains uppercase tracking-wider"
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

              {/* Analyze with AI */}
              {analyzeStatus && (
                <button
                  onClick={handleAnalyzeClick}
                  disabled={isAnalyzeDisabled}
                  className="flex items-center gap-1.5 hover:text-[#E37941] cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-[11px] uppercase tracking-wider"
                // title={analyzeButtonLabel}
                >
                  {isAnalyzing ? (
                    <AnimatedLoadingDots className="w-[18px] h-[5px] shrink-0" />
                  ) : (
                    <AnalyzeIcon className="w-[13px] h-[13px] shrink-0" />
                  )}
                  {analyzeButtonLabel}
                </button>
              )}
            </>
          )}
          {!edit && <div className="tracking-wider">PROJECT</div>}
        </div>
      </motion.div>

      <div className="p-4 md:p-6 space-y-10 pb-16">
        {/* Title + Description */}
        <motion.div variants={itemVariants}>
          <h1
            className={`font-jetbrains text-[22px] md:text-[28px] font-semibold leading-[1.2] mb-4 uppercase tracking-tight ${edit ? "outline-none" : ""} ${edit && titleIsPlaceholder ? "text-[#B5AFA5] dark:text-[#4A4238] italic" : "text-[#1A1A1A] dark:text-[#F0EDE7]"}`}
            contentEditable={edit}
            suppressContentEditableWarning={edit}
            onFocus={edit ? (e) => { setTitleIsPlaceholder(false); if (e.target.textContent === "Type here...") e.target.textContent = ""; } : undefined}
            onBlur={edit ? (e) => { const isEmpty = !e.target.textContent.trim(); setTitleIsPlaceholder(isEmpty); handleOnBlur("title", e); if (isEmpty) e.target.textContent = "Type here..."; } : undefined}
          >
            {title || (edit ? "Type here..." : "")}
          </h1>
          {(edit || descriptionText) && (
            <p
              className={`font-jetbrains text-[15px] leading-relaxed ${edit ? "outline-none" : ""} ${edit && descIsPlaceholder ? "text-[#B5AFA5] dark:text-[#4A4238] italic" : "text-[#7A736C] dark:text-[#B5AFA5]"}`}
              contentEditable={edit}
              suppressContentEditableWarning={edit}
              onFocus={edit ? (e) => { setDescIsPlaceholder(false); if (e.target.textContent === "Type here...") e.target.textContent = ""; } : undefined}
              onBlur={edit ? (e) => { const isEmpty = !e.target.textContent.trim(); setDescIsPlaceholder(isEmpty); handleOnBlur("description", e); if (isEmpty) e.target.textContent = "Type here..."; } : undefined}
            >
              {descriptionText || (edit ? "Type here..." : "")}
            </p>
          )}
        </motion.div>

        {/* Hero Image */}
        {(edit || thumbnail?.url) && (
          <motion.div
            variants={itemVariants}
            className={`relative flex flex-col ${frameBorderClass}`}
          >
            <div className="absolute inset-[-16px] md:inset-[-20px] border border-[#D5D0C6] dark:border-[#3A352E] pointer-events-none" />
            <div className="absolute inset-0 border border-[#D5D0C6] dark:border-[#3A352E] pointer-events-none z-30" />
            <div className="bg-gradient-to-br from-[#D2CEC8] to-[#A8A49D] dark:from-[#3A352E] dark:to-[#1A1A1A] p-4 md:p-5 relative overflow-hidden">
              <FrameScrews />
              <div className="w-full aspect-[16/10] relative overflow-hidden bg-white dark:bg-[#1A1A1A] shadow-[0_0_10px_rgba(0,0,0,0.2)]">
                {edit ? (
                  <ImageWithOverlayAndPicker
                    src={thumbnail?.url}
                    project={projectDetails}
                    aspectRatio="16/10"
                    recommendedSize="1600 × 900px"
                    className="rounded-none"
                  />
                ) : (
                  <>
                    <img
                      src={thumbnail.url}
                      alt={title || "Project"}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                      loading="lazy"
                      onLoad={() => setImageLoaded(true)}
                    />
                    {!imageLoaded && (
                      <div className="absolute inset-0 bg-[#D2CEC8] dark:bg-[#2A2520]" />
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Details Grid */}
        {(edit || viewDetailFields.length > 0) && (
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-[#D5D0C6] dark:border-[#3A352E] py-6"
          >
            {edit
              ? detailFields.map(({ label, value, field }) => (
                <EditableDetailField
                  key={field}
                  label={label}
                  field={field}
                  value={value}
                  onBlur={handleOnBlur}
                />
              ))
              : viewDetailFields.map(({ label, value }) => (
                <div key={label}>
                  <h4 className="font-jetbrains text-[11px] text-[#7A736C] dark:text-[#9E9893] uppercase tracking-wider mb-2">
                    {label}
                  </h4>
                  <p className="font-jetbrains text-[13px] text-[#1A1A1A] dark:text-[#F0EDE7] uppercase">
                    {value}
                  </p>
                </div>
              ))}
          </motion.div>
        )}

        {/* Case Study Content — view mode only; edit mode shows TiptapEditor below */}
        {!edit && hasTiptapContent && (
          <motion.div variants={itemVariants}>
            <h3 className="font-jetbrains text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] font-semibold mb-6 uppercase tracking-wider flex items-center gap-3">
              <span className="w-2 h-2 bg-[#E37941] shrink-0" /> Overview
            </h3>
            <TiptapRenderer content={tiptapContent} />
          </motion.div>
        )}

        {!edit && hasEditorJSContent && (
          <motion.div variants={itemVariants}>
            <h3 className="font-jetbrains text-[14px] text-[#1A1A1A] dark:text-[#F0EDE7] font-semibold mb-6 uppercase tracking-wider flex items-center gap-3">
              <span className="w-2 h-2 bg-[#E37941] shrink-0" /> Overview
            </h3>
            <BlockRenderer editorJsData={content} />
          </motion.div>
        )}

        {/* Footer nav — view mode only */}
        {!edit && (
          <motion.div
            variants={itemVariants}
            className="pt-8 border-t border-[#D5D0C6] dark:border-[#3A352E] flex justify-between items-center"
          >
            <button
              onClick={() => router.back()}
              className="font-jetbrains text-[13px] uppercase tracking-wide text-[#1A1A1A] dark:text-[#F0EDE7] hover:text-[#E37941] dark:hover:text-[#E37941] transition-colors flex items-center gap-2"
            >
              <ChevronLeft size={16} /> All Projects
            </button>
          </motion.div>
        )}
      </div>

      {/* Analyze Modal */}
      {edit && (
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
      )}
    </motion.div>
  );

  // In edit mode: no full-page wrapper (editor.jsx provides the container)
  if (edit) {
    return innerContent;
  }

  // In view mode: full-page centered wrapper with background
  return (
    <div className="min-h-screen bg-[#F0EDE7] dark:bg-[#1A1A1A] flex justify-center font-['Inter'] text-[#1A1A1A] dark:text-[#F0EDE7] selection:bg-[#E37941] selection:text-white transition-colors duration-700">
      {innerContent}
    </div>
  );
}
