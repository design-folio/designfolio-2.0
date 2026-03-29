import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { _changePassword } from "@/network/post-request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const resetPasswordValidationSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password is too short - should be 6 chars minimum.")
    .required("Required")
    .notOneOf(
      [Yup.ref("oldPassword")],
      "New password must be different from the old password."
    ),
  oldPassword: Yup.string()
    .min(6, "Old password is too short - should be 6 chars minimum.")
    .required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Required"),
});

export default function ChangePassword() {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <p className="text-[18px] font-semibold text-[#1A1A1A] dark:text-[#F0EDE7]">
        Change password
      </p>

      <Formik
        initialValues={{ password: "", confirmPassword: "", oldPassword: "" }}
        validationSchema={resetPasswordValidationSchema}
        onSubmit={(values, actions) => {
          setLoading(true);
          actions.setSubmitting(false);
          _changePassword({
            currentPassword: values.oldPassword,
            newPassword: values.password,
          })
            .then(() => {
              toast.success("Password changed successfully");
              setLoading(false);
            })
            .catch(() => setLoading(false));
        }}
      >
        {({ isValid, errors, touched }) => (
          <Form id="resetPasswordForm">
            <div className="mt-5">
              <label className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
                Old password <span className="text-destructive">*</span>
              </label>
              <Field name="oldPassword">
                {({ field }) => (
                  <Input
                    {...field}
                    id="oldPassword"
                    type="password"
                    autoComplete="off"
                    className={`mt-2 ${errors.oldPassword && touched.oldPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                )}
              </Field>
              <ErrorMessage name="oldPassword" component="p" className="text-destructive text-[13px] mt-1" />
            </div>

            <div className="md:flex gap-8 mt-5">
              <div className="flex-1">
                <label className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
                  New password <span className="text-destructive">*</span>
                </label>
                <Field name="password">
                  {({ field }) => (
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      autoComplete="off"
                      className={`mt-2 ${errors.password && touched.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                  )}
                </Field>
                <ErrorMessage name="password" component="p" className="text-destructive text-[13px] mt-1" />
              </div>

              <div className="flex-1 mt-5 md:mt-0">
                <label className="text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0EDE7]">
                  Confirm password <span className="text-destructive">*</span>
                </label>
                <Field name="confirmPassword">
                  {({ field }) => (
                    <Input
                      {...field}
                      id="confirmPassword"
                      type="password"
                      autoComplete="off"
                      className={`mt-2 ${errors.confirmPassword && touched.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                  )}
                </Field>
                <ErrorMessage name="confirmPassword" component="p" className="text-destructive text-[13px] mt-1" />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button
                type="submit"
                form="resetPasswordForm"
                disabled={loading || !isValid}
                className="w-full lg:w-fit rounded-full"
              >
                {loading ? "Saving…" : "Change password"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
