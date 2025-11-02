import { useState, useEffect } from "react";
import { Formik, Form } from "formik";
import { Mail } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useGoogleLogin } from "@react-oauth/google";
import { _signupEmail, _signupGmail } from "@/network/post-request";
import { setToken } from "@/lib/cooikeManager";
import { AuthLayout } from "@/components/ui/auth-layout";
import { FormInput } from "@/components/ui/form-input";
import { FormButton } from "@/components/ui/form-button";
import { GoogleButton } from "@/components/ui/google-button";
import { Divider } from "@/components/ui/divider";
import * as Yup from "yup";

const SignupValidationSchema = Yup.object().shape({
    name: Yup.string()
        .max(100, "Name is too long")
        .required("Full name is required"),
    email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
    password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required")
});



export default function Signup() {
    const router = useRouter();
    const [signupStep, setSignupStep] = useState("method");
    const [domain, setDomain] = useState(router.query.username || "");
    const [emailLoading, setEmailLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    useEffect(() => {
        if (router.query.username) {
            setDomain(router.query.username);
        }
    }, [router.query.username]);

    const handleEmailSignup = async (values, { setFieldError }) => {
        setEmailLoading(true);


        try {
            const signupData = {
                username: domain,
                loginMethod: 0,
                firstName: values.name.split(' ')[0] || values.name,
                lastName: values.name.split(' ').slice(1).join(' ') || "",
                email: values.email,
                password: values.password,
            };

            const { data } = await _signupEmail(signupData);
            const { token } = data;
            setToken(token);
            router.push("/email-verify");
        } catch (error) {
            console.error("Signup error:", error);
        } finally {
            setEmailLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleLoading(true);

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
                    username: domain,
                    firstName: userData.given_name,
                    lastName: userData.family_name,
                    email: userData.email,
                };

                const { data: signupData } = await _signupGmail(data);
                const { token } = signupData;
                setToken(token);
                router.push("/builder");
            } catch (error) {
                console.error("Error with Google signup:", error);
            } finally {
                setGoogleLoading(false);
            }
        },
        onError: () => {
        },
    });

    const handleGoogleSignup = () => {
        googleLogin();
    };

    // Method selection step
    if (signupStep === "method") {
        return (
            <AuthLayout
                title="Now, create your account."
                description={
                    <>
                        Just a step away from claiming{" "}
                        <span className="font-medium" style={{ color: "#FF553E" }}>
                            {domain}.designfolio.me
                        </span>
                    </>
                }
                showBackButton={true}
                onBack={() => router.push("/claim-link")}
            >
                <div className="space-y-4">
                    <GoogleButton
                        onClick={handleGoogleSignup}
                        isLoading={googleLoading}
                    >
                        Sign up with Google
                    </GoogleButton>

                    <Divider />

                    <div
                        className="bg-white border border-border rounded-full px-5 py-3 flex items-center justify-center gap-3 hover-elevate cursor-pointer"
                        onClick={() => setSignupStep("email")}
                        data-testid="button-signup-email"
                    >
                        <Mail className="w-5 h-5 text-foreground" />
                        <span className="text-base font-medium text-foreground">
                            Sign up with Email
                        </span>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    // Email signup step
    return (
        <AuthLayout
            title="Now, create your account."
            description={
                <>
                    Just a step away from claiming{" "}
                    <span className="font-medium" style={{ color: "#FF553E" }}>
                        {domain}.designfolio.me
                    </span>
                </>
            }
            showBackButton={true}
            onBack={() => setSignupStep("method")}
        >
            <Formik
                initialValues={{
                    name: "",
                    email: "",
                    password: ""
                }}
                validationSchema={SignupValidationSchema}
                onSubmit={handleEmailSignup}
            >
                {({ errors, touched, isSubmitting }) => (
                    <Form className="space-y-5">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            <FormInput
                                name="name"
                                type="text"
                                label="Full name"
                                placeholder="John Doe"
                                required
                                errors={errors}
                                touched={touched}
                                data-testid="input-name"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                        >
                            <FormInput
                                name="email"
                                type="email"
                                label="Email address"
                                placeholder="john@example.com"
                                required
                                errors={errors}
                                touched={touched}
                                data-testid="input-email"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                        >
                            <FormInput
                                name="password"
                                type="password"
                                label="Password"
                                placeholder="Create a strong password"
                                required
                                errors={errors}
                                touched={touched}
                                data-testid="input-password"
                            />
                            {/* {!errors.password && (
                                <p className="text-xs text-muted-foreground pt-1">
                                    Must be at least 8 characters long
                                </p>
                            )} */}
                        </motion.div>

                        <FormButton
                            type="submit"
                            isLoading={emailLoading}
                            disabled={isSubmitting}
                            data-testid="button-create-account"
                        >
                            Create account
                        </FormButton>


                        <p className="text-center text-xs text-muted-foreground">
                            By continuing, you agree to Designfolio's{" "}
                            <Link href="/terms-and-conditions" className="hover:underline" style={{ color: "#FF553E" }} data-testid="link-terms">
                                Terms and Conditions
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy-policy" className="hover:underline" style={{ color: "#FF553E" }} data-testid="link-privacy">
                                Privacy Policy
                            </Link>
                        </p>

                        <Divider />

                        <GoogleButton
                            onClick={handleGoogleSignup}
                            isLoading={googleLoading}
                        >
                            Sign up with Google
                        </GoogleButton>
                    </Form>
                )}
            </Formik>
        </AuthLayout>
    );
}