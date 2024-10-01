import React, { useCallback, useState } from "react";
import * as Yup from "yup";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { _checkUsername, _updateUsername } from "@/network/post-request";
import { toast } from "react-toastify";
import { useGlobalContext } from "@/context/globalContext";
import Button from "./button";

// Yup validation schema
const DomainValidationSchema = Yup.object().shape({
  domain: Yup.string()
    .matches(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})?$/,
      "Invalid subdomain"
    )
    .required("Username is required"),
});

export default function ChangeUsername() {
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
  if (!userDetails?.username) {
    return <></>;
  }
  return (
    <div>
      <p className="text-[20px] text-df-section-card-heading-color font-[500] font-inter ">
        Change username
      </p>

      <p className="text-[#4d545f] dark:text-[#B4B8C6] text-[12.8px] font-[400] leading-[22.4px] font-inter mt-2">
        You can change your username to another username that is not currently
        in use. Designfolio cannot set up redirects for links to your {""}
        <span className="text-[#FF553E]">DesignFolio profile</span> that
        includes your old username.
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
          <Form id={"usernameForm"} className=" w-full mt-[24px]">
            <div className="flex flex-col xl:flex-row items-end  gap-4  m-auto">
              <div className="w-full">
                <div className="relative">
                  <Field
                    type="text"
                    name="domain"
                    placeholder="Your-name"
                    autoComplete="off"
                    className={`text-input ${
                      ((!!errors.domain && values.domain) ||
                        (!isAvailable && values.domain)) &&
                      "!text-df-error"
                    }`}
                    onChange={(e) => handleChange(e, setFieldValue)}
                  />
                  <div className="flex justify-center items-center gap-[10px] absolute top-[18px] right-[20px]">
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
                <ErrorMessage
                  name="domain"
                  component="div"
                  className="error-message text-[14px] absolute"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                text={"Change username"}
                form={"usernameForm"}
                customClass="mt-6"
                isLoading={isSubmitting}
                isDisabled={
                  isSubmitting ||
                  !isValid ||
                  values?.domain == userDetails?.username
                }
                btnType="submit"
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
