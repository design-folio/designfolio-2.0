import React from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import {
  inputWrapperClass,
  textareaWrapperClass,
  inputInnerClass,
  textareaInnerClass,
  selectInnerClass,
} from "./ai-tools/AiToolFormField";
import { cn } from "@/lib/utils";

const validationSchema = Yup.object().shape({
  emailType: Yup.string().required("Email type is required"),
  customEmailType: Yup.string().when("emailType", {
    is: (emailType) => emailType === "custom",
    then: (schema) => schema.required("Custom email type is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  company: Yup.string().required("Company is required"),
  position: Yup.string().required("Position title is required"),
  interviewer: Yup.string().required("Interviewer name is required"),
  name: Yup.string().required("Your name is required"),
});

export default function EmailForm({ generateEmailContent, isGenerating }) {
  return (
    <div className="space-y-4">
      <Formik
        initialValues={{
          emailType: "follow-up",
          customEmailType: "",
          company: "",
          position: "",
          interviewer: "",
          name: "",
          additionalContext: "",
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => generateEmailContent(values)}
      >
        {({ errors, touched, values }) => (
          <Form id="EmailForm" className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground ml-1">
                Email Type<span className="text-[#FF553E] ml-0.5">*</span>
              </Label>
              <div
                className={cn(
                  inputWrapperClass,
                  errors.emailType &&
                    touched.emailType &&
                    "border-red-500 focus-within:border-red-500"
                )}
              >
                <Field
                  as="select"
                  name="emailType"
                  className={selectInnerClass}
                >
                  <option value="follow-up">Interview Follow-up</option>
                  <option value="thank-you">Thank You</option>
                  <option value="technical-interview">
                    Technical Interview Follow-up
                  </option>
                  <option value="second-round">
                    Second Round Interview Follow-up
                  </option>
                  <option value="hr-round">HR Round Follow-up</option>
                  <option value="offer-acceptance">Offer Acceptance</option>
                  <option value="custom">Custom</option>
                </Field>
              </div>
              <ErrorMessage name="emailType" component="p" className="text-sm text-red-500 ml-1" />
            </div>

            {values?.emailType == "custom" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground ml-1">
                  Custom Email Type<span className="text-[#FF553E] ml-0.5">*</span>
                </Label>
                <div
                  className={cn(
                    inputWrapperClass,
                    errors.customEmailType &&
                      touched.customEmailType &&
                      "border-red-500 focus-within:border-red-500"
                  )}
                >
                  <Field
                    name="customEmailType"
                    type="text"
                    placeholder="Enter custom Email Type"
                    className={inputInnerClass}
                    autoComplete="off"
                  />
                </div>
                <ErrorMessage name="customEmailType" component="p" className="text-sm text-red-500 ml-1" />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground ml-1">
                Company Name<span className="text-[#FF553E] ml-0.5">*</span>
              </Label>
              <div
                className={cn(
                  inputWrapperClass,
                  errors.company &&
                    touched.company &&
                    "border-red-500 focus-within:border-red-500"
                )}
              >
                <Field
                  name="company"
                  type="text"
                  placeholder="Enter company name"
                  className={inputInnerClass}
                  autoComplete="off"
                />
              </div>
              <ErrorMessage name="company" component="p" className="text-sm text-red-500 ml-1" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground ml-1">
                Position<span className="text-[#FF553E] ml-0.5">*</span>
              </Label>
              <div
                className={cn(
                  inputWrapperClass,
                  errors.position &&
                    touched.position &&
                    "border-red-500 focus-within:border-red-500"
                )}
              >
                <Field
                  name="position"
                  type="text"
                  placeholder="Enter position title"
                  className={inputInnerClass}
                  autoComplete="off"
                />
              </div>
              <ErrorMessage name="position" component="p" className="text-sm text-red-500 ml-1" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground ml-1">
                Interviewer Name<span className="text-[#FF553E] ml-0.5">*</span>
              </Label>
              <div
                className={cn(
                  inputWrapperClass,
                  errors.interviewer &&
                    touched.interviewer &&
                    "border-red-500 focus-within:border-red-500"
                )}
              >
                <Field
                  name="interviewer"
                  type="text"
                  placeholder="Enter interviewer's name"
                  className={inputInnerClass}
                  autoComplete="off"
                />
              </div>
              <ErrorMessage name="interviewer" component="p" className="text-sm text-red-500 ml-1" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground ml-1">
                Your Name<span className="text-[#FF553E] ml-0.5">*</span>
              </Label>
              <div
                className={cn(
                  inputWrapperClass,
                  errors.name &&
                    touched.name &&
                    "border-red-500 focus-within:border-red-500"
                )}
              >
                <Field
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  className={inputInnerClass}
                  autoComplete="off"
                />
              </div>
              <ErrorMessage name="name" component="p" className="text-sm text-red-500 ml-1" />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground ml-1">
                Additional Context
              </Label>
              <div className={textareaWrapperClass}>
                <Field
                  as="textarea"
                  name="additionalContext"
                  placeholder="Add any additional context or specific points you'd like to include"
                  className={cn(textareaInnerClass, "min-h-[200px]")}
                  autoComplete="off"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-foreground text-background hover:bg-foreground/90 focus-visible:outline-none border-0 rounded-full h-12 px-6 text-base font-semibold transition-colors gap-2 flex items-center justify-center disabled:opacity-50"
            >
              {isGenerating ? "Generating..." : "Generate Email"}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
