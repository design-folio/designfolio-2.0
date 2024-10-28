import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/router";
import { _resendOTP } from "@/network/get-request";
import { toast } from "react-toastify";
import { _verifyEmail } from "@/network/post-request";
import Button from "./button";
import Card from "./card";
import Text from "./text";
import Cookies from "js-cookie";
import { useGlobalContext } from "@/context/globalContext";

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

  function handleVerifyPassword(data) {
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
    <div className="pt-[16px] pb-20">
      <Card>
        <Button
          text="Go Back"
          onClick={handleBack}
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
          Verify Email
        </Text>
        <Text
          size={"p-xsmall"}
          className="mt-2 text-landing-description-text-color font-medium"
        >
          We have sent an email to{" "}
          <span className="text-df-orange-color">{router?.query?.email}</span>{" "}
          with a verification code. Please enter it below confirm your email.
        </Text>
        <div className="mt-[24px]">
          <div>
            <Formik
              initialValues={{
                emailVerificationOTP: "",
              }}
              validationSchema={verifyPasswordValidationSchema}
              onSubmit={(values, actions) => {
                // Handle form submission

                actions.setSubmitting(false);

                const data = {
                  emailVerificationOTP: values.emailVerificationOTP,
                };
                handleVerifyPassword(data);
              }}
            >
              {({ isSubmitting, isValid, errors, touched }) => (
                <Form id="emailverifyform">
                  <Text
                    as="p"
                    size={"p-xxsmall"}
                    className="mt-6 font-medium"
                    required
                  >
                    Verification code
                  </Text>

                  <Field
                    type="text" // Use "text" to avoid default browser behaviors associated with "number"
                    pattern="\d*" // This pattern helps mobile browsers to open numeric keyboard
                    maxLength="6"
                    name="emailVerificationOTP"
                    className={`text-input mt-2 ${
                      errors.emailVerificationOTP &&
                      touched.emailVerificationOTP &&
                      "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                    }`}
                    autoComplete="off"
                    placeholder="Enter one time code"
                  />
                  <ErrorMessage
                    name="emailVerificationOTP"
                    component="div"
                    className="error-message text-[14px]"
                  />
                  <div className="flex  gap-1 items-center pt-2">
                    <p className="w-fit text-[12px] font-inter md:!text-[14px] mt-[2px] font-[500] text-landing-description-text-color">
                      {`${
                        timeLeft == 0
                          ? "Didn't received the code?"
                          : `Time left: ${timeLeft} sec`
                      }`}
                    </p>
                    <Button
                      text="Resend code"
                      type="normal"
                      customClass={`hover:bg-transparent p-0 px-1  w-fit !text-[12px] md:!text-[14px] text-df-orange-color ${
                        timeLeft != 0 && "opacity-50"
                      }`}
                      disabled={timeLeft != 0}
                      onClick={() => restartTimer()}
                    />
                  </div>
                  <Button
                    btnType="submit"
                    disabled={isSubmitting || !isValid}
                    text="Confirm"
                    form={"emailverifyform"}
                    customClass="mt-6 w-full"
                    isLoading={loading}
                  />
                  <Button
                    text="Change email address"
                    type="normal"
                    onClick={updateQueryParams}
                    customClass="mt-2 w-full"
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
