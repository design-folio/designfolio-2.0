import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/router";
import { _forgotPassword } from "@/network/post-request";
import Card from "./card";
import Button from "./button";
import Text from "./text";
import ForgotPasswordPlaceHolder from "./forgotPasswordPlaceHolder-old";

// Yup validation schema
const forgotPasswordValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  function handleForgetPassword(data) {
    setLoading(true);
    _forgotPassword(data)
      .then((res) => {
        setIsEmailSent(true);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }
  return (
    <div className="pt-[16px] pb-20">
      <Card>
        {isEmailSent ? (
          <ForgotPasswordPlaceHolder email={email} />
        ) : (
          <>
            <Button
              text="Go Back"
              onClick={() => router.back({ scroll: false })}
              type="secondary"
              size="small"
              icon={
                <img
                  src={"/assets/svgs/left-arrow.svg"}
                  alt="back arrow"
                  className="cursor-pointer"
                />
              }
            />
            <Text
              as="h1"
              size={"p-large"}
              className="text-landing-heading-text-color font-bold mt-4"
            >
              Forgot your password?
            </Text>
            <Text
              size={"p-xsmall"}
              className="mt-2 text-landing-description-text-color font-medium"
            >
              Please Enter your Email ID to reset your Password
            </Text>
            <div className="mt-[24px]">
              <div>
                <Formik
                  initialValues={{
                    email: "",
                  }}
                  validationSchema={forgotPasswordValidationSchema}
                  onSubmit={(values, actions) => {
                    // Handle form submission

                    actions.setSubmitting(false);

                    const data = {
                      loginMethod: 0,
                      email: values.email,
                    };
                    setEmail(values.email);
                    handleForgetPassword(data);
                  }}
                >
                  {({ isSubmitting, isValid, errors, touched }) => (
                    <Form id="forgotPasswordForm">
                      <Text
                        as="p"
                        size={"p-xxsmall"}
                        className="mt-6 font-medium"
                        required
                      >
                        Email
                      </Text>

                      <Field
                        type="email"
                        name="email"
                        placeholder="you@email.com"
                        className={`text-input mt-2 ${errors.email &&
                          touched.email &&
                          "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                          }`}
                        autoComplete="off"
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="error-message text-[14px]"
                      />
                      <Button
                        text="Submit"
                        form={"forgotPasswordForm"}
                        btnType="submit"
                        customClass="mt-6 w-full"
                        isLoading={loading}
                      />
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}