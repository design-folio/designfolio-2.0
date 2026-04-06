import {
  _analyzeCaseStudy,
  _analyzeCaseStudyStatus,
  _updateProject,
} from "@/network/post-request";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import LeftArrow from "../../public/assets/svgs/left-arrow.svg";
import LockIcon from "../../public/assets/svgs/lock.svg";
import LockOpenIcon from "../../public/assets/svgs/lock-open.svg";
import Button from "./button";
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
import AnalyzeIcon from "../../public/assets/svgs/analyze.svg";
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
  const [showEye, setShowEye] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { setTheme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const { wordCount } = useGlobalContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [AnalyzeStatus, setAnalyzeStatus] = useState(false);
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

  const fetchAnalyzeStatus = async () => {
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
  };

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
    e.target.textContent =
      e.target.textContent.length > 0 ? e.target.textContent : "Type here...";
  };

  const [suggestions, setSuggestions] = useState([]);
  const [score, setScore] = useState(0);
  const [rating, setRating] = useState("");


  const handleAnalyzeClick = async () => {
    if (suggestions.length > 0) {
      setShowModal(true);
    } else {
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
      } catch (e) {
        console.log(e);
      } finally {
        setIsAnalyzing(false);
      }
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
    } catch (e) {
      console.log(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const validationSchema = Yup.object().shape({
    password: isPassword
      ? Yup.string()
        .required("Password is required.")
        .min(6, "Password is too short - should be 6 chars minimum.")
      : Yup.string().min(
        6,
        "Password is too short - should be 6 chars minimum."
      ),
  });

  const handleBack = () => {
    router.back({ scroll: false });
  };

  const handlePasswordRadio = async () => {
    await _updateProject(projectId, { protected: !isPassword }).then(
      (res) => {
        updateProjectCache("protected", res?.data?.project?.protected);
        setPassword((prev) => !prev);
      }
    );
  };

  useEffect(() => {
    fetchAnalyzeStatus();
  }, []);

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
                <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                Go back
              </button>
            )}
            {edit && (
              <div className="flex gap-3 items-center">
                {AnalyzeStatus && (
                  <Button
                    type="secondary"
                    size="small"
                    text={suggestions?.length > 0 ? "Show Score Card" : wordCount < 400 ? `Need more ${400 - wordCount} words` : "Analyze with AI"}
                    onClick={() => handleAnalyzeClick()}
                    iconPosition={isAnalyzing ? "right" : "left"}
                    icon={isAnalyzing ? <AnimatedLoading className="cursor-pointer" /> : <AnalyzeIcon className="cursor-pointer" />}
                    isDisabled={isAnalyzing || (suggestions?.length === 0 && wordCount < 400)}
                  />
                )}
                {!isMacOS && (
                  <div className="relative" data-popover-id={popovers.password}>
                    <Button
                      type="secondary"
                      size="small"
                      onClick={() => setPopoverMenu((prev) => prev == popovers.password ? null : popovers.password)}
                      icon={isPassword ? <LockIcon className="stroke-bg-df-icon-color cursor-pointer" /> : <LockOpenIcon className="stroke-bg-df-icon-color cursor-pointer" />}
                      customClass="p-2.5"
                    />
                    <div className={`pt-2 origin-top-right absolute z-50 right-0 transition-all will-change-transform translateZ(0) duration-120 ease-in-out ${popoverMenu === popovers.password ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}`}>
                      <div className="w-[350px] md:w-[386px] bg-popover-bg-color rounded-2xl shadow-lg border-[5px] border-popover-border-color p-2">
                        <Formik
                          initialValues={{ password: password }}
                          validateOnChange
                          validateOnBlur
                          validationSchema={validationSchema}
                          onSubmit={(values, actions) => {
                            _updateProject(projectId, { password: values.password }).then((res) => {
                              updateProjectCache("password", res?.data?.project?.password);
                              updateProjectCache("protected", res?.data?.project?.protected);
                              actions.setSubmitting(false);
                              toast.success("Password has been updated.");
                            });
                          }}
                        >
                          {({ isSubmitting, errors, touched, validateField }) => (
                            <Form id="projectForm" autoComplete="off">
                              <div className="bg-input-password-bg-color rounded-lg py-4 px-3 transition-all">
                                <div className="flex justify-between gap-[12px] items-center">
                                  <div>
                                    <Text size={"p-xxsmall"} className="font-medium text-input-password-heading-color">Set Password</Text>
                                    <Text size={"p-xxsmall"} className="font-medium text-input-password-description-color">Protect your project if you&apos;ve an NDA.</Text>
                                  </div>
                                  <Toggle onClick={handlePasswordRadio} value={isPassword} />
                                </div>
                                {isPassword && (
                                  <>
                                    <div className="relative mt-2">
                                      <Field name="password" type={showEye ? "text" : "password"} className={`text-input mt-2 ${errors.password && touched.password && "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"}`} placeholder="Password" autocomplete="new-password" />
                                      <div className="absolute top-[24px] right-4 cursor-pointer" onClick={(e) => { e.stopPropagation(); setShowEye((prev) => !prev); validateField("password"); }}>
                                        {showEye ? <EyeIcon className="text-df-icon-color" /> : <EyeCloseIcon className="text-df-icon-color" />}
                                      </div>
                                    </div>
                                    <ErrorMessage name="password" component="div" className="error-message" />
                                  </>
                                )}
                              </div>
                              {isPassword && (
                                <div className="flex gap-2 justify-end mt-4">
                                  <Button text="Cancel" onClick={() => setPopoverMenu(null)} type="secondary" />
                                  <Button type="modal" text={"Change"} isLoading={isSubmitting} btnType="submit" form="projectForm" />
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
        )}

        <div className="custom-dashed-t" />

        {/* Title + subtitle */}
        <div className="px-5 md:px-8 pt-8 pb-6">
          <h1
            className="text-[24px] font-semibold mb-3 tracking-tight text-[#1A1A1A] dark:text-[#F0EDE7]"
            contentEditable={edit}
            suppressContentEditableWarning
            onBlur={(e) => handleOnBlur("title", e)}
            onFocus={(e) => { if (e.target.textContent === "Type here...") e.target.textContent = ""; }}
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
              onFocus={(e) => { if (e.target.textContent === "Type here...") e.target.textContent = ""; }}
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
              aspectRatio="16/9"
              recommendedSize="1600 × 900px"
            />
          ) : (
            <figure className="relative w-full aspect-[16/9] rounded-xl overflow-hidden drop-shadow-sm border border-black/5 dark:border-white/10">
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#463B34] dark:text-[#D4C9BC]">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <h2 className="text-[11px] font-bold text-[#463B34] dark:text-[#D4C9BC] font-mono uppercase tracking-widest">Project Details</h2>
            </div>
            <div className="border border-[#C8C4BD] dark:border-[#3A352E] rounded-lg overflow-hidden bg-[#E7E3D9] dark:bg-[#2A2520]">
              {monoDetailFields.map(({ key, label, value }, index) => (
                <div
                  key={key}
                  className={`flex justify-between items-center px-4 py-3 ${index !== monoDetailFields.length - 1 ? "border-b border-[#C8C4BD] dark:border-[#3A352E]" : ""}`}
                >
                  <span className="text-[12px] font-medium text-[#463B34] dark:text-[#D4C9BC] uppercase tracking-wide">{label}</span>
                  <p
                    className="text-base text-[#7A736C] dark:text-[#B5AFA5]"
                    style={{ fontWeight: 450 }}
                    contentEditable={edit}
                    suppressContentEditableWarning
                    onBlur={(e) => handleOnBlur(key, e)}
                    onFocus={(e) => { if (e.target.textContent === "Type here...") e.target.textContent = ""; }}
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
    <div className="bg-df-section-card-bg-color rounded-[24px] p-[16px] md:p-[32px]">
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
                  text={
                    suggestions?.length > 0
                      ? "Show Score Card"
                      : wordCount < 400
                        ? `Need more ${400 - wordCount} words to Analyze AI`
                        : "Analyze Project using AI"
                  }
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
                    (suggestions?.length === 0 && wordCount < 400)
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
                    (suggestions?.length === 0 && wordCount < 400)
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
                    setPopoverMenu((prev) =>
                      prev == popovers.password ? null : popovers.password
                    )
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
                  className={`pt-2 origin-top-right absolute z-50 right-0 transition-all will-change-transform translateZ(0) duration-120 ease-in-out ${popoverMenu === popovers.password
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
                          updateProjectCache(
                            "password",
                            res?.data?.project?.password
                          );
                          updateProjectCache(
                            "protected",
                            res?.data?.project?.protected
                          );
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
                              <Toggle
                                onClick={handlePasswordRadio}
                                value={isPassword}
                              />
                            </div>
                            {isPassword && (
                              <>
                                <div className="relative mt-2">
                                  <Field
                                    name="password"
                                    type={showEye ? "text" : "password"}
                                    className={`text-input mt-2 ${errors.password &&
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

      {
        (edit || !!description) && (
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
        )
      }

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
            <p className="text-[14px] text-df-heading-color font-inter font-[500]">
              My Role
            </p>
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
            <p className="text-[14px] text-df-heading-color font-inter font-[500]">
              Industry
            </p>
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
            <p className="text-[14px] text-df-heading-color font-inter font-[500]">
              Platform
            </p>
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
      {
        edit ? (
          <ImageWithOverlayAndPicker
            src={thumbnail?.url}
            project={projectDetails}
            aspectRatio="16/9"
            recommendedSize="1600 × 900px"
            className="mt-6 md:mt-8"
          />
        ) : (
          <figure className="relative w-full aspect-[16/9] rounded-[20px] overflow-hidden mt-6 md:mt-8">
            <img
              src={thumbnail?.url}
              alt="project image"
              className={`w-full h-full object-cover transition-opacity duration-100 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              loading="lazy"
              fetchPriority="high"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-df-placeholder-color" />
            )}
          </figure>
        )
      }
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
    </div >
  );
}
