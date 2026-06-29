import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useContext, useState } from "react";
import * as Yup from "yup";
import Button from "./button";
import LockIcon from "../../public/assets/svgs/lock.svg";
import EyeIcon from "../../public/assets/svgs/eye.svg";
import EyeCloseIcon from "../../public/assets/svgs/eye-close.svg";
import { useRouter } from "next/router";
import { _getProjectDetails } from "@/network/get-request";
import queryClient from "@/network/queryClient";

const validationSchema = Yup.object().shape({
  password: Yup.string().required("Password is required"),
});

export default function ProjectPassword({
  projectDetails,
  id,
  status,
  setProjectDetails,
  setIsProtected,
}) {
  const [showEye, setShowEye] = useState(false);
  const router = useRouter();
  const displayName =
    projectDetails?.firstName && projectDetails?.lastName
      ? `${projectDetails?.firstName} ${projectDetails?.lastName}`
      : projectDetails?.name;
  return (
    <div className="m-auto max-w-[500px] px-4">
      <div className="flex justify-center">
        <img
          src={projectDetails?.thumbnail?.url}
          alt="project image"
          className="mb-5 rounded-[24px] object-cover lg:h-[253.07px] lg:w-[545.5px]"
        />
      </div>
      <h1 className="m-auto line-clamp-2 text-center text-[20px] leading-[32px] font-[600] text-[#202937] md:text-[20px] lg:w-[480px] dark:text-[#E9EAEB]">
        {projectDetails?.title}
      </h1>

      <p className="m-auto mt-1 mb-4 text-center text-[16px] leading-[24px] font-[400] text-[#B4B8C6] md:text-[16px] lg:w-[480px] dark:text-[#B4B8C6]">
        By {displayName}
      </p>
      <div>
        <Formik
          initialValues={{ password: "" }}
          validationSchema={validationSchema}
          onSubmit={async (values, actions) => {
            actions.setStatus(null);
            _getProjectDetails(id, status, { password: values.password })
              .then((res) => {
                setProjectDetails(res?.data);
                setIsProtected(res?.data?.isProtected);
              })
              .catch((error) => {
                const message =
                  error?.response?.data?.error || "Incorrect password. Please try again.";
                actions.setFieldError("password", message);
                actions.setStatus(message);
              })
              .finally(() => actions.setSubmitting(false));
          }}
        >
          {({ errors, touched, isSubmitting, status }) => (
            <Form id="projectForm" autoComplete="off">
              <div className="relative">
                <div className="absolute top-[24px] left-4 cursor-pointer rounded-[8px] border-[#E9EAEB] dark:border-[#2C2F39]">
                  <LockIcon className="stroke-bg-df-icon-color" />
                </div>
                <Field
                  name="password"
                  type={showEye ? "text" : "password"}
                  // className="text-input mt-2 dark:bg-[#1D1F27] dark:border-[#363A48] !pl-[50px]"
                  className={`text-input mt-2 !pl-[46px] ${
                    errors.password &&
                    touched.password &&
                    "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                  }`}
                  placeholder="Enter password"
                  autocomplete="new-password"
                />
                <div
                  className="absolute top-[24px] right-4 cursor-pointer"
                  onClick={() => setShowEye((prev) => !prev)}
                >
                  {showEye ? (
                    <EyeIcon className="text-df-icon-color" />
                  ) : (
                    <EyeCloseIcon className="text-df-icon-color" />
                  )}
                </div>
              </div>
              <ErrorMessage name="password" component="div" className="error-message" />
              {status && <div className="error-message mt-1 text-center">{status}</div>}

              <div className="mt-6 flex justify-center gap-2">
                <Button
                  text={"Go back"}
                  onClick={() => router.back({ scroll: false })}
                  type="secondary"
                />

                <Button
                  text="Unlock project"
                  form={"projectForm"}
                  btnType="submit"
                  isLoading={isSubmitting}
                  type="modal"
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
