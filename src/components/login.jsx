import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useGoogleLogin } from "@react-oauth/google";
import { _loginWithEmail, _loginWithGmail } from "@/network/post-request";
import { setToken } from "@/lib/cooikeManager";
import Card from "./card";
import Text from "./text";
import Button from "./button";
import Link from "next/link";

// Yup validation schema
const LoginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function Login() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (router) {
      router.prefetch("/builder");
    }
  }, [router]);

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
        };
        _loginWithGmail(data)
          .then(({ data }) => {
            const { token, emailVerification } = data;
            if (emailVerification) {
              setToken(token);
              router.push("/builder");
            } else {
              router.push("/email-verify");
            }
          })
          .catch((err) => {
            console.log(err, "err");
          });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    onError: () => console.log("Google login failed"),
  });

  const handleLogin = (data) => {
    _loginWithEmail(data)
      .then(({ data }) => {
        const { token, emailVerification } = data;
        setToken(token);
        if (!emailVerification) {
          setLoading(false);
          router.push("/builder");
        } else {
          router.push("/email-verify");
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log(err, "err");
      });
  };

  return (
    <div className="pt-[16px] pb-20">
      <Card>
        <Text
          as="h1"
          size={"p-large"}
          className="text-landing-heading-text-color font-bold"
        >
          Welcome back,
        </Text>
        <Text
          size={"p-xsmall"}
          className="mt-2 text-landing-description-text-color font-medium"
        >
          Login to your account to access all the features
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
            customClass="w-full "
          />
          <div className="flex items-center gap-[24px] my-[24px] text-landing-description-text-color">
            <div className="w-full h-[1px] bg-landing-card-border-color" />
            or
            <div className="w-full h-[1px] bg-landing-card-border-color" />
          </div>
          <div>
            <Formik
              initialValues={{
                email: "",
                password: "",
              }}
              validationSchema={LoginValidationSchema}
              onSubmit={(values, actions) => {
                // Handle form submission
                setLoading(true);

                const data = {
                  loginMethod: 0,
                  email: values.email,
                  password: values.password,
                };
                handleLogin(data);
                actions.setSubmitting(false);
              }}
            >
              {({ errors, touched }) => (
                <Form id="LoginForm">
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
                    placeholder="Enter password"
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

                  <Link href={"/forgot-password"}>
                    <Text
                      size={"p-xxsmall"}
                      className="mt-[8px] text-right w-fit ml-auto cursor-pointer text-landing-description-text-color font-medium"
                    >
                      Forgot Password?
                    </Text>
                  </Link>

                  <Button
                    text="Login"
                    form={"LoginForm"}
                    btnType="submit"
                    customClass="mt-6 w-full"
                    isLoading={loading}
                  />
                </Form>
              )}
            </Formik>
          </div>

          <Text
            size={"p-xxsmall"}
            className="text-landing-description-text-color mt-[24px] text-center"
          >
            Don’t have an account?
            <Link href={"/claim-link"}>
              <span className="text-input-error-color underline cursor-pointer ml-2">
                Create Account
              </span>
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}
