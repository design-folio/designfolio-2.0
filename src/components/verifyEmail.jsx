import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import { useRouter } from "next/router";
import { _resendOTP } from "@/network/get-request";
import { toast } from "react-toastify";
import { _verifyEmail } from "@/network/post-request";
import { AuthLayout } from "@/components/ui/auth-layout";
import { FormInput } from "@/components/ui/form-input";
import { FormButton } from "@/components/ui/form-button";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/globalContext";
import * as Yup from "yup";

// Yup validation schema
const verifyPasswordValidationSchema = Yup.object().shape({
    emailVerificationOTP: Yup.string()
        .matches(/^[0-9]{6}$/, "Must be a whole number and exactly 6 characters")
        .required("OTP is required"),
});

export default function VerifyEmail() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState(30);
    const [isActive, setIsActive] = useState(true);

    const { userDetailsRefecth } = useGlobalContext();

    useEffect(() => {
        // Only start the timer if it is active
        if (isActive) {
            // Check if the timer should continue
            if (timeLeft > 0) {
                const intervalId = setInterval(() => {
                    setTimeLeft((timeLeft) => timeLeft - 1);
                }, 1000);

                // Cleanup interval on component unmount
                return () => clearInterval(intervalId);
            } else {
                setIsActive(false); // Deactivate the timer if time runs out
            }
        }
    }, [isActive, timeLeft]);

    const restartTimer = () => {
        // Reactivate the timer
        _resendOTP().then(() => {
            setIsActive(false); // Reset the active state to prevent interval overlap
            setTimeLeft(30); // Reset the timer to 30 seconds
            setIsActive(true);
            toast.success("Verification code sent");
        });
    };

    const updateQueryParams = () => {
        // Assuming you want to add/update the query param `param1=value1`
        const newQueryParams = { ...router.query, change: "email" };

        // Use router.push or router.replace to update the URL
        // Here we're using router.push
        router.push(
            {
                pathname: router.pathname,
                query: newQueryParams,
            },
            undefined,
            { shallow: true }
        );
    };



    function handleVerifyEmail(data) {
        setLoading(true);
        _verifyEmail(data)
            .then(() => {
                userDetailsRefecth();
                router.replace("/builder");
                setLoading(false);
                toast.success("Email verified successfully");
            })
            .catch(() => {
                setLoading(false);
            });
    }

    const handleBack = () => {
        Cookies.remove("df-token", {
            domain: process.env.NEXT_PUBLIC_BASE_DOMAIN,
        });
        router.back({ scroll: false });
    };

    return (
        <AuthLayout
            title="Verify Email"
            description={
                <>
                    We have sent an email to{" "}
                    <span style={{ color: "#FF553E" }}>
                        {router?.query?.email}
                    </span>{" "}
                    with a verification code. Please enter it below to confirm your email.
                </>
            }
            showBackButton={true}
            onBack={handleBack}
        >
            <Formik
                initialValues={{
                    emailVerificationOTP: "",
                }}
                validationSchema={verifyPasswordValidationSchema}
                onSubmit={handleVerifyEmail}
            >
                {({ errors, touched, isSubmitting, values }) => (
                    <Form className="space-y-6">
                        <div className="space-y-2">
                            <FormInput
                                name="emailVerificationOTP"
                                type="text"
                                label="Verification code"
                                placeholder="Enter one time code"
                                required
                                errors={errors}
                                touched={touched}
                                pattern="\d*"
                                maxLength="6"
                                data-testid="input-verification-code"
                            />

                            <div className="flex items-center gap-2 text-sm pt-1">
                                {timeLeft > 0 ? (
                                    <>
                                        <span className="text-foreground/70">
                                            Time left: {timeLeft} sec
                                        </span>
                                        <button
                                            type="button"
                                            disabled
                                            className="text-red-400 font-medium opacity-50 cursor-not-allowed"
                                            data-testid="button-resend-code"
                                        >
                                            Resend code
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-foreground/70">
                                            Didn't receive the code?
                                        </span>
                                        <button
                                            type="button"
                                            onClick={restartTimer}
                                            className="text-red-400 hover:text-red-500 font-medium"
                                            data-testid="button-resend-code"
                                        >
                                            Resend code
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>



                        <FormButton
                            type="submit"
                            isLoading={loading}
                            disabled={isSubmitting || !values.emailVerificationOTP.trim()}
                            data-testid="button-confirm"
                        >
                            Confirm
                        </FormButton>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={updateQueryParams}
                                className="text-sm text-foreground/70 hover:text-foreground font-medium hover:underline"
                                data-testid="button-change-email"
                            >
                                Change email address
                            </button>
                        </div>
                    </Form>
                )}
            </Formik>
        </AuthLayout>
    );
}