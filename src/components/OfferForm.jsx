import React, { useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Text from "./text";
import Button from "./button";

const validationSchema = Yup.object().shape({
  currentSalary: Yup.string().required("Current salary is required"),
  offeredSalary: Yup.string().required("Offered salary is required"),
});

const OffervalidationSchema = Yup.object().shape({
  offerContent: Yup.string().required("Offer content salary is required"),
});
export default function OfferForm({ onSubmit, isAnalyzing }) {
  const [currentTab, setCurrentTab] = useState("manual");

  return (
    <div>
      <div className="bg-[#F2F2F0] p-1 rounded-lg flex items-center">
        <div
          className={`${
            currentTab == "manual"
              ? "border text-[#202937] bg-white border-[#DBDBD6]"
              : "bg-transparent text-[#81817D]"
          } font-medium p-4 rounded-lg w-1/2 text-center cursor-pointer transition-all duration-300 ease-in-out`}
          onClick={() => setCurrentTab("manual")}
        >
          Enter Details Manually
        </div>
        <div
          className={`${
            currentTab == "offer"
              ? "border text-[#202937] bg-white border-[#DBDBD6]"
              : "bg-transparent text-[#81817D]"
          } font-medium p-4 rounded-lg w-1/2 text-center cursor-pointer transition-all duration-300 ease-in-out`}
          onClick={() => setCurrentTab("offer")}
        >
          Upload Offer Letter
        </div>
      </div>
      {/* Add content for tabs with smooth transitions */}
      <div className="mt-4">
        <div
          className={`${
            currentTab === "manual" ? "block" : "hidden"
          } transition-all duration-300 ease-in-out`}
        >
          <Formik
            initialValues={{
              currentSalary: "",
              offeredSalary: "",
              position: "",
              company: "",
              country: "United States",
            }}
            validationSchema={validationSchema}
            onSubmit={(values, actions) => {
              console.log(values);
              onSubmit(values);
            }}
          >
            {({ errors, touched, values }) => (
              <Form id="EmailForm">
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Text
                        size={"p-xxsmall"}
                        className="font-medium mt-4"
                        required
                      >
                        Current Salary
                      </Text>
                      <Field
                        name="currentSalary"
                        type="text"
                        placeholder="e.g. $75,000"
                        className={`text-input mt-2  ${
                          errors.currentSalary &&
                          touched.currentSalary &&
                          "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                        autoComplete="off"
                      />
                      <ErrorMessage
                        name="currentSalary"
                        component="div"
                        className="error-message"
                      />
                    </div>
                    <div>
                      <Text
                        size={"p-xxsmall"}
                        className="font-medium mt-4"
                        required
                      >
                        Offered Salary
                      </Text>
                      <Field
                        name="offeredSalary"
                        type="text"
                        placeholder="e.g. $75,000"
                        className={`text-input mt-2  ${
                          errors.offeredSalary &&
                          touched.offeredSalary &&
                          "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                        autoComplete="off"
                      />
                      <ErrorMessage
                        name="offeredSalary"
                        component="div"
                        className="error-message"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Text size={"p-xxsmall"} className="font-medium mt-4">
                        Position Title
                      </Text>
                      <Field
                        name="position"
                        type="text"
                        placeholder="e.g. Senior Product Designer"
                        className={`text-input mt-2  ${
                          errors.position &&
                          touched.position &&
                          "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                        autoComplete="off"
                      />
                      <ErrorMessage
                        name="position"
                        component="div"
                        className="error-message"
                      />
                    </div>
                    <div>
                      <Text size={"p-xxsmall"} className="font-medium mt-4">
                        Company
                      </Text>
                      <Field
                        name="company"
                        type="text"
                        placeholder="e.g. Tesla"
                        className={`text-input mt-2  ${
                          errors.company &&
                          touched.company &&
                          "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                        autoComplete="off"
                      />
                      <ErrorMessage
                        name="company"
                        component="div"
                        className="error-message"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 mt-4">
                    <div>
                      <Text size={"p-xxsmall"} className="font-medium">
                        Country
                      </Text>
                      <Field
                        as="select"
                        name="country"
                        className={`text-input !w-full text-[14px]  font-inter !font-[500] custom-select mt-2  ${
                          errors.country &&
                          touched.country &&
                          "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                      >
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="India">India</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Japan">Japan</option>
                        <option value="Other">Other</option>
                      </Field>
                      <ErrorMessage
                        name="emailType"
                        component="div"
                        className="error-message"
                      />
                    </div>
                    <Button
                      btnType="submit"
                      text={
                        isAnalyzing ? "Analyzing Offer..." : "Analyze Offer"
                      }
                      form="EmailForm"
                      customClass="mt-4 w-full"
                      isLoading={isAnalyzing}
                    />
                  </div>
                </>
              </Form>
            )}
          </Formik>
        </div>
        <div
          className={`${
            currentTab === "offer" ? "block" : "hidden"
          } transition-all duration-300 ease-in-out`}
        >
          {/* Content for 'Upload Offer Letter' */}
          <div className="mt-8">
            <Formik
              initialValues={{
                offerContent: "",
              }}
              validationSchema={OffervalidationSchema}
              onSubmit={(values, actions) => {
                onSubmit(values);
              }}
            >
              {({ errors, touched, values }) => (
                <Form id="offerForm">
                  <Text size={"p-xxsmall"} className="font-medium mt-4">
                    Paste Your Offer Letter
                  </Text>
                  <Field
                    name="offerContent"
                    type="text"
                    as="textarea"
                    placeholder="Copy and paste your offer letter content here. Our AI will analyze & extract relevant details"
                    className={`text-input mt-2 min-h-[250px]  ${
                      errors.offerContent &&
                      touched.offerContent &&
                      "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                    }`}
                    autoComplete="off"
                  />
                  <ErrorMessage
                    name="offerContent"
                    component="div"
                    className="error-message"
                  />
                  <Button
                    btnType="submit"
                    text={isAnalyzing ? "Analyzing Offer..." : "Analyze Offer"}
                    form="offerForm"
                    customClass="mt-4 w-full"
                    isLoading={isAnalyzing}
                  />
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </div>
  );
}
