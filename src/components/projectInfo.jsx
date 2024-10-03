import { _updateProject } from "@/network/post-request";
import { useRouter } from "next/router";
import { useState } from "react";
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

export default function ProjectInfo({
  projectDetails,
  userDetails,
  setPopoverMenu,
  popoverMenu,
  edit,
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

  const [isPassword, setPassword] = useState(projectDetails?.protected);
  const [showEye, setShowEye] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const router = useRouter();

  const saveProject = (key, value) => {
    _updateProject(router.query.id, { [key]: value }).then(() => {
      updateProjectCache(key, value);
    });
  };

  const updateProjectCache = (key, value) => {
    const updatedProjects = userDetails?.projects?.map((item) =>
      item._id === router.query.id ? { ...item, [key]: value } : item
    );
    queryClient.setQueriesData({ queryKey: ["userDetails"] }, (oldData) => {
      return { user: { ...oldData?.user, projects: updatedProjects } };
    });
    queryClient.setQueriesData(
      { queryKey: [`project-editor-${_id}`] },
      (oldData) => {
        return {
          ...oldData,
          project: { ...oldData.project, [key]: value },
        };
      }
    );
  };

  const handleOnBlur = (field, e) => {
    saveProject(field, e.target.textContent);
    e.target.textContent =
      e.target.textContent.length > 0 ? e.target.textContent : "Type here...";
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
    await _updateProject(router.query.id, { protected: !isPassword });
    setPassword((prev) => !prev);
  };

  return (
    <div className="bg-df-section-card-bg-color rounded-[24px] p-[16px] md:p-[32px]">
      <div className="flex justify-between items-center mb-2">
        <Button
          text="Go Back"
          onClick={handleBack}
          type="secondary"
          size="small"
          icon={<LeftArrow className="text-df-icon-color" />}
        />
        {edit && (
          <div
            className="mb-3 md:mb-0 relative"
            data-popover-id={popovers.password}
          >
            <Button
              type="secondary"
              onClick={() =>
                setPopoverMenu((prev) =>
                  prev == popovers.password ? null : popovers.password
                )
              }
              icon={
                isPassword ? (
                  <LockIcon className="stroke-bg-df-icon-color" />
                ) : (
                  <LockOpenIcon className="stroke-bg-df-icon-color" />
                )
              }
            />

            <div
              className={`pt-2 origin-top-right absolute z-20 right-0 transition-all will-change-transform translateZ(0) duration-120 ease-in-out ${
                popoverMenu === popovers.password
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-90 pointer-events-none"
              }`}
            >
              <div className=" w-[350px] md:w-[386px]  bg-popover-bg-color rounded-2xl shadow-popover-shadow border-[5px] border-popover-border-color p-2">
                <Formik
                  initialValues={{
                    password: password,
                  }}
                  validateOnChange
                  validateOnBlur
                  validationSchema={validationSchema}
                  onSubmit={(values, actions) => {
                    _updateProject(router.query.id, {
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
                    <Form id="projectForm" autocomplete="off">
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
      <h1
        className="text-[28px] md:text-[39px] font-inter font-[500] leading-[130%] text-profile-card-heading-color"
        contentEditable={edit}
        suppressContentEditableWarning
        onBlur={(e) => handleOnBlur("title", e)}
        onFocus={(e) => {
          if (e.target.textContent === "Type here...") {
            e.target.textContent = "";
          }
        }}
      >
        {title ?? "Type here..."}
      </h1>

      {description && (
        <p
          className="text-[16px] text-project-info-card-description-color font-inter font-[500] mt-2"
          contentEditable={edit}
          suppressContentEditableWarning
          onBlur={(e) => handleOnBlur("description", e)}
          onFocus={(e) => {
            if (e.target.textContent === "Type here...") {
              e.target.textContent = "";
            }
          }}
        >
          {description ?? "Type here..."}
        </p>
      )}

      <div className="flex flex-wrap mt-3 gap-x-5 gap-y-3 md:gap-x-[80px]">
        {(edit || !!client) && (
          <div>
            <p className="text-[14px] text-project-info-card-heading-color font-inter font-[500]">
              App name / Client
            </p>
            <p
              className="text-[14px] text-project-info-card-description-color font-inter font-[500]"
              contentEditable={edit}
              suppressContentEditableWarning
              onBlur={(e) => handleOnBlur("client", e)}
              onFocus={(e) => {
                if (e.target.textContent === "Type here...") {
                  e.target.textContent = "";
                }
              }}
            >
              {client ?? "Type here..."}
            </p>
          </div>
        )}

        {(edit || !!role) && (
          <div>
            <p className="text-[14px] text-project-info-card-heading-color font-inter font-[500]">
              My Role
            </p>
            <p
              className="text-[14px] text-project-info-card-description-color font-inter font-[500]"
              contentEditable={edit}
              suppressContentEditableWarning
              onBlur={(e) => handleOnBlur("role", e)}
              onFocus={(e) => {
                if (e.target.textContent === "Type here...") {
                  e.target.textContent = "";
                }
              }}
            >
              {role ?? "Type here..."}
            </p>
          </div>
        )}
        {(edit || !!industry) && (
          <div>
            <p className="text-[14px] text-project-info-card-heading-color font-inter font-[500]">
              Industry
            </p>
            <p
              className="text-[14px] text-project-info-card-description-color font-inter font-[500]"
              contentEditable={edit}
              suppressContentEditableWarning
              onBlur={(e) => handleOnBlur("industry", e)}
              onFocus={(e) => {
                if (e.target.textContent === "Type here...") {
                  e.target.textContent = "";
                }
              }}
            >
              {industry ?? "Type here..."}
            </p>
          </div>
        )}
        {(edit || !!platform) && (
          <div>
            <p className="text-[14px] text-project-info-card-heading-color font-inter font-[500]">
              Platform
            </p>
            <p
              className="text-[14px] text-project-info-card-description-color font-inter font-[500]"
              contentEditable={edit}
              suppressContentEditableWarning
              onBlur={(e) => handleOnBlur("platform", e)}
              onFocus={(e) => {
                if (e.target.textContent === "Type here...") {
                  e.target.textContent = "";
                }
              }}
            >
              {platform ?? "Type here..."}
            </p>
          </div>
        )}
      </div>
      {edit ? (
        <ImageWithOverlayAndPicker
          src={thumbnail?.url}
          project={projectDetails}
        />
      ) : (
        <figure className="relative">
          <img
            src={thumbnail?.url}
            alt="project image"
            className={`w-full h-full rounded-[20px] object-cover transition-opacity duration-100 mt-6 md:mt-8 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
            fetchPriority="high"
            decoding="async"
            onLoad={() => {
              setImageLoaded(true);
            }}
          />
          {!imageLoaded && (
            <div className="w-full h-full rounded-[20px] bg-df-placeholder-color absolute top-0 right-0" />
          )}
        </figure>
      )}
    </div>
  );
}
