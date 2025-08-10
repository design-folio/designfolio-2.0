import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { _changePassword } from "@/network/post-request";
import Text from "./text";
import Button from "./button";

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

            <Field
              type="password"
              name="oldPassword"
              className={`text-input mt-2 ${
                errors.oldPassword &&
                touched.oldPassword &&
                "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
              }`}
              autoComplete="off"
            />
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

                <Field
                  type="password"
                  name="password"
                  className={`text-input mt-2 ${
                    errors.password &&
                    touched.password &&
                    "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                  }`}
                  autoComplete="off"
                />
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

                <Field
                  type="password"
                  name="confirmPassword"
                  className={`text-input mt-2 ${
                    errors.confirmPassword &&
                    touched.confirmPassword &&
                    "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                  }`}
                  autoComplete="off"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="error-message text-[14px]"
                />
              </div>
            </div>

            <div className="lg:flex justify-end">
              <Button
                form={"resetPasswordForm"}
                btnType="submit"
                isLoading={loading}
                isDisabled={!isValid}
                customClass="mt-6 w-full lg:w-fit"
                text="Change password"
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
