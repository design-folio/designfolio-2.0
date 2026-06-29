import { _checkUsername } from "@/network/post-request";
import { Field, Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Button from "./button";
import * as Yup from "yup";
import { useDebouncedCallback } from "use-debounce";

const DomainValidationSchema = Yup.object().shape({
  domain: Yup.string()
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})?$/, "Invalid subdomain")
    .required("Domain is required"),
});
export default function ClaimDomain({ form = "default", className = "", onClaimWebsite }) {
  const [isAvailable, setIsAvailable] = useState(false);
  const router = useRouter();
  const [domainValue, setDomainValue] = useState("");
  const [loading, setLoding] = useState(false);

  useEffect(() => {
    router.prefetch("/signup");
  }, [router]);

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
    <div>
      <Formik
        validateOnChange={true}
        validateOnBlur={true}
        initialValues={{ domain: "" }}
        validationSchema={DomainValidationSchema}
        onSubmit={(values, actions) => {
          if (onClaimWebsite) {
            onClaimWebsite(values);
          } else {
            handleClaim();
          }
        }}
      >
        {({ setFieldValue, setFieldError, setFieldTouched, errors, values }) => (
          <Form id={form} className={`m-auto w-full md:pr-5 xl:w-[836px] ${className}`}>
            <div className="m-auto flex flex-col items-end justify-center gap-4 md:max-w-[848px] md:flex-row">
              <div className="w-full md:w-[432px]">
                <div className="relative">
                  <Field
                    type="text"
                    name="domain"
                    placeholder="Enter your name"
                    autoComplete="off"
                    className={`text-input !rounded-[16px] ${
                      loading ? "!pr-[182px]" : "!pr-[158px]"
                    } !py-[19.2px] placeholder-[#9CA3AF] xl:!py-[18.8px] ${
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
                    onChange={(e) => handleChange(e, setFieldValue, setFieldError, setFieldTouched)}
                  />
                  <div className="absolute top-[4px] right-[4px] flex items-center justify-center gap-[10px] lg:top-[3px]">
                    <span
                      className="text-input-button-color font-inter flex items-center gap-2 rounded-xl p-[14px] text-[17px] font-[500] transition-all"
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
              <Button
                text="Start Building — it’s free"
                type="tertiary"
                form={form}
                btnType="submit"
                customClass="w-full md:w-fit md:py-[18px]"
                isDisabled={!(!errors.domain && domainValue && isAvailable && !loading)}
              />
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
          </Form>
        )}
      </Formik>
    </div>
  );
}
