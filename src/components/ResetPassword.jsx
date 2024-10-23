import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/router";
import { _resetPassword } from "@/network/post-request";
import Card from "./card";
import Text from "./text";
import Button from "./button";
import { toast } from "react-toastify";

// Yup validation schema
const resetPasswordValidationSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password is too short - should be 6 characters minimum.")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
});

export default function ResetPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  function handleResetPassword(email, otp, data) {
    setLoading(true);
    _resetPassword(email, otp, data)
      .then((res) => {
        toast.success(
          "Password reset successfully. Please log in with the new password."
        );
        router.push("/login");
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }
  return (
    <div className="pt-[16px] pb-20">
      <Card>
        <Text
          as="h1"
          size={"p-large"}
          className="text-sub-heading-text-color font-bold"
        >
          Reset Your Password
        </Text>
        <Text
          size={"p-xsmall"}
          className="mt-2 text-description-text font-medium"
        >
          We’ve verified your Email ID , Reset your password
        </Text>
        <div className="mt-[24px]">
          <div>
            <Formik
              initialValues={{
                password: "",
                confirmPassword: "",
              }}
              validationSchema={resetPasswordValidationSchema}
              onSubmit={(values, actions) => {
                setLoading(true);
                actions.setSubmitting(false);

                const data = {
                  password: values.password,
                };
                const { email, passwordResetOTP } = router.query;
                handleResetPassword(email, passwordResetOTP, data);
              }}
            >
              {({ isSubmitting, isValid, errors, values, touched }) => (
                <Form id="resetPasswordForm">
                  <Text
                    as="p"
                    size={"p-xxsmall"}
                    className="mt-6 font-medium"
                    required
                  >
                    Password
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

                  <Text
                    as="p"
                    size={"p-xxsmall"}
                    className="mt-6 font-medium"
                    required
                  >
                    Confirm Password
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
                  <Button
                    form="resetPasswordForm"
                    text="Reset Password"
                    customClass="w-full mt-8"
                    btnType="submit"
                    isLoading={loading}
                  />
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </Card>
    </div>
  );
}
