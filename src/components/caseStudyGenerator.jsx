import React, { useEffect, useRef, useState } from "react";
import AiIcon from "../../public/assets/svgs/ai.svg";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import ProgressBar from "./ProgressBar";
import { _getCredits, _getProjectTypes } from "@/network/get-request";
import { _generateCaseStudy } from "@/network/post-request";
import { aiQuestions } from "@/lib/caseStudyQuestions";
import CustomRadioButton from "./customRadioButton";
import Info from "./info";
import { useGlobalContext } from "@/context/globalContext";

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
  const { userDetails } = useGlobalContext();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [cred, setCredits] = useState(0);
  const [questions, setQuestions] = useState([]);
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
        if (userDetails?._id) {
          await _getCredits(userDetails._id)
            .then((res) => {
              setCredits(res.data.usedToday);
            })
            .catch((err) => {
              console.log(err);
              setCredits(2);
            });
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userDetails?._id]);

  const handleStepOne = (values) => {
    const selectedQuestion = typeProjects.find(
      (item) => item.name == values.projectType
    );
    if (!selectedQuestion) return;
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

  const handleSubmit = async (values) => {
    setIsLoading(true);
    const selectedQuestion = typeProjects.find(
      (item) => item.name == values.projectType
    );
    if (!selectedQuestion) return;
    const csType = selectedQuestion.type;
    const data = {
      questionnare: questions
        .map((q, i) => q.question + "\n" + values[`answer${i + 1}`])
        .join("\n"),
      type: csType,
      userId: userDetails?._id,
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
    <div className="w-full">
      <div className="space-y-4">
        <header className="flex justify-between items-center">
          <h2 className="text-base font-semibold text-foreground">Generate Case Study</h2>
          <div className="flex gap-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => prev - 1)}
                disabled={isLoading || cred == 2}
                className="rounded-full border-2 border-foreground/20 bg-white/50 px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/10 disabled:opacity-50 transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              form="aiProjectForm"
              disabled={isLoading || cred == 2}
              className="rounded-full h-11 px-6 text-base font-semibold bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {step == 4 && isLoading ? "Generating..." : step == 4 ? "Generate Now" : "Next"}
              {step == 4 && <AiIcon className="text-background w-4 h-4" />}
            </button>
          </div>
        </header>
        <main>
          <div className="flex gap-2 mt-6">
            <ProgressBar progress={100} />
            <ProgressBar progress={step >= 2 && 100} />
            <ProgressBar progress={step >= 3 && 100} />
            <ProgressBar progress={step == 4 && 100} />
          </div>
          <div className="flex-1 overflow-y-auto py-6 relative">
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
                      <div className="space-y-4">
                        <p className="text-sm font-semibold text-foreground">
                          I want to create a project or write a case study on:
                        </p>
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
                    {step == 2 && questions.length > 0 && (
                      <div className="pb-10 space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-foreground">{questions[0]?.question}</p>
                          <div className={`bg-white dark:bg-white border-2 border-border rounded-2xl hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out overflow-hidden ${errors.answer1 && touched.answer1 ? "border-red-500" : ""}`}>
                            <Field
                              name="answer1"
                              as="textarea"
                              className="border-0 bg-transparent min-h-[100px] px-4 py-3 w-full focus:outline-none text-base text-foreground placeholder:text-muted-foreground/60 resize-none"
                              autoComplete="off"
                            />
                          </div>
                          <ErrorMessage name="answer1" component="p" className="text-sm text-red-500 ml-1" />
                          <p className="text-xs text-muted-foreground mt-2">✏️<b>Template: </b> {questions[0]?.template}</p>
                          <p className="text-sm font-semibold text-foreground mt-4">{questions[1]?.question}</p>
                          <div className={`bg-white dark:bg-white border-2 border-border rounded-2xl hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out overflow-hidden ${errors.answer2 && touched.answer2 ? "border-red-500" : ""}`}>
                            <Field
                              name="answer2"
                              as="textarea"
                              className="border-0 bg-transparent min-h-[100px] px-4 py-3 w-full focus:outline-none text-base text-foreground placeholder:text-muted-foreground/60 resize-none"
                              autoComplete="off"
                            />
                          </div>
                          <ErrorMessage name="answer2" component="p" className="text-sm text-red-500 ml-1" />
                          <p className="text-xs text-muted-foreground mt-2">✏️<b>Template: </b> {questions[1]?.template}</p>
                        </div>
                      </div>
                    )}

                    {step == 3 && questions.length > 0 && (
                      <div className="pb-10 space-y-4">
                        <p className="text-sm font-semibold text-foreground">{questions[2]?.question}</p>
                        <div className={`bg-white dark:bg-white border-2 border-border rounded-2xl hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out overflow-hidden ${errors.answer3 && touched.answer3 ? "border-red-500" : ""}`}>
                          <Field name="answer3" as="textarea" className="border-0 bg-transparent min-h-[100px] px-4 py-3 w-full focus:outline-none text-base text-foreground placeholder:text-muted-foreground/60 resize-none" autoComplete="off" />
                        </div>
                        <ErrorMessage name="answer3" component="p" className="text-sm text-red-500 ml-1" />
                        <p className="text-xs text-muted-foreground">✏️<b>Template: </b> {questions[2]?.template}</p>
                        <p className="text-sm font-semibold text-foreground mt-4">{questions[3]?.question}</p>
                        <div className={`bg-white dark:bg-white border-2 border-border rounded-2xl hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out overflow-hidden ${errors.answer4 && touched.answer4 ? "border-red-500" : ""}`}>
                          <Field name="answer4" as="textarea" className="border-0 bg-transparent min-h-[100px] px-4 py-3 w-full focus:outline-none text-base text-foreground placeholder:text-muted-foreground/60 resize-none" autoComplete="off" />
                        </div>
                        <ErrorMessage name="answer4" component="p" className="text-sm text-red-500 ml-1" />
                        <p className="text-xs text-muted-foreground">✏️<b>Template: </b> {questions[3]?.template}</p>
                      </div>
                    )}

                    {step == 4 && questions.length > 0 && (
                      <div className="pb-10 space-y-4">
                        <p className="text-sm font-semibold text-foreground">{questions[4]?.question}</p>
                        <div className={`bg-white dark:bg-white border-2 border-border rounded-2xl hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out overflow-hidden ${errors.answer5 && touched.answer5 ? "border-red-500" : ""}`}>
                          <Field name="answer5" as="textarea" className="border-0 bg-transparent min-h-[100px] px-4 py-3 w-full focus:outline-none text-base text-foreground placeholder:text-muted-foreground/60 resize-none" autoComplete="off" />
                        </div>
                        <ErrorMessage name="answer5" component="p" className="text-sm text-red-500 ml-1" />
                        <p className="text-xs text-muted-foreground">✏️<b>Template: </b> {questions[4]?.template}</p>
                        <p className="text-sm font-semibold text-foreground mt-4">{questions[5]?.question}</p>
                        <div className={`bg-white dark:bg-white border-2 border-border rounded-2xl hover:border-foreground/20 focus-within:border-foreground/30 focus-within:shadow-[0_0_0_4px_hsl(var(--foreground)/0.12)] transition-all duration-300 ease-out overflow-hidden ${errors.answer6 && touched.answer6 ? "border-red-500" : ""}`}>
                          <Field name="answer6" as="textarea" className="border-0 bg-transparent min-h-[100px] px-4 py-3 w-full focus:outline-none text-base text-foreground placeholder:text-muted-foreground/60 resize-none" autoComplete="off" />
                        </div>
                        <ErrorMessage name="answer6" component="p" className="text-sm text-red-500 ml-1" />
                        <p className="text-xs text-muted-foreground">✏️<b>Template: </b> {questions[5]?.template}</p>
                      </div>
                    )}
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
