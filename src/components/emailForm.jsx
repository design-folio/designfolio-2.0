import React from "react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Text from "./text";
import Button from "./button";

const validationSchema = Yup.object().shape({
  emailType: Yup.string().required("Email type is required"),
  customEmailType: Yup.string().when("emailType", {
    is: (emailType) => emailType === "custom", // If emailType is 'custom'
    then: (schema) => schema.required("Custom email type is required"), // Make customEmailType required
    otherwise: (schema) => schema.notRequired(), // Otherwise, it's not required
  }),
  company: Yup.string().required("Company is required"),
  position: Yup.string().required("Position title is required"),
  interviewer: Yup.string().required("Interviewer name is required"),
  name: Yup.string().required("Your name is required"),
});

export default function EmailForm({ generateEmailContent, isGenerating }) {
  return (
    <div>
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
        onSubmit={(values, actions) => {
          console.log(values);
          generateEmailContent(values);
        }}
      >
        {({ errors, touched, values }) => (
          <Form id="EmailForm">
            <Text size={"p-xxsmall"} className="font-medium" required>
              Email Type
            </Text>
            <Field
              as="select"
              name="emailType"
              className={`text-input !w-full text-[14px]  font-inter !font-[500] custom-select mt-2  ${
                errors.emailType &&
                touched.emailType &&
                "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
              }`}
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
            <ErrorMessage
              name="emailType"
              component="div"
              className="error-message"
            />

            {values?.emailType == "custom" && (
              <>
                <Text size={"p-xxsmall"} className="font-medium mt-4" required>
                  Custom Email Type
                </Text>
                <Field
                  name="customEmailType"
                  type="text"
                  placeholder="Enter custom Email Type"
                  className={`text-input mt-2  ${
                    errors.customEmailType &&
                    touched.customEmailType &&
                    "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                  }`}
                  autoComplete="off"
                />
                <ErrorMessage
                  name="customEmailType"
                  component="div"
                  className="error-message"
                />
              </>
            )}
            <>
              <Text size={"p-xxsmall"} className="font-medium mt-4" required>
                Company Name
              </Text>
              <Field
                name="company"
                type="text"
                placeholder="Enter company name"
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
            </>
            <>
              <Text size={"p-xxsmall"} className="font-medium mt-4" required>
                Position
              </Text>
              <Field
                name="position"
                type="text"
                placeholder="Enter position title"
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
            </>
            <>
              <Text size={"p-xxsmall"} className="font-medium mt-4" required>
                Interviewer Name
              </Text>
              <Field
                name="interviewer"
                type="text"
                placeholder="Enter interviewer's name"
                className={`text-input mt-2  ${
                  errors.interviewer &&
                  touched.interviewer &&
                  "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                }`}
                autoComplete="off"
              />
              <ErrorMessage
                name="interviewer"
                component="div"
                className="error-message"
              />
            </>
            <>
              <Text size={"p-xxsmall"} className="font-medium mt-4" required>
                Your Name
              </Text>
              <Field
                name="name"
                type="text"
                placeholder="Enter your name"
                className={`text-input mt-2  ${
                  errors.name &&
                  touched.name &&
                  "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                }`}
                autoComplete="off"
              />
              <ErrorMessage
                name="name"
                component="div"
                className="error-message"
              />
            </>
            <>
              <Text size={"p-xxsmall"} className="font-medium mt-4">
                Additional Context
              </Text>
              <Field
                as="textarea"
                name="additionalContext"
                type="text"
                placeholder="Add any additional context or specific points you'd like to include"
                className={`text-input mt-2 min-h-[150px]  ${
                  errors.additionalContext &&
                  touched.additionalContext &&
                  "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                }`}
                autoComplete="off"
              />
              <ErrorMessage
                name="additionalContext"
                component="div"
                className="error-message"
              />
            </>

            <Button
              btnType="submit"
              text={isGenerating ? "Generating..." : "Generate Email"}
              form="EmailForm"
              customClass="mt-4 w-full"
              isLoading={isGenerating}
            />
          </Form>
        )}
      </Formik>
    </div>
  );
}
