import React, { useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import useImageCompression from "@/hooks/useImageCompression";
import { useGlobalContext } from "@/context/globalContext";
import { _getSkills, _getTools } from "@/network/get-request";
import { _updateUser } from "@/network/post-request";
import ProgressBar from "./ProgressBar";
import Button from "./button";
import Text from "./text";
import CloseIcon from "../../public/assets/svgs/close.svg";
import SelectField from "./SelectField";
import ToolCheckbox from "./ToolCheckbox";
import { useTheme } from "next-themes";
import { getUserAvatarImage } from "@/lib/getAvatarUrl";
import { cn } from "@/lib/utils";

const FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "image/gif"];

// Validation schema for the first step
const StepOneValidationSchema = Yup.object().shape({
  picture: Yup.mixed()
    .nullable() // Allow the field to be null
    .notRequired() // Explicitly mark the field as not required
    .test(
      "fileSize",
      "File size is too large. Maximum size is 5MB.",
      (value) => !value || (value && value.size <= FILE_SIZE) // Check size if value exists
    )
    .test(
      "fileType",
      "Unsupported file format. Only jpg, jpeg, png and gif files are allowed.",
      (value) => !value || (value && SUPPORTED_FORMATS.includes(value.type)) // Check type if value exists
    ),
  introduction: Yup.string()
    .required("Headline is required")
    .max(50, "Headline must be 50 characters or less"),
  bio: Yup.string()
    .required("Professional summary is required")
    .max(250, "Professional summary must be 250 characters or less"),
});

// Validation schema for the second step
const StepTwoValidationSchema = Yup.object().shape({
  expertise: Yup.array()
    .of(
      Yup.object().shape({
        label: Yup.string().required(),
        value: Yup.string().required(),
      })
    )
    .min(3, "Please select at least three expertise")
    .max(10, "Maximum 10 expertise areas can be selected"),
  selectedTools: Yup.array()
    .of(
      Yup.object().shape({
        label: Yup.string().required(),
        value: Yup.string().required(),
      })
    )
    .min(3, "Please select at least three tools"),
});

const variants = {
  loading: { height: 126 },
  default: { height: "90vh", maxHeight: 630 },
};

export default function Onboarding() {
  const {
    userDetails,
    step,
    setStep,
    closeModal,
    setUserDetails,
    updateCache,
  } = useGlobalContext();
  const { theme } = useTheme();
  const [imagePreview, setImagePreview] = useState();
  const [skillOptions, setSkillsOptions] = useState([]);
  const [toolsOptions, setToolsOptions] = useState([]);

  const [isLoadingModal, setIsLoadingModalType] = useState(true);

  const [loading, setLoading] = useState(false);

  const { compress, compressedImage, compressionProgress } =
    useImageCompression();
  const formikRef = useRef(null);
  // Create a reference to the div you want to scroll
  const scrollDivRef = useRef(null);

  // Function to scroll to the top of the div
  const scrollToTop = () => {
    if (scrollDivRef.current) {
      scrollDivRef.current.scrollTop = 0;
    }
  };
  const [initialValues, setInitialValues] = useState({
    picture: null,
    introduction: userDetails?.introduction ?? `Hey I'm ${userDetails?.firstName}`,
    expertise: userDetails?.skills ?? [],
    selectedTools: userDetails?.tools ?? [], // Assuming mappedTools is defined elsewhere
    avatarUrl: userDetails?.avatar?.url, // Assuming userDetails.avatar.url is defined
    bio: userDetails?.bio ?? "",
  });

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await _getTools();
        setToolsOptions(response.data.tools);
      } catch (err) {
        console.log(err);
      }
    };

    fetchTools();
  }, []);

  useEffect(() => {
    if (userDetails?.avatar?.url) {
      fetch(userDetails.avatar.url, { mode: "cors", cache: "no-cache" })
        .then((response) => response.blob())
        .then((blob) => {
          const mimeType = `image/${userDetails.avatar.extension}`; // Simplified, assuming extension is always provided correctly
          const file = new File([blob], userDetails.avatar.originalName, {
            type: mimeType,
          });
          setInitialValues((prevValues) => ({
            ...prevValues,
            picture: file,
          }));
          setImagePreview(URL.createObjectURL(file));
        })
        .catch((error) =>
          console.error("Error loading avatar:", error.message)
        ); // Log error message
    } else {
      // Consider setting a default avatar preview if no avatar is present
      setImagePreview(null); // Adjust path as needed
    }
  }, [userDetails?.avatar?.url]);

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

  const isLastStep = step === 2;

  const handleImageChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    const maxSizeInBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      compress(file);
    }
    setFieldValue("picture", file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleNetwork = (payload, actions) => {
    setLoading(true);
    const payloadWithTemplate = {
      ...payload,
      template: userDetails?.template,
    };
    _updateUser(payloadWithTemplate)
      .then((res) => {
        updateCache("userDetails", res?.data?.user);
        setUserDetails((prev) => ({ ...prev, ...res.data.user }));
        closeModal();
        actions.setSubmitting(false);
      })
      .catch((err) => actions.setSubmitting(false))
      .finally(() => {
        setTimeout(() => {
          setLoading(false);
        }, 1200);
      });
  };

  const handleSubmit = (values, actions) => {
    if (isLastStep) {
      //HACK: Remove 'selected' property from tools and skills before sending to backend
      const cleanSkills = values.expertise?.map(({ selected, ...rest }) => rest) || [];

      const payload = {
        tools: values.selectedTools,
        skills: cleanSkills,
        introduction: values?.introduction,
        bio: values?.bio,
      };
      if (values?.picture) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result;
          payload.avatar = {
            key: base64Image,
            originalName: values.picture.name,
            extension: values.picture.type.split("/")[1], // Extracts the extension from the MIME type
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
  return (
    <motion.div
      animate={isLoadingModal ? "loading" : "default"}
      variants={variants}
      className="w-[95vw] m-auto lg:w-[577.5px] rounded-2xl flex flex-col  bg-modal-bg-color"
    >
      {isLoadingModal ? (
        <motion.div className="h-full w-[95vw] md:w-full flex justify-center items-center rotating">
          <img src="/assets/svgs/star.svg" alt="loading state" />
        </motion.div>
      ) : (
        <>
          <div className="p-5 lg:p-6 ">
            <div className="mb-4 flex gap-3">
              <ProgressBar progress={100} />{" "}
              <ProgressBar
                progress={step == 2 ? 100 : 0}
                bg="linear-gradient(to right, #F26855, #EC7DFD)"
              />
            </div>
            {userDetails && userDetails?.skills?.length !== 0 && (
              <div className="flex justify-between items-center">
                <Text size="p-small" className="font-semibold">
                  Update profile
                </Text>
                <Button
                  // customClass="lg:hidden"
                  type="secondary"
                  customClass="!p-2"
                  icon={
                    <CloseIcon className="text-icon-color cursor-pointer" />
                  }
                  onClick={closeModal}
                />
              </div>
            )}

            {userDetails && userDetails?.skills?.length == 0 && (
              <>
                <Text
                  size="p-medium"
                  className={"font-semibold text-center mb-2"}
                >
                  {step == 1
                    ? "Welcome to designfolio"
                    : "Your top skills, roles & tools?"}
                </Text>

                <Text
                  size="p-small"
                  className={"font-inter font-normal text-center"}
                >
                  {step == 1
                    ? "A little bit more about you"
                    : "Choose your superpowers"}
                </Text>
              </>
            )}
          </div>

          <Formik
            initialValues={initialValues}
            innerRef={formikRef}
            validationSchema={
              step === 1 ? StepOneValidationSchema : StepTwoValidationSchema
            }
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, values, errors, touched }) => (
              <Form
                id="onboarding"
                className="flex-1 overflow-y-auto"
                ref={scrollDivRef}
              >
                <div className="p-5 lg:py-6 lg:px-8 !pt-0">
                  {step === 1 && (
                    <div>
                      <div className="flex items-center gap-4">
                        <div className={cn("w-32 h-32 flex flex-col justify-center items-center gap-1 rounded-full relative", !userDetails?.avatar && !imagePreview ? "bg-[#FFB088]" : "")}>
                          {imagePreview ? (
                            <img
                              src={imagePreview}
                              className="w-24 h-24 rounded-full object-cover"
                              alt="designfolio logo"
                            />
                          ) : (
                            <>
                              <img
                                src={getUserAvatarImage(userDetails)}
                                className="w-24 h-24  rounded-full object-cover"
                                alt="designfolio logo"
                              />
                            </>
                          )}
                        </div>
                        <label htmlFor="picture" className="cursor-pointer">
                          <Button
                            text={`${imagePreview ? "Change photo" : "Upload photo"
                              }`}
                            size="small"
                            type="secondary"
                            customClass="pointer-events-none"
                          />
                        </label>
                      </div>
                      <input
                        id="picture"
                        name="picture"
                        type="file"
                        accept="image/png, image/jpeg,image/jpg,image/gif"
                        hidden
                        onChange={(event) =>
                          handleImageChange(event, setFieldValue)
                        }
                      />
                      <ErrorMessage
                        name="picture"
                        component="div"
                        className="error-message text-sm"
                      />
                      <div className="mt-[24px] flex justify-between">
                        <Text as="p" size={"p-xxsmall"} className="font-medium">
                          Headline
                        </Text>
                        <Text as="p" size={"p-xxsmall"} className="font-medium">
                          {values.introduction.length ?? 0}/50
                        </Text>
                      </div>
                      <Field
                        name="introduction"
                        autoComplete="off"
                        type="text"
                        placeholder="Eg: Hey I’m Bruce, a Product Designer."
                        className={`text-input mt-2 ${errors.introduction &&
                          touched.introduction &&
                          "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                          }`}
                      />
                      <ErrorMessage
                        name="introduction"
                        component="div"
                        className="error-message text-[14px]"
                      />
                      <Text
                        size="p-xxxsmall"
                        className="text-df-secondary-text-color mt-3"
                      >
                        ✏️ <b>Tip:</b> This is the very first thing people read
                        about you.
                      </Text>

                      <div className="mt-[16px] flex justify-between">
                        <Text
                          as="p"
                          size={"p-xxsmall"}
                          className="font-medium"
                          required
                        >
                          {" "}
                          Professional summary
                        </Text>
                        <Text as="p" size={"p-xxsmall"} className="font-medium">
                          {values.bio.length ?? 0}/250
                        </Text>
                      </div>
                      <Field
                        name="bio"
                        as="textarea"
                        autoComplete="off"
                        placeholder="Eg: 7 years of building kickass experiences"
                        className={`text-input mt-2 min-h-[150px] ${errors.bio &&
                          touched.bio &&
                          "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                          }`}
                      />
                      <ErrorMessage
                        name="bio"
                        component="div"
                        className="error-message text-[14px] !mt-[2px]"
                      />
                      <Text
                        size="p-xxxsmall"
                        className="text-df-secondary-text-color mt-3"
                      >
                        ✏️ <b>Tip:</b> Mention your role, experience, skills and
                        achievements
                      </Text>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="mb-[18px]">
                      <div className="flex justify-between mb-2">
                        <Text
                          as="p"
                          size={"p-xxsmall"}
                          className="font-medium"
                          required
                        >
                          Skills
                        </Text>
                        <Text as="p" size={"p-xxsmall"} className="font-medium">
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
                      <Text
                        as="p"
                        size={"p-xxsmall"}
                        className="font-medium mt-4 mb-2"
                        required
                      >
                        Choose the tools you work with
                      </Text>
                      <SelectField
                        name="selectedTools"
                        options={toolsOptions}
                        theme={theme}
                      />
                      <ErrorMessage
                        name="selectedTools"
                        component="div"
                        className="error-message text-[14px]"
                      />
                      <div className="flex flex-wrap gap-4 mt-4">
                        {toolsOptions.map((tool) => (
                          <Field
                            key={tool.value}
                            name="selectedTools"
                            render={({ field, form }) => (
                              <ToolCheckbox
                                tool={tool}
                                field={field}
                                form={form}
                                theme={theme}
                              />
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Form>
            )}
          </Formik>

          <div className="flex justify-end gap-4 py-2 lg:py-[9px] px-5 lg:px-4 rounded-b-2xl  bg-modal-footer-bg-color">
            {step > 1 && (
              <Button
                onClick={() => handleBack()}
                text={"Back"}
                type="secondary"
              />
            )}
            <Button
              btnType="submit"
              form="onboarding"
              text={isLastStep ? "Finish" : "Continue"}
              isLoading={loading}
              type="modal"
            />
          </div>
        </>
      )}
    </motion.div>
  );
}
