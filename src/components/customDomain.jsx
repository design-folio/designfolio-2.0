import { useGlobalContext } from "@/context/globalContext";
import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useState } from "react";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Button from "./button";
import { addDomain } from "@/network/post-request";

const DomainValidationSchema = Yup.object().shape({
  domain: Yup.string()
    .matches(
      /^(?=.{1,253}$)((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,}$/,
      "Invalid domain"
    )
    .required("Domain is required"),
});

export default function CustomDomain() {
  const { userDetails, setUserDetails } = useGlobalContext();

  // Formik handleChange function with API call
  const handleChange = (e, setFieldValue) => {
    const { value, name } = e.target;
    setFieldValue(name, value);
  };
  return (
    <div>
      <p className="text-[20px] text-df-section-card-heading-color font-[500] font-inter ">
        Custom domain
      </p>
      <p className="text-[#4d545f] dark:text-[#B4B8C6] text-[12.8px] font-[400] leading-[22.4px] font-inter mt-2">
        Connect a custom domain purchased through web hosting service
      </p>
      <Formik
        initialValues={{ domain: userDetails?.username ?? "" }}
        validationSchema={DomainValidationSchema}
        onSubmit={(values, actions) => {
          // Handle form submission
          if (values.domain != 0) {
            actions.setSubmitting(false);
            console.log(values.domain);
            addDomain({ customDomain: values.domain }).then((res) =>
              console.log(res)
            );
          }
        }}
      >
        {({ isSubmitting, isValid, setFieldValue, values, errors }) => (
          <Form
            id={"domainForm"}
            className=" w-full mt-[24px] flex items-center gap-6"
          >
            <div className="w-full flex-1">
              <div className="relative">
                <Field
                  type="text"
                  name="domain"
                  placeholder="www.site.com"
                  autoComplete="off"
                  className={`text-input`}
                  onChange={(e) => handleChange(e, setFieldValue)}
                />
              </div>
              <ErrorMessage
                name="domain"
                component="div"
                className="error-message text-[14px] absolute"
              />
            </div>
            <div className="flex justify-end">
              <Button
                text={"update domain"}
                form={"domainForm"}
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
