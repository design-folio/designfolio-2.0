import useImageCompression from "@/hooks/useImageCompression";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import Button from "./button";
import CloseIcon from "../../public/assets/svgs/close.svg";
import { _updateUser } from "@/network/post-request";
import EyeIcon from "../../public/assets/svgs/eye.svg";
import EyeCloseIcon from "../../public/assets/svgs/eye-close.svg";
import Toggle from "./toggle";
import Text from "./text";
import { useGlobalContext } from "@/context/globalContext";
const FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Yup validation schema

export default function AddProject() {
  const [imagePreview, setImagePreview] = useState(null);
  const [isPassword, setPassword] = useState(false);
  const [showEye, setShowEye] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { closeModal, userDetails, updateCache } = useGlobalContext();

  const validationSchema = Yup.object().shape({
    description: Yup.string()
      .max(160, "App name must be 160 characters or less")
      .required("App name is required"),
    title: Yup.string()
      .max(80, "Project title must be 80 characters or less")
      .required("Project title is required"),

    picture: Yup.mixed()
      .required("A file is required")
      .test(
        "fileSize",
        "File size is too large. Maximum size is 5MB.",
        (value) => value && value.size <= FILE_SIZE
      )
      .test(
        "fileType",
        "Unsupported file format. Only jpg, jpeg, png and gif files are allowed.",
        (value) => value && SUPPORTED_FORMATS.includes(value.type)
      ),
    password: isPassword
      ? Yup.string()
          .required("Password is required.")
          .min(6, "Password is too short - should be 6 chars minimum.")
      : Yup.string().min(
          6,
          "Password is too short - should be 6 chars minimum."
        ),
  });

  const { compress, compressedImage, compressionProgress } =
    useImageCompression();
  const formikRef = useRef(null);

  const handleImageChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    const isGif = file.type === "image/gif";
    if (isGif) {
      setFieldValue("picture", file);
      setImagePreview(file ? URL.createObjectURL(file) : null);
    } else {
      compress(file);
      setFieldValue("picture", file);
      setImagePreview(file ? URL.createObjectURL(file) : null);
    }
  };

  useEffect(() => {
    if (compressionProgress === 100 && compressedImage && formikRef.current) {
      formikRef.current.setFieldValue("picture", compressedImage);
      setImagePreview(URL.createObjectURL(compressedImage));
    }
  }, [compressionProgress, compressedImage]);

  return (
    <div className="rounded-2xl bg-modal-bg-color flex flex-col justify-between  m-auto lg:w-[500px] max-h-[550px] my-auto overflow-hidden">
      <div className="flex p-5 justify-between items-center">
        <Text size="p-small" className="font-semibold">
          Add Your Project Details
        </Text>
        <Button
          // customClass="lg:hidden"
          type="secondary"
          customClass="!p-2 rounded-[8px]"
          icon={<CloseIcon className="text-icon-color cursor-pointer" />}
          onClick={closeModal}
        />
      </div>
      <div className="flex-1 overflow-auto">
        <Formik
          innerRef={formikRef}
          initialValues={{
            description: "",
            title: "",
            picture: null,
            password: "",
          }}
          validateOnChange
          validateOnBlur
          validationSchema={validationSchema}
          onSubmit={(values, actions) => {
            // Handle form submission
            setLoading(true);
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Image = reader.result;

              const payload = {
                projects: [
                  ...userDetails?.projects,
                  {
                    thumbnail: {
                      key: base64Image,
                      originalName: values.picture.name,
                      extension: values.picture.type,
                    },
                    description: values.description,
                    title: values.title,
                    client: values.client,
                    industry: values.industry,
                    role: values.role,
                    platform: values.platform,
                    password: values.password,
                    protected: isPassword,
                  },
                ],
              };
              _updateUser(payload)
                .then((res) => {
                  updateCache("userDetails", res?.data?.user);
                  closeModal();
                })
                .finally(() => setLoading(false));
            };
            reader.readAsDataURL(values.picture);
            actions.setSubmitting(false);
          }}
        >
          {({
            isSubmitting,
            setFieldValue,
            values,
            validateField,
            errors,
            touched,
          }) => (
            <Form id="projectForm" autocomplete="off">
              <div className="px-5 pb-5">
                <div>
                  <Text
                    as="p"
                    size={"p-xxsmall"}
                    className="font-medium"
                    required
                  >
                    Cover image
                  </Text>
                  <label htmlFor="picture">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        className="h-[266px] w-full cursor-pointer mt-2 rounded-2xl object-cover"
                        alt="designfolio project cover image"
                      />
                    ) : (
                      <div className="bg-input-upload-bg-color rounded-[18px] p-4 m-auto text-center flex flex-col items-center  w-full justify-center border border-dashed border-input-upload-border-color cursor-pointer h-[250px] mt-2 ">
                        <img src="/assets/svgs/upload-red.svg" alt="" />
                        <Text
                          size="p-xsmall"
                          className="text-input-upload-heading-color mt-2 text-center"
                        >
                          Select an image for your project.
                        </Text>
                        <Text
                          size="p-xxxsmall"
                          className="mt-2 text-center text-input-upload-description-color"
                        >
                          Maximum size should be 400 X 300 px
                        </Text>
                        <Button
                          text={"Browse and choose"}
                          size="small"
                          type="secondary"
                          customClass="mt-4 pointer-events-none"
                        />
                      </div>
                    )}
                  </label>
                  <input
                    id="picture"
                    name="picture"
                    type="file"
                    hidden
                    onChange={(event) =>
                      handleImageChange(event, setFieldValue)
                    }
                    accept="image/png, image/jpeg,image/jpg,image/gif"
                  />
                  <ErrorMessage
                    name="picture"
                    component="div"
                    className="error-message"
                  />
                </div>
                <div className="mt-[24px]">
                  <div className="flex justify-between">
                    <Text
                      as="p"
                      size={"p-xxsmall"}
                      className="font-medium"
                      required
                    >
                      Project title
                    </Text>
                    <Text as="p" size={"p-xxsmall"} className="font-medium">
                      {values.title.length ?? 0}/80
                    </Text>
                  </div>
                  <Field
                    name="title"
                    type="text"
                    className={`text-input mt-2  ${
                      errors.title &&
                      touched.title &&
                      "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                    }`}
                    autoComplete="off"
                    placeholder="Eg: Designing an onboarding for 1M users"
                  />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="error-message"
                  />
                </div>
                <div className="my-[24px]">
                  <div className="flex justify-between">
                    <Text
                      as="p"
                      size={"p-xxsmall"}
                      className="font-medium"
                      required
                    >
                      Description
                    </Text>
                    <Text as="p" size={"p-xxsmall"} className="font-medium">
                      {values.description.length ?? 0}/160
                    </Text>
                  </div>
                  <Field
                    name="description"
                    type="text"
                    className={`text-input mt-2  ${
                      errors.description &&
                      touched.description &&
                      "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                    }`}
                    placeholder="Detail the Key Benefits and Target Audience"
                    autoComplete="off"
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="my-[24px] bg-input-password-bg-color rounded-[8px]  py-4 px-3 transition-all">
                  <div className="flex justify-between gap-[12px] items-center">
                    <div>
                      <Text
                        as="p"
                        size={"p-xxsmall"}
                        className="font-medium text-input-password-heading-color"
                      >
                        Set Password
                      </Text>
                      <Text
                        as="p"
                        size={"p-xxsmall"}
                        className="font-medium text-input-password-description-color"
                      >
                        Protect your project if you&apos;ve an NDA.
                      </Text>
                    </div>
                    <Toggle
                      onClick={() => setPassword((prev) => !prev)}
                      value={isPassword}
                    />
                  </div>
                  {isPassword && (
                    <>
                      <div className="relative mt-2">
                        <Field
                          name="password"
                          type={showEye ? "text" : "password"}
                          className={`text-input mt-2  ${
                            errors.password &&
                            touched.password &&
                            "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                          }`}
                          placeholder="Password"
                          autocomplete="new-password"
                        />
                        <div
                          className="absolute top-[24px] right-4 cursor-pointer"
                          onClick={() => {
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
              </div>
            </Form>
          )}
        </Formik>
      </div>
      <div className="flex gap-2 px-3 py-4 justify-end bg-modal-footer-bg-color">
        <Button text={"Cancel"} type="secondary" onClick={closeModal} />
        <Button
          btnType="submit"
          text={"Save case study"}
          form="projectForm"
          type="modal"
          isLoading={loading}
        />
      </div>
    </div>
  );
}
