import {
  careerGoals,
  experienceLevels,
  roles,
  skillsTemplate,
  toneOptions,
} from "@/lib/formOptions";
import { generateLinkedInStrategy } from "@/lib/gemini";
import StrategyDisplay from "@/components/StrategyDisplay";
import { ErrorMessage, Field, Form, Formik } from "formik";
import React, { useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import Text from "./text";
import Button from "./button";

export const linkedInFormSchema = Yup.object().shape({
  name: Yup.string(),
  role: Yup.string().required("Please select your role"),
  customRole: Yup.string().when("role", {
    is: "custom",
    then: (schema) => schema.required("Please specify your role"),
  }),
  careerGoals: Yup.string().required("Please select your career goals"),
  customCareerGoal: Yup.string().when("careerGoals", {
    is: "custom",
    then: (schema) => schema.required("Please specify your career goal"),
  }),
  experienceLevel: Yup.string().required("Please select your experience level"),
  skills: Yup.string().required("Please enter your skills"),
  toneOfVoice: Yup.string().required("Please select your preferred tone"),
});

export default function LinkedInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [showForm, setShowForm] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  const initialValues = {
    name: "",
    role: roles[0],
    customRole: "",
    careerGoals: careerGoals[0],
    customCareerGoal: "",
    experienceLevel: "",
    skills: skillsTemplate,
    toneOfVoice: "Casual",
  };

  const getTargetAudience = (goal) => {
    switch (goal.toLowerCase()) {
      case "help me get hired":
        return "recruiters and hiring managers";
      case "share my expertise with others":
        return "industry professionals and peers";
      case "find new clients for my business":
        return "potential clients and customers";
      case "connect with people in my field":
        return "industry professionals and peers";
      case "custom":
        return goal;
      default:
        return "industry professionals";
    }
  };

  const handleSubmit = async (values) => {
    setIsLoading(true);

    const submissionData = {
      ...values,
      role: values.role === "Custom" ? values.customRole : values.role,
      careerGoals:
        values.careerGoals === "Custom"
          ? values.customCareerGoal
          : values.careerGoals,
      targetAudience: getTargetAudience(
        values.careerGoals === "Custom"
          ? values.customCareerGoal
          : values.careerGoals
      ),
    };

    try {
      const result = await generateLinkedInStrategy(submissionData);
      setStrategy(result);
      setShowForm(false);
      toast.success("Strategy generated successfully!");
    } catch (error) {
      console.error("Error generating strategy:", error);
      toast.error("Failed to generate strategy. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setShowForm(true);
    setStrategy(null);
    setCurrentStep(1);
  };

  if (!showForm && strategy) {
    return <StrategyDisplay strategy={strategy} onRestart={handleRestart} />;
  }

  return (
    <div className="space-y-8">
      <Formik
        initialValues={initialValues}
        validationSchema={linkedInFormSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, values }) => (
          <div className=" mb-6">
            {currentStep === 1 ? (
              <Form id="EmailForm">
                <Text size={"p-xxsmall"} className="font-medium" required>
                  What's your current role?
                </Text>
                <Field
                  as="select"
                  name="role"
                  className={`text-input !w-full text-[14px]  font-inter !font-[500] custom-select mt-2  ${
                    errors.role &&
                    touched.role &&
                    "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                  }`}
                  value={values.role}
                >
                  {roles.map((role) => (
                    <option value={role}>{role}</option>
                  ))}
                </Field>
                <ErrorMessage
                  name="role"
                  component="div"
                  className="error-message"
                />
                {values.role.toLowerCase() === "custom" && (
                  <>
                    <Text
                      size={"p-xxsmall"}
                      className="font-medium mt-4"
                      required
                    >
                      Tell us more about your role
                    </Text>
                    <Field
                      name="customRole"
                      type="text"
                      placeholder="Enter custom Email Type"
                      className={`text-input mt-2  ${
                        errors.customRole &&
                        touched.customRole &&
                        "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                      }`}
                      autoComplete="off"
                    />
                    <ErrorMessage
                      name="customRole"
                      component="div"
                      className="error-message"
                    />
                  </>
                )}

                <Text size={"p-xxsmall"} className="font-medium mt-2 " required>
                  What do you want to achieve with your LinkedIn profile?
                </Text>
                <Field
                  as="select"
                  name="careerGoals"
                  className={`text-input !w-full text-[14px]  font-inter !font-[500] custom-select mt-2  ${
                    errors.careerGoals &&
                    touched.careerGoals &&
                    "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                  }`}
                  value={values.careerGoals}
                >
                  {careerGoals.map((role) => (
                    <option value={role}>{role}</option>
                  ))}
                </Field>
                <ErrorMessage
                  name="careerGoals"
                  component="div"
                  className="error-message"
                />

                {values.careerGoals.toLowerCase() === "custom" && (
                  <>
                    <Text
                      size={"p-xxsmall"}
                      className="font-medium mt-4"
                      required
                    >
                      Tell us more about your role
                    </Text>
                    <Field
                      name="customCareerGoal"
                      type="text"
                      placeholder="Select your career goals"
                      className={`text-input mt-2  ${
                        errors.customCareerGoal &&
                        touched.customCareerGoal &&
                        "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                      }`}
                      autoComplete="off"
                    />
                    <ErrorMessage
                      name="customCareerGoal"
                      component="div"
                      className="error-message"
                    />
                  </>
                )}

                <Button
                  // btnType="submit"
                  onClick={() => setCurrentStep(2)}
                  text={isLoading ? "Generating..." : "Generate Email"}
                  form="EmailForm"
                  customClass="mt-4 w-full"
                  isLoading={isLoading}
                />
              </Form>
            ) : (
              <>
                <Form id="EmailForm">
                  <Text size={"p-xxsmall"} className="font-medium" required>
                    Experience Level
                  </Text>
                  <Field
                    as="select"
                    name="experienceLevel"
                    className={`text-input !w-full text-[14px]  font-inter !font-[500] custom-select mt-2  ${
                      errors.experienceLevel &&
                      touched.experienceLevel &&
                      "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                    }`}
                  >
                    {experienceLevels.map((role) => (
                      <option value={role}>{role}</option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="experienceLevel"
                    component="div"
                    className="error-message"
                  />

                  <Text
                    size={"p-xxsmall"}
                    className="font-medium mt-2"
                    required
                  >
                    Special Skills/Achievements
                  </Text>
                  <Field
                    name="skills"
                    as="textarea"
                    type="text"
                    placeholder="Enter custom Email Type"
                    className={`text-input mt-2  ${
                      errors.skills &&
                      touched.skills &&
                      "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                    }`}
                    autoComplete="off"
                    value={values.skills}
                  />
                  <ErrorMessage
                    name="skills"
                    component="div"
                    className="error-message"
                  />

                  <Text
                    size={"p-xxsmall"}
                    className="font-medium mt-2"
                    required
                  >
                    Tone of Voice
                  </Text>
                  <Field
                    as="select"
                    name="toneOfVoice"
                    className={`text-input !w-full text-[14px]  font-inter !font-[500] custom-select mt-2  ${
                      errors.toneOfVoice &&
                      touched.toneOfVoice &&
                      "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                    }`}
                  >
                    {toneOptions.map((role) => (
                      <option value={role}>{role}</option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="toneOfVoice"
                    component="div"
                    className="error-message"
                  />
                  <div className="flex space-x-4">
                    <Button
                      btnType="submit"
                      text={isLoading ? "Generating..." : "Generate Email"}
                      form="EmailForm"
                      customClass="mt-4 w-full"
                      isLoading={isLoading}
                    />
                  </div>
                </Form>
              </>
            )}
          </div>
        )}
      </Formik>
    </div>
  );
}
