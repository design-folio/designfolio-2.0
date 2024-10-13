import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/router";
import { useGoogleLogin } from "@react-oauth/google";
import { _signupEmail, _signupGmail } from "@/network/post-request";
import Card from "./card";
import Button from "./button";
import Text from "./text";
import Link from "next/link";
import { setToken } from "@/lib/cooikeManager";

// Yup validation schema
const SignupValidationSchema = Yup.object().shape({
  firstName: Yup.string()
    .max(50, "Too Long!")
    .required("First name is required"),
  lastName: Yup.string().max(50, "Last name is too Long"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password is too short - should be 6 chars minimum.")
    .required("Password is required."),
});

export default function Signup() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        const userData = await response.json();

        const data = {
          loginMethod: 1,
          googleID: userData.id,
          username: router.query.username,
          firstName: userData.given_name,
          lastName: userData.family_name,
          email: userData.email,
        };
        _signupGmail(data)
          .then(({ data }) => {
            const { token } = data;
            setToken(token);
            router.push("/builder");
          })
          .catch((err) => console.log(err, "err"));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    onError: () => console.log("google login failed"),
    // Additional configuration if needed
  });

  function handleCreateAccount(data) {
    setLoading(true);
    _signupEmail(data)
      .then(({ data }) => {
        const { token } = data;
        setToken(token);
        router.push("/email-verify");
      })
      .catch((err) => {
        console.log(err, "errr");
      })
      .finally(() => setLoading(false));
  }

  return (
    <div className="pt-[16px] pb-20">
      <Card>
        <Button
          text="Go Back"
          onClick={() => router.back({ scroll: false })}
          type="secondary"
          size="small"
          icon={<img src="/assets/svgs/left-arrow.svg" alt="back arrow" />}
        />
        <Text
          as="h1"
          size={"p-large"}
          className="text-landing-heading-text-color font-bold mt-4"
        >
          Now, create your account
        </Text>
        <Text
          size={"p-xsmall"}
          className="mt-2 text-landing-description-text-color font-medium"
        >
          🎉 Just a step away from claiming{" "}
          <span className="text-df-orange-color">
            {`${router.query.username}.designfolio.me`}
          </span>
        </Text>
        <div className="mt-[24px]">
          <Button
            text="Login with Google"
            type="secondary"
            icon={
              <img
                src="/assets/svgs/google.svg"
                alt="google icon"
                className="w-[22px]"
              />
            }
            onClick={googleLogin}
            customClass="w-full"
          />
          <div className="flex items-center gap-[24px] my-[24px]">
            <div className="w-full h-[1px] bg-project-card-border" />
            or
            <div className="w-full h-[1px] bg-project-card-border" />
          </div>
          <div>
            <Formik
              initialValues={{
                firstName: "",
                lastName: "",
                email: "",
                password: "",
              }}
              validationSchema={SignupValidationSchema}
              onSubmit={(values, actions) => {
                // Handle form submission

                actions.setSubmitting(false);
                const data = {
                  username: router.query.username,
                  loginMethod: 0,
                  firstName: values.firstName,
                  lastName: values.lastName,
                  email: values.email,
                  password: values.password,
                };
                handleCreateAccount(data);
              }}
            >
              {({ isSubmitting, isValid, errors, touched }) => (
                <Form id="signupForm">
                  <div className="md:flex justify-center gap-6">
                    <div className="flex-1">
                      <Text
                        as="p"
                        size={"p-xxsmall"}
                        className="mt-6 font-medium"
                        required
                      >
                        First Name
                      </Text>
                      <Field
                        type="text"
                        name="firstName"
                        className={`text-input mt-2 ${
                          errors.firstName &&
                          touched.firstName &&
                          "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                        autoComplete="off"
                      />
                      <ErrorMessage
                        name="firstName"
                        component="div"
                        className="error-message text-[14px]"
                      />
                    </div>

                    <div className="flex-1 mt-6 md:mt-0">
                      <Text
                        as="p"
                        size={"p-xxsmall"}
                        className="mt-6 font-medium"
                      >
                        Last Name
                      </Text>

                      <Field
                        type="text"
                        name="lastName"
                        className={`text-input mt-2 ${
                          errors.lastName &&
                          touched.lastName &&
                          "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                        autoComplete="off"
                      />
                      <ErrorMessage
                        name="lastName"
                        component="div"
                        className="error-message text-[14px]"
                      />
                    </div>
                  </div>
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
                    className={`text-input mt-2 ${
                      errors.email &&
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

                  <Button
                    text="Create Account"
                    form="signupForm"
                    btnType="submit"
                    customClass="w-full mt-8"
                    isLoading={loading}
                  />
                </Form>
              )}
            </Formik>
            <Text
              size={"p-xxsmall"}
              className="text-df-secondary-text-color  text-center mg:w-[60%] m-auto !text-[14px] mt-6 font-medium"
            >
              By signing up, you agree to our <br />
              <Link href={"/terms-and-conditions"}>
                <span className="text-df-orange-color underline underline-offset-2 cursor-pointer">
                  Terms and Conditions
                </span>
              </Link>{" "}
              and{" "}
              <Link href={"/privacy-policy"}>
                <span className="text-df-orange-color underline underline-offset-2 cursor-pointer">
                  Privacy Policy
                </span>
              </Link>
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}
