import React, { useState } from "react";
import { Formik, Form } from "formik";
import { useRouter } from "next/router";
import { _forgotPassword } from "@/network/post-request";
import { AuthLayout } from "@/components/ui/auth-layout";
import { FormInput } from "@/components/ui/form-input";
import { FormButton } from "@/components/ui/form-button";
import ForgotPasswordPlaceHolder from "@/components/forgotPasswordPlaceHolder";
import * as Yup from "yup";

// Yup validation schema
const forgotPasswordValidationSchema = Yup.object().shape({
    email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
});

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [sentEmail, setSentEmail] = useState("");
    const router = useRouter();

    const handleForgotPassword = async (values, { setFieldError }) => {
        setLoading(true);

        try {
            const data = {
                loginMethod: 0,
                email: values.email,
            };

            await _forgotPassword(data);
            setSentEmail(values.email);
            setIsEmailSent(true);
        } catch (error) {
            console.error("Forgot password error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.back({ scroll: false });
    };

    if (isEmailSent) {
        return (
            <AuthLayout>
                <ForgotPasswordPlaceHolder email={sentEmail} />
            </AuthLayout>
        );
    }

    return (
        <AuthLayout
            title="Forgot your password?"
            description="Please enter your email ID to reset your password"
            showBackButton={true}
            onBack={handleBack}
        >
            <Formik
                initialValues={{
                    email: "",
                }}
                validationSchema={forgotPasswordValidationSchema}
                onSubmit={handleForgotPassword}
            >
                {({ errors, touched, isSubmitting }) => (
                    <Form className="space-y-6">
                        <FormInput
                            name="email"
                            type="email"
                            label="Email address"
                            placeholder="you@email.com"
                            required
                            errors={errors}
                            touched={touched}
                            data-testid="input-email"
                        />

                        <FormButton
                            type="submit"
                            isLoading={loading}
                            disabled={isSubmitting}
                            data-testid="button-submit"
                        >
                            Submit
                        </FormButton>
                    </Form>
                )}
            </Formik>
        </AuthLayout>
    );
}