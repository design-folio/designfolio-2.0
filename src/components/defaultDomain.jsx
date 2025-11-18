import React, { useCallback, useState } from "react";
import * as Yup from "yup";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { _checkUsername, _updateUsername } from "@/network/post-request";
import { toast } from "react-toastify";
import { useGlobalContext } from "@/context/globalContext";
import Button from "./button";
import { Badge } from "./ui/badge";
import { formatTimestamp } from "@/lib/times";
import { Clock } from "lucide-react";

// Yup validation schema
const DomainValidationSchema = Yup.object().shape({
  domain: Yup.string()
    .matches(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})?$/,
      "Invalid subdomain"
    )
    .required("Username is required"),
});

export default function DefaultDomain() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [domainValue, setDomainValue] = useState("");
  const { userDetails, setUserDetails } = useGlobalContext();

  const handleClaim = () => {
    _updateUsername({ username: domainValue }).then(() => {
      setUserDetails((prev) => ({ ...prev, username: domainValue }));
      toast.success("Username has been updated.");
    });
  };

  const debounce = (func, delay) => {
    let inDebounce;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(inDebounce);
      inDebounce = setTimeout(() => func.apply(context, args), delay);
    };
  };

  // API call function
  const checkUsername = (value) => {
    if (value.length != 0) {
      _checkUsername({ username: value })
        .then((response) => {
          setIsAvailable(response?.data?.available ?? false);
        })
        .catch((error) => {
          // Handle error
          console.error(error);
        });
    }
  };

  // Debounced API call
  const debouncedCheckUsername = useCallback(debounce(checkUsername, 200), []);

  // Formik handleChange function with API call
  const handleChange = (e, setFieldValue) => {
    const { value, name } = e.target;
    setFieldValue(name, value);
    setDomainValue(value);
    debouncedCheckUsername(value);
  };

  const formatedValue = formatTimestamp(userDetails?.latestPublishDate);

  if (!userDetails?.username) {
    return <></>;
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <p className="text-[20px] text-df-section-card-heading-color font-[500] font-inter ">
          Base domain
        </p>
        <Badge
          variant=""
          className={"text-[#15803D] bg-[#DCFCE7] gap-1 items-center"}
        >
          <svg
            width="9"
            height="8"
            viewBox="0 0 9 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="4.5" cy="4" r="4" fill="#22C55E" />
          </svg>
          Connected
        </Badge>
      </div>
      <p className="text-[#4d545f] dark:text-[#B4B8C6] text-[12.8px] font-[400] leading-[22.4px] font-inter mt-2">
        This is your current Designfolio link. You can change your username
        anytime (if it's available).
      </p>
      <Formik
        initialValues={{ domain: userDetails?.username ?? "" }}
        validationSchema={DomainValidationSchema}
        onSubmit={(values, actions) => {
          // Handle form submission

          if (values.domain != 0) {
            handleClaim();
            actions.setSubmitting(false);
          }
        }}
      >
        {({
          isSubmitting,
          isValid,
          setFieldValue,
          values,
          errors,
          touched,
        }) => (
          <Form
            id={"usernameForm"}
            className="w-full mt-[24px] flex flex-col lg:flex-row items-center gap-6"
          >
            <div className="flex-1 flex flex-col xl:flex-row items-end  gap-4  w-full">
              <div className="w-full">
                <div className="relative">
                  <Field
                    type="text"
                    name="domain"
                    placeholder="Your-name"
                    autoComplete="off"
                    className={`text-input ${((!!errors.domain && values.domain) ||
                        (!isAvailable && values.domain)) &&
                      "!text-df-error"
                      }`}
                    onChange={(e) => handleChange(e, setFieldValue)}
                  />
                  <div className="bg-[#F4F6FA] dark:bg-[#4d545f] p-3 rounded-full absolute top-[3.5px] right-[3.5px] flex items-center gap-2">
                    <div className="font-inter font-semibold text-base leading-normal text-[#202937] dark:text-[#E9EAEB]">
                      designfolio.me
                    </div>
                    <div className="flex justify-center items-center gap-[10px]">
                      {domainValue &&
                        values?.domain !== userDetails?.username && (
                          <>
                            {isAvailable ? (
                              <img
                                src="/assets/svgs/checkbox.svg"
                                className="w-[18px] h-[18px]"
                                alt="designfolio logo"
                              />
                            ) : (
                              <img
                                src="/assets/svgs/no.svg"
                                className="w-[18px] h-[18px]"
                                alt="designfolio logo"
                              />
                            )}
                          </>
                        )}
                    </div>
                  </div>
                </div>
                <ErrorMessage
                  name="domain"
                  component="div"
                  className="error-message text-[14px] absolute"
                />
              </div>
            </div>
            <div className="flex justify-end w-full lg:w-fit">
              <Button
                text={"Change username"}
                form={"usernameForm"}
                isLoading={isSubmitting}
                isDisabled={
                  isSubmitting ||
                  !isValid ||
                  values?.domain == userDetails?.username
                }
                btnType="submit"
                customClass="w-full lg:w-fit"
              />
            </div>
          </Form>
        )}
      </Formik>

      <div className="lg:flex items-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#22C55E]"></div>
          <p className=" font-inter font-medium text-sm text-[#4d545f] dark:text-[#B4B8C6]">
            Published & optimized
          </p>
        </div>

        <div className="flex items-center gap-2 mt-2 lg:mt-0">
          <Clock className="w-4 h-4 text-[#4d545f] dark:text-[#B4B8C6]" />
          <p className="font-inter font-medium text-sm text-[#4d545f] dark:text-[#B4B8C6]">
            Updated {formatedValue}
          </p>
        </div>
      </div>
    </div>
  );
}
