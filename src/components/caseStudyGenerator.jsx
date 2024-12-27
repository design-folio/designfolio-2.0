import React, { useEffect, useRef, useState } from "react";
import Text from "./text";
import AiIcon from "../../public/assets/svgs/ai.svg";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Button from "./button";
import ProgressBar from "./ProgressBar";
import { _getCredits, _getProjectTypes } from "@/network/get-request";
import CustomRadioButton from "./customRadioButton";

const stepOneValidationSchema = Yup.object().shape({
  projectType: Yup.string().required("Answer is a required field."),
});

const stepTwoValidationSchema = Yup.object().shape({
  answer1: Yup.string()
    .min(25, "Answer is shorter than 25 characters.")
    .required("Answer is a required field."),
  answer2: Yup.string()
    .min(25, "Answer is shorter than 25 characters.")
    .required("Answer is a required field."),
});

const stepThreeValidationSchema = Yup.object().shape({
  answer3: Yup.string()
    .min(25, "Answer is shorter than 25 characters.")
    .required("Answer is a required field."),
  answer4: Yup.string()
    .min(25, "Answer is shorter than 25 characters.")
    .required("Answer is a required field."),
});

const stepFourValidationSchema = Yup.object().shape({
  answer5: Yup.string()
    .min(25, "Answer is shorter than 25 characters.")
    .required("Answer is a required field."),
  answer6: Yup.string()
    .min(25, "Answer is shorter than 25 characters.")
    .required("Answer is a required field."),
});

export default function CaseStudyGenerator() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [cred, setCredits] = useState(0);
  const formikRef = useRef(null);
  const [typeProjects, setTypeprojects] = useState([]);

  const getSchemaValidation = () => {
    switch (step) {
      case 1:
        return stepOneValidationSchema;
      case 2:
        return stepTwoValidationSchema;
      case 3:
        return stepThreeValidationSchema;
      case 4:
        return stepFourValidationSchema;
      default:
        return Yup.object(); // Default empty schema
    }
  };

  const fetchData = async () => {
    try {
      const response = await _getProjectTypes();
      if (response) {
        const projectTypes = response.data;
        setTypeprojects(projectTypes);
        await _getCredits(userDetails._id)
          .then((res) => {
            setCredits(res.data.usedToday);
          })
          .catch((err) => {
            console.log(err);
            setCredits(2);
          });
      }
    } catch (err) {
      console.log(err);
    } finally {
      // encountered an error
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStepOne = (values) => {
    const selectedQuestion = typeProjects.find(
      (item) => item.name == values.projectType
    );
    const csType = selectedQuestion.type;
    let quest =
      csType === "dev"
        ? aiQuestions.dev
        : csType === "design"
        ? aiQuestions.design
        : csType === "product"
        ? aiQuestions.product
        : aiQuestions.others;
    setQuestions(quest.data);
    setStep(2);
  };

  const handleSubmit = async (values, actions) => {
    setIsLoading(true);
    const selectedQuestion = typeProjects.find(
      (item) => item.name == values.projectType
    );
    const csType = selectedQuestion.type;
    const data = {
      questionnare: questions
        .map((q, i) => q.question + "\n" + values[`answer${i + 1}`])
        .join("\n"),
      type: csType,
      userId: userDetails._id,
    };
    try {
      const response = await _generateCaseStudy(data);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#E5E7EB] w-[800px]  rounded-2xl p-[24px]">
      <header className="flex justify-between items-center">
        <Text size="p-medium">Generate Case Study</Text>
        <div className="flex gap-4">
          {step > 1 && (
            <Button
              text={"Back"}
              type="secondary"
              onClick={() => setStep((prev) => prev - 1)}
              isDisabled={isLoading || cred == 2}
            />
          )}
          <Button
            btnType="submit"
            text={
              step == 4
                ? isLoading
                  ? "Generating..."
                  : "Generate Now"
                : "Next"
            }
            type="modal"
            form="aiProjectForm"
            isLoading={isLoading}
            isDisabled={cred == 2}
            icon={
              step == 4 && (
                <AiIcon className="text-modal-btn-text-color w-[22px] h-[22px] cursor-pointer" />
              )
            }
          />
        </div>
      </header>
      <main>
        <div className="flex gap-2 mt-6">
          <ProgressBar progress={100} />
          <ProgressBar progress={step >= 2 && 100} />
          <ProgressBar progress={step >= 3 && 100} />
          <ProgressBar progress={step == 4 && 100} />
        </div>
        <div className={`flex-1 overflow-y-auto p-8 relative `}>
          {cred == "2" && <Info className={"mb-4"} />}
          {/* This is the scrollable body */}
          <div className={`${(cred == "2" || isLoading) && "opacity-25"}`}>
            <Formik
              innerRef={formikRef}
              validationSchema={getSchemaValidation()}
              initialValues={{
                projectType: "",
                answer1: "",
                answer2: "",
                answer3: "",
                answer4: "",
                answer5: "",
                answer6: "",
              }}
              onSubmit={(values, actions, setTouched, validateForm) => {
                switch (step) {
                  case 1:
                    setIsLoading(false);
                    handleStepOne(values, actions);
                    break;
                  case 2:
                    setIsLoading(false);
                    setStep(3);
                    break;
                  case 3:
                    setStep(4);
                    setIsLoading(false);
                    break;
                  case 4:
                    handleSubmit(values, actions);
                    break;

                  default:
                    break;
                }
                formikRef.current.validateForm();
                formikRef.current.setTouched({});
              }}
            >
              {({ setFieldValue, values, errors, touched, isValid }) => (
                <Form id="aiProjectForm" disabled={isLoading}>
                  {step == 1 && (
                    <div>
                      <Text size="p-small" className="font-semiBold mb-6">
                        I want to create a project or write a case study on:
                      </Text>
                      <div className="flex flex-col gap-4 mb-2">
                        {typeProjects?.map((res) => (
                          <Field
                            key={res?.name}
                            name="projectType"
                            value={res?.name}
                            component={CustomRadioButton}
                            label={res?.name}
                            selected={values.projectType === res?.name}
                            disabled={cred == 2}
                          />
                        ))}
                      </div>
                      <ErrorMessage
                        name="projectType"
                        component="div"
                        className="error-message text-[14px]"
                      />
                    </div>
                  )}
                  {step == 2 && (
                    <div className="pb-10">
                      <Text size="p-small" className="font-semiBold mb-2">
                        {questions[0].question}
                      </Text>
                      <Field
                        name="answer1"
                        as="textarea"
                        className={`text-input mt-2 min-h-[120px] border-b ${
                          errors.answer1 &&
                          touched.answer1 &&
                          "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                        autoComplete="off"
                      />
                      <ErrorMessage
                        name="answer1"
                        component="div"
                        className="error-message text-[14px]"
                      />
                      <Text
                        size="p-xxxsmall"
                        className="text-df-tip-color mt-3"
                      >
                        ✏️<b>Template: </b> {questions[0].template}
                      </Text>
                      <Text size="p-small" className="font-semiBold mb-2 mt-4">
                        {questions[1].question}
                      </Text>
                      <Field
                        name="answer2"
                        as="textarea"
                        className={`text-input mt-2 min-h-[120px] border-b ${
                          errors.answer2 &&
                          touched.answer2 &&
                          "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                        autoComplete="off"
                      />
                      <ErrorMessage
                        name="answer2"
                        component="div"
                        className="error-message text-[14px]"
                      />
                      <Text
                        size="p-xxxsmall"
                        className="text-df-tip-color mt-3"
                      >
                        ✏️<b>Template: </b> {questions[1].template}
                      </Text>
                    </div>
                  )}

                  {step == 3 && (
                    <div className="pb-10">
                      <Text size="p-small" className="font-semiBold mb-2">
                        {questions[2].question}
                      </Text>
                      <Field
                        name="answer3"
                        as="textarea"
                        className={`text-input mt-2 min-h-[120px] border-b ${
                          errors.answer3 &&
                          touched.answer3 &&
                          "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                        autoComplete="off"
                      />
                      <ErrorMessage
                        name="answer3"
                        component="div"
                        className="error-message text-[14px]"
                      />
                      <Text
                        size="p-xxxsmall"
                        className="text-df-tip-color mt-3"
                      >
                        ✏️<b>Template: </b>
                        {questions[2].template}
                      </Text>
                      <Text size="p-small" className="font-semiBold mb-2 mt-4">
                        {questions[3].question}
                      </Text>
                      <Field
                        name="answer4"
                        as="textarea"
                        className={`text-input mt-2 min-h-[120px] border-b ${
                          errors.answer4 &&
                          touched.answer4 &&
                          "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                        autoComplete="off"
                      />
                      <ErrorMessage
                        name="answer4"
                        component="div"
                        className="error-message text-[14px]"
                      />
                      <Text
                        size="p-xxxsmall"
                        className="text-df-tip-color mt-3"
                      >
                        ✏️<b>Template: </b>
                        {questions[3].template}
                      </Text>
                    </div>
                  )}

                  {step == 4 && (
                    <div className="pb-10">
                      <Text size="p-small" className="font-semiBold mb-2">
                        {questions[4].question}
                      </Text>
                      <Field
                        name="answer5"
                        as="textarea"
                        className={`text-input mt-2 min-h-[120px] border-b ${
                          errors.answer5 &&
                          touched.answer5 &&
                          "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                        autoComplete="off"
                      />
                      <ErrorMessage
                        name="answer5"
                        component="div"
                        className="error-message text-[14px]"
                      />
                      <Text
                        size="p-xxxsmall"
                        className="text-df-tip-color mt-3"
                      >
                        ✏️<b>Template: </b>
                        {questions[4].template}
                      </Text>
                      <Text size="p-small" className="font-semiBold mb-2 mt-4">
                        {questions[5].question}
                      </Text>
                      <Field
                        name="answer6"
                        as="textarea"
                        className={`text-input mt-2 min-h-[120px] border-b ${
                          errors.answer6 &&
                          touched.answer6 &&
                          "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                        }`}
                        autoComplete="off"
                      />
                      <ErrorMessage
                        name="answer6"
                        component="div"
                        className="error-message text-[14px]"
                      />
                      <Text
                        size="p-xxxsmall"
                        className="text-df-tip-color mt-3"
                      >
                        ✏️<b>Template: </b>
                        {questions[5].template}
                      </Text>
                    </div>
                  )}
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </main>
    </div>
  );
}
