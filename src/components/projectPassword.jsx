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

  return (
    <div className="px-4 max-w-[500px] m-auto">
      <div className="flex justify-center">
        <img
          src={projectDetails?.thumbnail?.url}
          alt="project image"
          className="lg:w-[545.5px] lg:h-[253.07px] rounded-[24px] mb-5 object-cover"
        />
      </div>
      <h1 className="text-[20px] text-center lg:w-[480px] m-auto md:text-[20px] line-clamp-2  text-[#202937] font-[600] leading-[32px] dark:text-[#E9EAEB]">
        {projectDetails?.title}
      </h1>

      <p className="text-[16px] text-center mt-1 lg:w-[480px] m-auto md:text-[16px] mb-4 text-[#B4B8C6] font-[400] leading-[24px] dark:text-[#B4B8C6]">
        By {`${projectDetails?.firstName} ${projectDetails?.lastName}`}
      </p>
      <div>
        <Formik
          initialValues={{ password: "" }}
          validationSchema={validationSchema}
          onSubmit={(values, actions) => {
            _getProjectDetails(id, status, { password: values.password })
              .then((res) => {
                setProjectDetails(res?.data);
                setIsProtected(res?.data?.isProtected);
              })
              .finally(() => actions.setSubmitting(false));
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form id="projectForm" autoComplete="off">
              <div className="relative">
                <div className="absolute top-[24px] left-4 rounded-[8px] border-[#E9EAEB] dark:border-[#2C2F39] cursor-pointer">
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
              <ErrorMessage
                name="password"
                component="div"
                className="error-message"
              />

              <div className="flex gap-2 justify-center mt-6">
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
