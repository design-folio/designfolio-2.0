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
    .matches(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})?$/,
      "Invalid subdomain"
    )
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
        <Text
          as="h1"
          size={"p-large"}
          className="text-landing-heading-text-color font-bold"
        >
          First, claim your unique link
        </Text>
        <Text
          size={"p-xsmall"}
          className="mt-2 text-landing-description-text-color font-medium"
        >
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
            {({
              errors,
              values,
              setFieldValue,
              setFieldError,
              setFieldTouched,
            }) => (
              <Form id="ClaimForm">
                <Text
                  as="p"
                  size={"p-xxsmall"}
                  className="mt-6 font-medium"
                  required
                >
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
                        } !py-[19.2px] xl:!py-[18.8px] placeholder-[#D1D5D9] ${
                          ((!!errors.domain && values.domain && !loading) ||
                            (!isAvailable && !loading && values.domain)) &&
                          "!text-df-error"
                        } ${
                          !errors.domain &&
                          domainValue &&
                          isAvailable &&
                          !loading &&
                          "!text-df-success"
                        }`}
                        onChange={(e) =>
                          handleChange(
                            e,
                            setFieldValue,
                            setFieldError,
                            setFieldTouched
                          )
                        }
                      />
                      <div className="flex justify-center items-center gap-[10px] absolute top-[3.5px] right-[3px]">
                        <span
                          className="text-input-button-color flex  gap-2 items-center font-inter font-[500]  p-[14px] rounded-xl transition-all"
                          style={{
                            background:
                              "linear-gradient(to right, #F1F2F8, #F7F3EB)",
                          }}
                        >
                          .designfolio.me
                          {loading && domainValue && (
                            <svg
                              className="animate-spin h-4 w-4"
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
                <div className="h-6 text-center mt-6">
                  <div className="flex flex-col justify-center overflow-hidden">
                    <div
                      className={`transition flex gap-x-1 justify-center items-center duration-300 ${
                        !domainValue || loading
                          ? "h-max animate-slide-up max-h-10 opacity-100"
                          : "h-max max-h-0 opacity-0"
                      }`}
                    >
                      <img src="/assets/svgs/normal-emoji.svg" alt="" />
                      <p className="text-input-button-color font-[500] font-inter">
                        Claim your domain before it&apos;s late!
                      </p>
                    </div>

                    <div
                      className={`transition-transform flex gap-x-1 justify-center items-center duration-300 ${
                        !errors.domain && domainValue && isAvailable && !loading
                          ? "-translate-y-full h-max animate-slide-down max-h-10 opacity-100"
                          : "-translate-y-full h-max max-h-0 opacity-0"
                      }`}
                    >
                      <img src="/assets/svgs/success-emoji.svg" alt="" />
                      <p className="text-center text-input-success-color font-[500] font-inter">
                        It&apos;s available, claim it now.
                      </p>
                    </div>

                    <div
                      className={`transition-transform flex gap-x-1 justify-center items-center duration-300 ${
                        (!!errors.domain && values.domain && !loading) ||
                        (!isAvailable && !loading && values.domain)
                          ? "translate-y-full h-max  animate-slide-up max-h-10 opacity-100"
                          : "translate-y-full h-max max-h-0 opacity-0"
                      }`}
                    >
                      <img src="/assets/svgs/error-emoji.svg" alt="" />
                      <p className="text-center hidden md:block text-input-error-color font-[500] font-inter">
                        Username is already taken. Your clone got here first!
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
                  isDisabled={
                    !(!errors.domain && domainValue && isAvailable && !loading)
                  }
                />
              </Form>
            )}
          </Formik>
        </div>
        <Text
          size={"p-xxsmall"}
          className="text-landing-description-text-color text-center mg:w-[60%] m-auto !text-[14px] mt-6 font-medium"
        >
          Already have an account?{" "}
          <Link href={"/login"}>
            <span className="text-df-orange-color underline cursor-pointer">
              Login
            </span>
          </Link>
        </Text>
      </Card>
    </div>
  );
}
