import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/router";
import { useDebouncedCallback } from "use-debounce";
import { _checkUsername } from "@/network/post-request";
import Card from "./card";
import Text from "./text";
import Button from "./button";
import Link from "next/link";

// Yup validation schema
const DomainValidationSchema = Yup.object().shape({
  domain: Yup.string()
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})?$/, "Invalid subdomain")
    .required("Required"),
});

export default function ClaimLink() {
  const [isAvailable, setIsAvailable] = useState(false);
  const router = useRouter();
  const [domainValue, setDomainValue] = useState("");
  const [loading, setLoding] = useState(false);

  const handleClaim = () => {
    router.push({
      pathname: "/signup",
      query: { username: domainValue.toLowerCase() },
    });
  };

  // Debounced API call
  const debouncedCheckUsername = useDebouncedCallback(
    async (value, setFieldError) => {
      setLoding(true);
      if (value.length !== 0) {
        try {
          const response = await _checkUsername({ username: value });
          const isDomainAvailable = response?.data?.available ?? false;
          setIsAvailable(isDomainAvailable);
          if (!isDomainAvailable) {
            setFieldError(
              "domain",
              "This domain seems to be taken already. Try something similar."
            );
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoding(false);
        }
      }
    },
    1000 // Delay in milliseconds
  );

  // Handle input change
  const handleChange = (e, setFieldValue, setFieldError, setFieldTouched) => {
    const { value, name } = e.target;
    setLoding(true);
    setFieldTouched(name, true, false);
    const pattern = /^[a-zA-Z0-9-\s]+$/;
    const newValue = value
      .split("")
      .filter((char) => pattern.test(char))
      .join("");
    const formattedValue = newValue.replace(/\s+/g, "-");
    setFieldValue(name, formattedValue);
    setDomainValue(formattedValue);
    debouncedCheckUsername(formattedValue, setFieldError);
  };

  return (
    <div className="pt-[16px] pb-20">
      <Card>
        <Text as="h1" size={"p-large"} className="text-landing-heading-text-color font-bold">
          First, claim your unique link
        </Text>
        <Text size={"p-xsmall"} className="text-landing-description-text-color mt-2 font-medium">
          Check whether we can get you the best domain.
        </Text>
        <div className="mt-[24px]">
          <Formik
            initialValues={{ domain: "" }}
            validationSchema={DomainValidationSchema}
            onSubmit={(actions) => {
              // Handle form submission
              handleClaim();
            }}
          >
            {({ errors, values, setFieldValue, setFieldError, setFieldTouched }) => (
              <Form id="ClaimForm">
                <Text as="p" size={"p-xxsmall"} className="mt-6 font-medium" required>
                  Your Website
                </Text>
                <div className="mt-2">
                  <div className="w-full">
                    <div className="relative">
                      <Field
                        type="text"
                        name="domain"
                        placeholder="yourname"
                        autoComplete="off"
                        className={`text-input w-full !rounded-[16px] ${
                          loading ? "!pr-[182px]" : "!pr-[158px]"
                        } !py-[19.2px] placeholder-[#D1D5D9] xl:!py-[18.8px] ${
                          ((!!errors.domain && values.domain && !loading) ||
                            (!isAvailable && !loading && values.domain)) &&
                          "!text-input-error-color"
                        } ${
                          !errors.domain &&
                          domainValue &&
                          isAvailable &&
                          !loading &&
                          "!text-input-success-color"
                        }`}
                        onChange={(e) =>
                          handleChange(e, setFieldValue, setFieldError, setFieldTouched)
                        }
                      />
                      <div className="absolute top-[3.5px] right-[3px] flex items-center justify-center gap-[10px]">
                        <span
                          className="text-input-button-color font-inter flex items-center gap-2 rounded-xl p-[14px] font-[500] transition-all"
                          style={{
                            background: "linear-gradient(to right, #F1F2F8, #F7F3EB)",
                          }}
                        >
                          .designfolio.me
                          {loading && domainValue && (
                            <svg
                              className="h-4 w-4 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V2.5A9.5 9.5 0 002.5 12H4z"
                              ></path>
                            </svg>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 h-6 text-center">
                  <div className="flex flex-col justify-center overflow-hidden">
                    <div
                      className={`flex items-center justify-center gap-x-1 transition duration-300 ${
                        !domainValue || loading
                          ? "animate-slide-up h-max max-h-10 opacity-100"
                          : "h-max max-h-0 opacity-0"
                      }`}
                    >
                      <img src="/assets/svgs/normal-emoji.svg" alt="" />
                      <p className="text-input-button-color font-inter font-[500]">
                        Claim your domain before it&apos;s late!
                      </p>
                    </div>

                    <div
                      className={`flex items-center justify-center gap-x-1 transition-transform duration-300 ${
                        !errors.domain && domainValue && isAvailable && !loading
                          ? "animate-slide-down h-max max-h-10 -translate-y-full opacity-100"
                          : "h-max max-h-0 -translate-y-full opacity-0"
                      }`}
                    >
                      <img src="/assets/svgs/success-emoji.svg" alt="" />
                      <p className="text-input-success-color font-inter text-center font-[500]">
                        It&apos;s available, claim it now.
                      </p>
                    </div>

                    <div
                      className={`flex items-center justify-center gap-x-1 transition-transform duration-300 ${
                        (!!errors.domain && values.domain && !loading) ||
                        (!isAvailable && !loading && values.domain)
                          ? "animate-slide-up h-max max-h-10 translate-y-full opacity-100"
                          : "h-max max-h-0 translate-y-full opacity-0"
                      }`}
                    >
                      <img src="/assets/svgs/error-emoji.svg" alt="" />
                      <p className="text-input-error-color font-inter flex text-center font-[500]">
                        Username is already taken.{" "}
                        <span className="hidden md:block">Your clone got here first!</span>
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  text="Claim domain"
                  // type="tertiary"
                  form={"ClaimForm"}
                  btnType="submit"
                  customClass="w-full mt-5"
                  isDisabled={!(!errors.domain && domainValue && isAvailable && !loading)}
                />
              </Form>
            )}
          </Formik>
        </div>
        <Text
          size={"p-xxsmall"}
          className="text-landing-description-text-color mg:w-[60%] m-auto mt-6 text-center !text-[14px] font-medium"
        >
          Already have an account?{" "}
          <Link href={"/login"}>
            <span className="text-df-orange-color cursor-pointer underline">Login</span>
          </Link>
        </Text>
      </Card>
    </div>
  );
}
