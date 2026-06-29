import React, { useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { inputWrapperClass, inputInnerClass, selectInnerClass } from "./ai-tools/AiToolFormField";
import OfferLetterUploader from "./OfferLetterUploader";
import { cn } from "@/lib/utils";

const validationSchema = Yup.object().shape({
  currentSalary: Yup.string().required("Current salary is required"),
  offeredSalary: Yup.string().required("Offered salary is required"),
});

const OfferValidationSchema = Yup.object().shape({
  offerContent: Yup.string()
    .required("Please upload your offer letter (PDF)")
    .min(50, "Offer letter text is too short. Try a different PDF."),
});

export default function OfferForm({ onSubmit, isAnalyzing, guestUsageLimitReached = false }) {
  const [currentTab, setCurrentTab] = useState("manual");

  return (
    <div className="space-y-4">
      <div className="border-border flex items-center rounded-full border-2 bg-white/60 p-1">
        <div
          className={`${
            currentTab === "manual"
              ? "bg-foreground text-background"
              : "text-muted-foreground bg-transparent"
          } flex-1 cursor-pointer rounded-full px-4 py-2.5 text-center font-medium transition-all duration-300 ease-in-out`}
          onClick={() => setCurrentTab("manual")}
        >
          Enter Details Manually
        </div>
        <div
          className={`${
            currentTab === "offer"
              ? "bg-foreground text-background"
              : "text-muted-foreground bg-transparent"
          } flex-1 cursor-pointer rounded-full px-4 py-2.5 text-center font-medium transition-all duration-300 ease-in-out`}
          onClick={() => setCurrentTab("offer")}
        >
          Upload Offer Letter
        </div>
      </div>
      {currentTab === "manual" ? (
        <div className="space-y-4">
          <Formik
            initialValues={{
              currentSalary: "",
              offeredSalary: "",
              position: "",
              company: "",
              country: "United States",
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => onSubmit(values)}
          >
            {({ errors, touched }) => (
              <Form id="OfferManualForm" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="current-salary"
                      className="text-foreground ml-1 text-sm font-medium"
                    >
                      Current Salary*
                    </Label>
                    <div
                      className={cn(
                        inputWrapperClass,
                        errors.currentSalary && touched.currentSalary && "border-red-500"
                      )}
                    >
                      <Field
                        id="current-salary"
                        name="currentSalary"
                        type="text"
                        placeholder="e.g. $75,000"
                        className={inputInnerClass}
                        autoComplete="off"
                      />
                    </div>
                    <ErrorMessage
                      name="currentSalary"
                      component="p"
                      className="ml-1 text-sm text-red-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="offered-salary"
                      className="text-foreground ml-1 text-sm font-medium"
                    >
                      Offered Salary*
                    </Label>
                    <div
                      className={cn(
                        inputWrapperClass,
                        errors.offeredSalary && touched.offeredSalary && "border-red-500"
                      )}
                    >
                      <Field
                        id="offered-salary"
                        name="offeredSalary"
                        type="text"
                        placeholder="e.g. $75,000"
                        className={inputInnerClass}
                        autoComplete="off"
                      />
                    </div>
                    <ErrorMessage
                      name="offeredSalary"
                      component="p"
                      className="ml-1 text-sm text-red-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="position-title"
                      className="text-foreground ml-1 text-sm font-medium"
                    >
                      Position Title
                    </Label>
                    <div
                      className={cn(
                        inputWrapperClass,
                        errors.position && touched.position && "border-red-500"
                      )}
                    >
                      <Field
                        id="position-title"
                        name="position"
                        type="text"
                        placeholder="e.g. Senior Product Designer"
                        className={inputInnerClass}
                        autoComplete="off"
                      />
                    </div>
                    <ErrorMessage
                      name="position"
                      component="p"
                      className="ml-1 text-sm text-red-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-foreground ml-1 text-sm font-medium">
                      Company
                    </Label>
                    <div
                      className={cn(
                        inputWrapperClass,
                        errors.company && touched.company && "border-red-500"
                      )}
                    >
                      <Field
                        id="company"
                        name="company"
                        type="text"
                        placeholder="e.g. Tesla"
                        className={inputInnerClass}
                        autoComplete="off"
                      />
                    </div>
                    <ErrorMessage
                      name="company"
                      component="p"
                      className="ml-1 text-sm text-red-500"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country" className="text-foreground ml-1 text-sm font-medium">
                    Country
                  </Label>
                  <div
                    className={cn(
                      inputWrapperClass,
                      errors.country && touched.country && "border-red-500"
                    )}
                  >
                    <Field id="country" as="select" name="country" className={selectInnerClass}>
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
                  </div>
                  <ErrorMessage
                    name="country"
                    component="p"
                    className="ml-1 text-sm text-red-500"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isAnalyzing || guestUsageLimitReached}
                  className="mt-2 h-12 w-full rounded-full border-0 bg-[#1A1F2C] px-6 text-base font-semibold text-white hover:bg-[#1A1F2C]/90"
                >
                  {guestUsageLimitReached
                    ? "Sign up to analyze again"
                    : isAnalyzing
                      ? "Analyzing Offer..."
                      : "Analyze Offer"}
                </Button>
              </Form>
            )}
          </Formik>
        </div>
      ) : (
        <div className="space-y-4">
          <Formik
            initialValues={{ offerContent: "" }}
            validationSchema={OfferValidationSchema}
            onSubmit={(values) => onSubmit(values)}
          >
            {({ setFieldValue }) => (
              <Form id="offerForm" className="space-y-4">
                <OfferLetterUploader
                  onUpload={(text) => setFieldValue("offerContent", text)}
                  disabled={isAnalyzing || guestUsageLimitReached}
                />
                <ErrorMessage
                  name="offerContent"
                  component="p"
                  className="ml-1 text-sm text-red-500"
                />
                <Button
                  type="submit"
                  disabled={isAnalyzing || guestUsageLimitReached}
                  className="h-12 w-full rounded-full border-0 bg-[#1A1F2C] px-6 text-base font-semibold text-white hover:bg-[#1A1F2C]/90"
                >
                  {guestUsageLimitReached
                    ? "Sign up to analyze again"
                    : isAnalyzing
                      ? "Analyzing Offer..."
                      : "Analyze Offer"}
                </Button>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </div>
  );
}
