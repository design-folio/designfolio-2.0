import React, { useEffect, useRef, useState, startTransition } from "react";
import { motion } from "motion/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useImageCompression from "@/hooks/useImageCompression";
import { useGlobalContext } from "@/context/globalContext";
import { _getSkills, _getTools, _getPersonas } from "@/network/get-request";
import { _updateUser } from "@/network/post-request";
import RoleGrid from "./RoleGrid";
import ProgressBar from "./ProgressBar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import Text from "./text";
import CloseIcon from "../../public/assets/svgs/close.svg";
import SelectField from "./SelectField";
import ToolCheckbox from "./ToolCheckbox";
import { useTheme } from "next-themes";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { cn } from "@/lib/utils";

const FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_MIME_TYPES = ["image/jpeg", "image/png", "image/gif"];
const SUPPORTED_EXTENSIONS = ["jpg", "jpeg", "png", "gif"];

const StepOneValidationSchema = Yup.object().shape({
  picture: Yup.mixed()
    .nullable()
    .notRequired()
    .test(
      "fileSize",
      "File size is too large. Maximum size is 5MB.",
      (value) => !value || value.size <= FILE_SIZE
    )
    .test(
      "fileType",
      "Unsupported file format. Only jpg, jpeg, png and gif files are allowed.",
      (value) => {
        if (!value) return true;
        const mimeValid = SUPPORTED_MIME_TYPES.includes(value.type);
        const extension = value.name?.split(".").pop()?.toLowerCase();
        return mimeValid || (extension && SUPPORTED_EXTENSIONS.includes(extension));
      }
    ),
  introduction: Yup.string()
    .required("Headline is required")
    .max(50, "Headline must be 50 characters or less"),
  bio: Yup.string()
    .required("Professional summary is required")
    .max(250, "Professional summary must be 250 characters or less"),
});

const StepTwoValidationSchema = Yup.object().shape({
  expertise: Yup.array()
    .of(Yup.object().shape({ label: Yup.string().required(), value: Yup.string().required() }))
    .min(3, "Please select at least three expertise")
    .max(10, "Maximum 10 expertise areas can be selected"),
  selectedTools: Yup.array()
    .of(Yup.object().shape({ label: Yup.string().required(), value: Yup.string().required() }))
    .min(3, "Please select at least three tools"),
});

const variants = {
  loading: { height: 126 },
  default: { height: "90vh", maxHeight: 630 },
};

const textareaClass =
  "mt-2 min-h-[150px] flex w-full rounded-xl border border-transparent bg-black/[0.03] dark:bg-white/[0.03] px-3.5 py-2 text-sm text-foreground shadow-none transition-all resize-none " +
  "placeholder:text-black/30 dark:placeholder:text-white/30 " +
  "focus-visible:outline-none focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/10 focus-visible:border-black/20 dark:focus-visible:border-white/20 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

function normalizePersona(p) {
  return {
    _id: p._id || p.id,
    label: p.label || p.name || p.title,
    image: p.image || "/onboarding-animated-icons/others.png",
  };
}

export default function Onboarding() {
  const { userDetails, step, setStep, closeModal, setUserDetails, updateCache } =
    useGlobalContext();
  const { theme } = useTheme();
  const [imagePreview, setImagePreview] = useState();
  const [skillOptions, setSkillsOptions] = useState([]);
  const [toolsOptions, setToolsOptions] = useState([]);
  const [isLoadingModal, setIsLoadingModalType] = useState(true);
  const [loading, setLoading] = useState(false);

  // Persona state
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPersonaId, setSelectedPersonaId] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [personaError, setPersonaError] = useState("");

  const { compress, compressedImage, compressionProgress } = useImageCompression();
  const formikRef = useRef(null);
  const scrollDivRef = useRef(null);

  const scrollToTop = () => {
    if (scrollDivRef.current) scrollDivRef.current.scrollTop = 0;
  };

  const [initialValues, setInitialValues] = useState({
    picture: null,
    introduction: userDetails?.introduction ?? `Hey I'm ${userDetails?.firstName}`,
    expertise: userDetails?.skills ?? [],
    selectedTools: userDetails?.tools ?? [],
    avatarUrl: userDetails?.avatar?.url,
    bio: userDetails?.bio ?? "",
  });

  useEffect(() => {
    _getTools()
      .then((res) => setToolsOptions(res.data.tools))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (userDetails?.avatar?.url) {
      fetch(userDetails.avatar.url, { mode: "cors", cache: "no-cache" })
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], userDetails.avatar.originalName, {
            type: `image/${userDetails.avatar.extension}`,
          });
          setInitialValues((prev) => ({ ...prev, picture: file }));
          setImagePreview(URL.createObjectURL(file));
        })
        .catch(() => {});
    } else {
      startTransition(() => setImagePreview(null));
    }
  }, [userDetails?.avatar?.url, userDetails?.avatar?.originalName, userDetails?.avatar?.extension]);

  useEffect(() => {
    if (compressionProgress === 100 && compressedImage && formikRef.current) {
      formikRef.current.setFieldValue("picture", compressedImage);
      setImagePreview(URL.createObjectURL(compressedImage));
    }
  }, [compressionProgress, compressedImage]);

  const handleBack = () => {
    setStep(step - 1);
    scrollToTop();
  };

  const isLastStep = step === 3;

  const handleImageChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (file.size > 2 * 1024 * 1024) compress(file);
    setFieldValue("picture", file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleNetwork = (payload, actions) => {
    setLoading(true);
    _updateUser({ ...payload, template: userDetails?.template })
      .then((res) => {
        updateCache("userDetails", res?.data?.user);
        setUserDetails((prev) => ({ ...prev, ...res.data.user }));
        closeModal();
        actions.setSubmitting(false);
      })
      .catch(() => actions.setSubmitting(false))
      .finally(() => setTimeout(() => setLoading(false), 1200));
  };

  const handleSubmit = (values, actions) => {
    if (isLastStep) {
      if (selectedRole === "Others" && !customRole.trim()) {
        setPersonaError("Please tell us your role.");
        actions.setSubmitting(false);
        return;
      }
      setPersonaError("");

      const cleanSkills = values.expertise?.map(({ selected, ...rest }) => rest) || [];
      const persona = selectedRole
        ? {
            value: selectedPersonaId,
            label: selectedRole,
            ...(selectedRole === "Others" && { __isNew__: true, label: customRole.trim() }),
          }
        : undefined;
      const payload = {
        tools: values.selectedTools,
        skills: cleanSkills,
        introduction: values?.introduction,
        bio: values?.bio,
        ...(persona && { persona }),
      };
      if (values?.picture) {
        const reader = new FileReader();
        reader.onloadend = () => {
          payload.avatar = {
            key: reader.result,
            originalName: values.picture.name,
            extension: values.picture.type.split("/")[1],
          };
          handleNetwork(payload, actions);
        };
        reader.readAsDataURL(values.picture);
      } else {
        handleNetwork(payload, actions);
      }
    } else {
      scrollToTop();
      setStep(step + 1);
      actions.setSubmitting(false);
    }
    formikRef.current.validateForm();
    formikRef.current.setTouched({});
  };

  useEffect(() => {
    _getSkills().then((res) => setSkillsOptions(res?.data?.skills));
    setTimeout(() => setIsLoadingModalType(false), 1000);
  }, []);

  // Fetch personas
  useEffect(() => {
    _getPersonas()
      .then((res) => {
        const personas = res?.data?.personas || [];
        if (Array.isArray(personas)) setRoles(personas.map(normalizePersona));
      })
      .catch(() => {});
  }, []);

  // Prefill persona from userDetails
  useEffect(() => {
    if (!userDetails?.persona || roles.length === 0) return;
    const { persona } = userDetails;
    if (persona?.value && persona?.label) {
      const isCustom = persona.__isNew__ === true || persona.label === "Others" || !!persona.custom;
      startTransition(() => {
        if (isCustom) {
          setSelectedRole("Others");
          setCustomRole(persona.custom || (persona.label === "Others" ? "" : persona.label));
          setSelectedPersonaId(persona.value);
        } else {
          const matched =
            roles.find((r) => r._id === persona.value) ||
            roles.find((r) => r.label === persona.label);
          if (matched) {
            setSelectedRole(matched.label);
            setSelectedPersonaId(matched._id);
          } else {
            setSelectedRole("Others");
            setCustomRole(persona.label);
            setSelectedPersonaId(persona.value);
          }
        }
      });
    }
  }, [roles, userDetails?.persona, userDetails]);

  return (
    <motion.div
      animate={isLoadingModal ? "loading" : "default"}
      variants={variants}
      className="bg-card m-auto flex w-[95vw] flex-col rounded-2xl lg:w-[577.5px]"
    >
      {isLoadingModal ? (
        <motion.div className="rotating flex h-full w-[95vw] items-center justify-center md:w-full">
          <img src="/assets/svgs/star.svg" alt="loading state" />
        </motion.div>
      ) : (
        <>
          <div className="p-5 lg:p-6">
            <div className="mb-4 flex gap-3">
              <ProgressBar progress={100} />
              <ProgressBar
                progress={step >= 2 ? 100 : 0}
                bg="linear-gradient(to right, #F26855, #EC7DFD)"
              />
              <ProgressBar
                progress={step === 3 ? 100 : 0}
                bg="linear-gradient(to right, #6EE7B7, #3B82F6)"
              />
            </div>
            {userDetails && userDetails?.skills?.length !== 0 && (
              <div className="flex items-center justify-between">
                <Text size="p-small" className="font-semibold">
                  {step === 1 ? "Update profile" : step === 2 ? "Skills & Tools" : "Your Role"}
                </Text>
                <Button variant="outline" size="icon" type="button" onClick={closeModal}>
                  <CloseIcon className="text-foreground/60" />
                </Button>
              </div>
            )}
            {userDetails && userDetails?.skills?.length == 0 && (
              <>
                <Text size="p-medium" className="mb-2 text-center font-semibold">
                  {step === 1
                    ? "Welcome to designfolio"
                    : step === 2
                      ? "Your top skills, roles & tools?"
                      : "What describes you best?"}
                </Text>
                <Text size="p-small" className="font-inter text-center font-normal">
                  {step === 1
                    ? "A little bit more about you"
                    : step === 2
                      ? "Choose your superpowers"
                      : "Help us tailor your experience"}
                </Text>
              </>
            )}
          </div>

          <Formik
            initialValues={initialValues}
            innerRef={formikRef}
            validationSchema={
              step === 1
                ? StepOneValidationSchema
                : step === 2
                  ? StepTwoValidationSchema
                  : undefined
            }
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, values, errors, touched }) => (
              <Form id="onboarding" className="flex-1 overflow-y-auto" ref={scrollDivRef}>
                <div className="p-5 !pt-0 lg:px-8 lg:py-6">
                  {step === 1 && (
                    <div>
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "relative flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-full",
                            !userDetails?.avatar && !imagePreview ? "bg-[#FFB088]" : ""
                          )}
                        >
                          <img
                            src={imagePreview || getUserAvatarImage(userDetails)}
                            className="h-24 w-24 rounded-full object-cover"
                            alt="avatar"
                          />
                        </div>
                        <label htmlFor="picture" className="cursor-pointer">
                          <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                            className="pointer-events-none rounded-full"
                          >
                            {imagePreview ? "Change photo" : "Upload photo"}
                          </Button>
                        </label>
                      </div>
                      <input
                        id="picture"
                        name="picture"
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/gif"
                        hidden
                        onChange={(e) => handleImageChange(e, setFieldValue)}
                      />
                      <ErrorMessage
                        name="picture"
                        component="div"
                        className="error-message text-sm"
                      />

                      <div className="mt-6 flex justify-between">
                        <Text as="p" size="p-xxsmall" className="font-medium">
                          Headline
                        </Text>
                        <Text as="p" size="p-xxsmall" className="font-medium">
                          {values.introduction.length ?? 0}/50
                        </Text>
                      </div>
                      <Field name="introduction">
                        {({ field }) => (
                          <Input
                            {...field}
                            id="introduction"
                            autoComplete="off"
                            placeholder="Eg: Hey I'm Bruce, a Product Designer."
                            className={cn(
                              "mt-2",
                              errors.introduction &&
                                touched.introduction &&
                                "border-destructive focus-visible:ring-destructive"
                            )}
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="introduction"
                        component="div"
                        className="error-message text-[14px]"
                      />
                      <Text size="p-xxxsmall" className="text-muted-foreground mt-3">
                        ✏️ <b>Tip:</b> This is the very first thing people read about you.
                      </Text>

                      <div className="mt-4 flex justify-between">
                        <Text as="p" size="p-xxsmall" className="font-medium" required>
                          Professional summary
                        </Text>
                        <Text as="p" size="p-xxsmall" className="font-medium">
                          {values.bio.length ?? 0}/250
                        </Text>
                      </div>
                      <Field name="bio">
                        {({ field }) => (
                          <textarea
                            {...field}
                            id="bio"
                            autoComplete="off"
                            placeholder="Eg: 7 years of building kickass experiences"
                            className={cn(
                              textareaClass,
                              errors.bio &&
                                touched.bio &&
                                "border-destructive focus-visible:ring-destructive"
                            )}
                          />
                        )}
                      </Field>
                      <ErrorMessage
                        name="bio"
                        component="div"
                        className="error-message !mt-[2px] text-[14px]"
                      />
                      <Text size="p-xxxsmall" className="text-muted-foreground mt-3">
                        ✏️ <b>Tip:</b> Mention your role, experience, skills and achievements
                      </Text>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="mb-[18px]">
                      <div className="mb-2 flex justify-between">
                        <Text as="p" size="p-xxsmall" className="font-medium" required>
                          Skills
                        </Text>
                        <Text as="p" size="p-xxsmall" className="font-medium">
                          {values?.expertise?.length ?? 0}/10
                        </Text>
                      </div>
                      <SelectField
                        name="expertise"
                        options={skillOptions}
                        theme={theme}
                        placeholder="Search skills"
                      />
                      <ErrorMessage
                        name="expertise"
                        component="div"
                        className="error-message text-[14px]"
                      />

                      <Text as="p" size="p-xxsmall" className="mt-4 mb-2 font-medium" required>
                        Choose the tools you work with
                      </Text>
                      <SelectField name="selectedTools" options={toolsOptions} theme={theme} />
                      <ErrorMessage
                        name="selectedTools"
                        component="div"
                        className="error-message text-[14px]"
                      />

                      <div className="mt-4 flex flex-wrap gap-4">
                        {toolsOptions.map((tool) => (
                          <Field
                            key={tool.value}
                            name="selectedTools"
                            render={({ field, form }) => (
                              <ToolCheckbox tool={tool} field={field} form={form} theme={theme} />
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="mb-[18px]">
                      <RoleGrid
                        roles={roles}
                        selectedRole={selectedRole}
                        onSelect={(role) => {
                          setSelectedRole(role);
                          setPersonaError("");
                          const persona = roles.find((r) => r.label === role);
                          if (persona?._id) setSelectedPersonaId(persona._id);
                        }}
                        customRole={customRole}
                        setCustomRole={(val) => {
                          setCustomRole(val);
                          if (val.trim()) setPersonaError("");
                        }}
                        message={personaError}
                      />
                    </div>
                  )}
                </div>
              </Form>
            )}
          </Formik>

          <div className="border-border bg-card flex justify-end gap-3 rounded-b-2xl border-t px-5 py-3">
            {step > 1 && (
              <Button variant="outline" type="button" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button type="submit" form="onboarding" disabled={loading}>
              {loading ? "Saving…" : isLastStep ? "Finish" : "Continue"}
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
}
