import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useGoogleLogin } from "@react-oauth/google";
import { _loginWithEmail, _loginWithGmail } from "@/network/post-request";
import { setToken } from "@/lib/cooikeManager";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TrustedBySection from "@/components/TrustedBySection";
import Logo from "../../public/assets/svgs/logo.svg";
import { useMeasuredHeight } from "@/hooks/useMeasuredHeight";
import Link from "next/link";

const LoginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function Login() {
  const [contentRef, contentHeight] = useMeasuredHeight();
  const [loginStep, setLoginStep] = useState("method");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (router) {
      router.prefetch("/builder");
    }
  }, [router]);

  const handleLogin = (data) => {
    _loginWithEmail(data)
      .then(({ data }) => {
        const { token, emailVerification } = data;
        setToken(token);
        if (emailVerification) {
          router.push("/builder");
        } else {
          router.push("/email-verify");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        setError(
          err.response?.data?.message || "Login failed. Please try again."
        );
        console.log(err, "err");
      });
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
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
            setError(
              err.response?.data?.message ||
                "Google login failed. Please try again."
            );
            console.log(err, "err");
          })
          .finally(() => {
            setIsLoading(false);
          });
      } catch (error) {
        setIsLoading(false);
        setError("Google login failed. Please try again.");
        console.error("Error fetching user data:", error);
      }
    },
    onError: () => {
      setError("Google login failed. Please try again.");
      console.log("Google login failed");
    },
  });

  const handleGoogleLogin = () => {
    setError("");
    googleLogin();
  };

  return (
    <div className="min-h-screen bg-background-landing flex flex-col relative overflow-hidden">
      {/* Simple 3x3 Grid Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none grid grid-cols-3 grid-rows-3 gap-8 p-8">
        {/* Row 1 */}
        <div className="bg-muted/25 rounded-[4rem]" />
        <div className="bg-muted/30 rounded-[5rem]" />
        <div className="bg-muted/25 rounded-[4rem]" />

        {/* Row 2 */}
        <div className="bg-muted/30 rounded-[5rem]" />
        <div className="bg-muted/25 rounded-[4rem]" />
        <div className="bg-muted/30 rounded-[5rem]" />

        {/* Row 3 */}
        <div className="bg-muted/25 rounded-[4rem]" />
        <div className="bg-muted/30 rounded-[5rem]" />
        <div className="bg-muted/25 rounded-[4rem]" />
      </div>

      <div className="flex-1 flex flex-col relative z-10">
        <div className="pt-8 pb-4 flex justify-center">
          <Link href="/" className="cursor-pointer" data-testid="link-home">
            <Logo className="text-df-icon-color" />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <Card className="bg-white/95 backdrop-blur-sm py-8 px-6 sm:px-8 border-0 rounded-3xl shadow-2xl overflow-hidden">
              <motion.div
                initial={false}
                animate={{ height: contentHeight || "auto" }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              >
                <div ref={contentRef}>
                  <AnimatePresence mode="wait" initial={false}>
                    {loginStep === "method" ? (
                      <motion.div
                        key="method"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <div className="text-center mb-8">
                          <h1
                            className="font-semibold text-2xl mb-2 text-foreground"
                            data-testid="text-login-headline"
                          >
                            Welcome back
                          </h1>
                          <p
                            className="text-sm text-foreground/60"
                            data-testid="text-login-description"
                          >
                            Log in to your account to continue
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div
                            className="bg-white border border-border rounded-full px-5 py-3 flex items-center justify-center gap-3 hover-elevate cursor-pointer"
                            onClick={handleGoogleLogin}
                            data-testid="button-login-google"
                          >
                            <img
                              src="/assets/svgs/google.svg"
                              alt=""
                              className="w-5 h-5"
                            />
                            <span className="text-base font-medium text-foreground">
                              {isLoading
                                ? "Logging in..."
                                : "Log in with Google"}
                            </span>
                          </div>

                          <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-white px-3 text-muted-foreground font-medium">
                                OR
                              </span>
                            </div>
                          </div>

                          <div
                            className="bg-white border border-border rounded-full px-5 py-3 flex items-center justify-center gap-3 hover-elevate cursor-pointer"
                            onClick={() => setLoginStep("email")}
                            data-testid="button-login-email"
                          >
                            <Mail className="w-5 h-5 text-foreground" />
                            <span className="text-base font-medium text-foreground">
                              Log in with Email
                            </span>
                          </div>
                        </div>

                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm text-red-600 text-center mt-4"
                            data-testid="text-error"
                          >
                            {error}
                          </motion.div>
                        )}

                        <p className="text-center text-sm text-foreground/70 mt-8">
                          Don't have an account?{" "}
                          <Link
                            href="/signup"
                            className="hover:underline font-medium cursor-pointer"
                            style={{ color: "#FF553E" }}
                            data-testid="link-signup"
                          >
                            Sign up
                          </Link>
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="email"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <button
                          type="button"
                          onClick={() => setLoginStep("method")}
                          className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground -ml-2 mb-6 hover-elevate px-2 py-1 rounded-md"
                          data-testid="button-back"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back
                        </button>

                        <div className="text-center mb-6">
                          <h1
                            className="font-semibold text-2xl mb-2 text-foreground"
                            data-testid="text-login-headline"
                          >
                            Log in with email
                          </h1>
                          <p
                            className="text-sm text-foreground/60"
                            data-testid="text-login-description"
                          >
                            Enter your credentials to continue
                          </p>
                        </div>

                        <Formik
                          initialValues={{
                            email: "",
                            password: "",
                          }}
                          validationSchema={LoginValidationSchema}
                          onSubmit={(values, actions) => {
                            setIsLoading(true);
                            setError("");

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
                            <Form className="space-y-5">
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className="space-y-2"
                              >
                                <Label
                                  htmlFor="email"
                                  className="text-sm font-medium text-foreground"
                                >
                                  Email<span className="text-red-500">*</span>
                                </Label>
                                <div
                                  className={`bg-white dark:bg-white border-2 rounded-full transition-all duration-300 ease-out ${
                                    errors.email && touched.email
                                      ? "border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)]"
                                      : "border-border hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)]"
                                  }`}
                                >
                                  <Field
                                    as={Input}
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="border-0 bg-transparent h-11 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-base placeholder:text-muted-foreground/60"
                                    data-testid="input-email"
                                  />
                                </div>
                                <ErrorMessage
                                  name="email"
                                  component="p"
                                  className="text-sm text-red-500 mt-1"
                                  data-testid="error-email"
                                />
                              </motion.div>

                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                                className="space-y-2"
                              >
                                <Label
                                  htmlFor="password"
                                  className="text-sm font-medium text-foreground"
                                >
                                  Password
                                  <span className="text-red-500">*</span>
                                </Label>
                                <div
                                  className={`bg-white dark:bg-white border-2 rounded-full transition-all duration-300 ease-out ${
                                    errors.password && touched.password
                                      ? "border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.12)]"
                                      : "border-border hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)]"
                                  }`}
                                >
                                  <Field
                                    as={Input}
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    className="border-0 bg-transparent h-11 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-base placeholder:text-muted-foreground/60"
                                    data-testid="input-password"
                                  />
                                </div>
                                <ErrorMessage
                                  name="password"
                                  component="p"
                                  className="text-sm text-red-500 mt-1"
                                  data-testid="error-password"
                                />
                              </motion.div>

                              <div className="flex items-center justify-end">
                                <Link
                                  href="/forgot-password"
                                  className="text-sm font-medium hover:underline"
                                  style={{ color: "#FF553E" }}
                                  data-testid="link-forgot-password"
                                >
                                  Forgot password?
                                </Link>
                              </div>

                              {error && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="text-sm text-red-600 text-center"
                                  data-testid="text-error"
                                >
                                  {error}
                                </motion.div>
                              )}

                              <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-foreground text-background-landing hover:bg-foreground/90 focus-visible:outline-none border-0 rounded-full h-11 px-6 text-base font-semibold no-default-hover-elevate no-default-active-elevate transition-colors"
                                data-testid="button-login-submit"
                              >
                                {isLoading ? "Logging in..." : "Log in"}
                              </Button>

                              <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                  <span className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                  <span className="bg-white px-3 text-muted-foreground font-medium">
                                    OR
                                  </span>
                                </div>
                              </div>

                              <div
                                className="bg-white border border-border rounded-full px-5 py-3 flex items-center justify-center gap-3 hover-elevate cursor-pointer"
                                onClick={handleGoogleLogin}
                                data-testid="button-login-google-alt"
                              >
                                <img
                                  src="/assets/svgs/google.svg"
                                  alt=""
                                  className="w-5 h-5"
                                />
                                <span className="text-base font-medium text-foreground">
                                  {isLoading
                                    ? "Logging in..."
                                    : "Log in with Google"}
                                </span>
                              </div>

                              <p className="text-center text-sm text-foreground/70 mt-6">
                                Don't have an account?{" "}
                                <Link
                                  href="/signup"
                                  className="hover:underline font-medium cursor-pointer"
                                  style={{ color: "#FF553E" }}
                                  data-testid="link-signup"
                                >
                                  Sign up
                                </Link>
                              </p>
                            </Form>
                          )}
                        </Formik>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </Card>
          </motion.div>
        </div>

        <TrustedBySection backgroundColor="transparent" />
      </div>
    </div>
  );
}
