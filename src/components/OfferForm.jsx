import React, { useState } from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import {
  inputWrapperClass,
  textareaWrapperClass,
  inputInnerClass,
  textareaInnerClass,
  selectInnerClass,
  AiToolButton,
} from "./ai-tools/AiToolFormField";
import { cn } from "@/lib/utils";

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
    <div className="space-y-4">
      <div className="bg-white/60 p-1 rounded-full flex items-center border-2 border-border">
        <div
          className={`${
            currentTab == "manual"
              ? "bg-foreground text-background"
              : "bg-transparent text-muted-foreground"
          } font-medium py-2.5 px-4 rounded-full flex-1 text-center cursor-pointer transition-all duration-300 ease-in-out`}
          onClick={() => setCurrentTab("manual")}
        >
          Enter Details Manually
        </div>
        <div
          className={`${
            currentTab == "offer"
              ? "bg-foreground text-background"
              : "bg-transparent text-muted-foreground"
          } font-medium py-2.5 px-4 rounded-full flex-1 text-center cursor-pointer transition-all duration-300 ease-in-out`}
          onClick={() => setCurrentTab("offer")}
        >
          Upload Offer Letter
        </div>
      </div>
      <div className={currentTab === "manual" ? "block space-y-4" : "hidden"}>
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
            <Form id="EmailForm" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground ml-1">Current Salary<span className="text-[#FF553E] ml-0.5">*</span></Label>
                  <div className={cn(inputWrapperClass, errors.currentSalary && touched.currentSalary && "border-red-500")}>
                    <Field
                      name="currentSalary"
                      type="text"
                      placeholder="e.g. $75,000"
                      className={inputInnerClass}
                      autoComplete="off"
                    />
                  </div>
                  <ErrorMessage name="currentSalary" component="p" className="text-sm text-red-500 ml-1" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground ml-1">Offered Salary<span className="text-[#FF553E] ml-0.5">*</span></Label>
                  <div className={cn(inputWrapperClass, errors.offeredSalary && touched.offeredSalary && "border-red-500")}>
                    <Field
                      name="offeredSalary"
                      type="text"
                      placeholder="e.g. $75,000"
                      className={inputInnerClass}
                      autoComplete="off"
                    />
                  </div>
                  <ErrorMessage name="offeredSalary" component="p" className="text-sm text-red-500 ml-1" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground ml-1">Position Title</Label>
                  <div className={cn(inputWrapperClass, errors.position && touched.position && "border-red-500")}>
                    <Field name="position" type="text" placeholder="e.g. Senior Product Designer" className={inputInnerClass} autoComplete="off" />
                  </div>
                  <ErrorMessage name="position" component="p" className="text-sm text-red-500 ml-1" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground ml-1">Company</Label>
                  <div className={cn(inputWrapperClass, errors.company && touched.company && "border-red-500")}>
                    <Field name="company" type="text" placeholder="e.g. Tesla" className={inputInnerClass} autoComplete="off" />
                  </div>
                  <ErrorMessage name="company" component="p" className="text-sm text-red-500 ml-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground ml-1">Country</Label>
                <div className={cn(inputWrapperClass, errors.country && touched.country && "border-red-500")}>
                  <Field as="select" name="country" className={selectInnerClass}>
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
                <ErrorMessage name="country" component="p" className="text-sm text-red-500 ml-1" />
              </div>
              <AiToolButton disabled={isAnalyzing}>
                {isAnalyzing ? "Analyzing Offer..." : "Analyze Offer"}
              </AiToolButton>
            </Form>
          )}
        </Formik>
      </div>
      <div className={currentTab === "offer" ? "block space-y-4" : "hidden"}>
        <Formik
          initialValues={{ offerContent: "" }}
          validationSchema={OffervalidationSchema}
          onSubmit={(values) => onSubmit(values)}
        >
          {({ errors, touched }) => (
            <Form id="offerForm" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground ml-1">Paste Your Offer Letter</Label>
                <div className={cn(textareaWrapperClass, "min-h-[250px]", errors.offerContent && touched.offerContent && "border-red-500")}>
                  <Field
                    name="offerContent"
                    as="textarea"
                    placeholder="Copy and paste your offer letter content here. Our AI will analyze & extract relevant details"
                    className={cn(textareaInnerClass, "min-h-[250px]")}
                    autoComplete="off"
                  />
                </div>
                <ErrorMessage name="offerContent" component="p" className="text-sm text-red-500 ml-1" />
              </div>
              <AiToolButton disabled={isAnalyzing}>
                {isAnalyzing ? "Analyzing Offer..." : "Analyze Offer"}
              </AiToolButton>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
