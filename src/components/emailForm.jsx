import React from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  inputWrapperClass,
  textareaWrapperClass,
  inputInnerClass,
  textareaInnerClass,
  selectInnerClass,
} from "./ai-tools/AiToolFormField";
import { Send } from "lucide-react";
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

export default function EmailForm({ generateEmailContent, isGenerating, disableGenerate = false }) {
  return (
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
        <Form id="EmailForm" className="contents">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-type" className="text-sm font-medium text-foreground ml-1">Email Type*</Label>
              <div className={cn(inputWrapperClass, errors.emailType && touched.emailType && "border-red-500")}>
                <Field as="select" id="email-type" name="emailType" className={selectInnerClass}>
                  <option value="follow-up">Interview Follow-up</option>
                  <option value="thank-you">Thank You</option>
                  <option value="technical-interview">Technical Interview Follow-up</option>
                  <option value="second-round">Second Round Interview Follow-up</option>
                  <option value="hr-round">HR Round Follow-up</option>
                  <option value="offer-acceptance">Offer Acceptance</option>
                  <option value="custom">Custom</option>
                </Field>
              </div>
              <ErrorMessage name="emailType" component="p" className="text-sm text-red-500 ml-1" />
            </div>

            {values?.emailType === "custom" && (
              <div className="space-y-2">
                <Label htmlFor="custom-email-type" className="text-sm font-medium text-foreground ml-1">Custom Email Type*</Label>
                <div className={cn(inputWrapperClass, errors.customEmailType && touched.customEmailType && "border-red-500")}>
                  <Field id="custom-email-type" name="customEmailType" type="text" placeholder="Enter custom Email Type" className={inputInnerClass} autoComplete="off" />
                </div>
                <ErrorMessage name="customEmailType" component="p" className="text-sm text-red-500 ml-1" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="company-name" className="text-sm font-medium text-foreground ml-1">Company Name*</Label>
              <div className={cn(inputWrapperClass, errors.company && touched.company && "border-red-500")}>
                <Field id="company-name" name="company" type="text" placeholder="Enter company name" className={inputInnerClass} autoComplete="off" />
              </div>
              <ErrorMessage name="company" component="p" className="text-sm text-red-500 ml-1" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position" className="text-sm font-medium text-foreground ml-1">Position*</Label>
              <div className={cn(inputWrapperClass, errors.position && touched.position && "border-red-500")}>
                <Field id="position" name="position" type="text" placeholder="Enter position title" className={inputInnerClass} autoComplete="off" />
              </div>
              <ErrorMessage name="position" component="p" className="text-sm text-red-500 ml-1" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interviewer-name" className="text-sm font-medium text-foreground ml-1">Interviewer Name*</Label>
              <div className={cn(inputWrapperClass, errors.interviewer && touched.interviewer && "border-red-500")}>
                <Field id="interviewer-name" name="interviewer" type="text" placeholder="Enter interviewer's name" className={inputInnerClass} autoComplete="off" />
              </div>
              <ErrorMessage name="interviewer" component="p" className="text-sm text-red-500 ml-1" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="your-name" className="text-sm font-medium text-foreground ml-1">Your Name*</Label>
              <div className={cn(inputWrapperClass, errors.name && touched.name && "border-red-500")}>
                <Field id="your-name" name="name" type="text" placeholder="Enter your name" className={inputInnerClass} autoComplete="off" />
              </div>
              <ErrorMessage name="name" component="p" className="text-sm text-red-500 ml-1" />
            </div>
          </div>

          <div className="flex flex-col h-full">
            <div className="space-y-2 flex-1 flex flex-col">
              <Label htmlFor="context" className="text-sm font-medium text-foreground ml-1">Additional Context</Label>
              <div className={cn(textareaWrapperClass, "flex-1")}>
                <Field
                  id="context"
                  as="textarea"
                  name="additionalContext"
                  placeholder="Add any additional context or specific points you'd like to include"
                  className={cn(textareaInnerClass, "h-full min-h-[200px]")}
                  autoComplete="off"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isGenerating || disableGenerate}
              className="w-full mt-6 rounded-full h-12 px-6 text-base font-semibold gap-2 bg-foreground text-background hover:bg-foreground/90 border-0"
            >
              {disableGenerate ? "Sign up to generate again" : isGenerating ? "Generating..." : "Generate Email"}
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
