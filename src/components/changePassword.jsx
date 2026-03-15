import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { _changePassword } from "@/network/post-request";
import Text from "./text";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

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
      <Text size="p-small" className="text-df-section-card-heading-color">
        Change password
      </Text>
      <Formik
        initialValues={{
          password: "",
          confirmPassword: "",
          oldPassword: "",
        }}
        validationSchema={resetPasswordValidationSchema}
        onSubmit={(values, actions) => {
          setLoading(true);
          actions.setSubmitting(false);

          const data = {
            currentPassword: values.oldPassword,
            newPassword: values.password,
          };
          _changePassword(data)
            .then(() => {
              toast.success("Password changed successfully");
              setLoading(false);
            })
            .catch((err) => setLoading(false));
        }}
      >
        {({ isSubmitting, isValid, errors, touched }) => (
          <Form id="resetPasswordForm">
            <Text size={"p-xxsmall"} className="mt-6 font-medium" required>
              Old password
            </Text>

            <Field name="oldPassword">
              {({ field }) => (
                <Input {...field} id="oldPassword" type="password" autoComplete="off"
                  className={`mt-2 ${errors.oldPassword && touched.oldPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
              )}
            </Field>
            <ErrorMessage
              name="oldPassword"
              component="div"
              className="error-message text-[14px]"
            />
            <div className="md:flex gap-10">
              <div className="flex-1 ">
                <Text size={"p-xxsmall"} className="mt-6 font-medium" required>
                  New password
                </Text>

                <Field name="password">
                  {({ field }) => (
                    <Input {...field} id="password" type="password" autoComplete="off"
                      className={`mt-2 ${errors.password && touched.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="error-message text-[14px]"
                />
              </div>

              <div className="flex-1">
                <Text size={"p-xxsmall"} className="mt-6 font-medium" required>
                  Confirm password
                </Text>

                <Field name="confirmPassword">
                  {({ field }) => (
                    <Input {...field} id="confirmPassword" type="password" autoComplete="off"
                      className={`mt-2 ${errors.confirmPassword && touched.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="error-message text-[14px]"
                />
              </div>
            </div>

            <div className="lg:flex justify-end">
              <Button
                type="submit"
                form="resetPasswordForm"
                disabled={loading || !isValid}
                className="mt-6 w-full lg:w-fit"
              >{loading ? "Saving…" : "Change password"}</Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
