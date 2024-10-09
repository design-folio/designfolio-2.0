import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import AiIcon from "../../public/assets/svgs/ai.svg";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Text from "./text";
import Button from "./button";
import ProgressBar from "./ProgressBar";
import CustomRadioButton from "./customRadioButton";
import { useGlobalContext } from "@/context/globalContext";
import { _getCredits, _getProjectTypes } from "@/network/get-request";
import { aiQuestions } from "@/lib/caseStudyQuestions";
import { _generateCaseStudy, _updateUser } from "@/network/post-request";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Info from "./info";
const stepOneValidationSchema = Yup.object().shape({
  projectType: Yup.string().required("Answer is a required field."),
});

const stepTwoValidationSchema = Yup.object().shape({
  answer1: Yup.string()
    .min(100, "Answer is shorter than 100 characters.")
    .required("Answer is a required field."),
  answer2: Yup.string()
    .min(100, "Answer is shorter than 100 characters.")
    .required("Answer is a required field."),
});

const stepThreeValidationSchema = Yup.object().shape({
  answer3: Yup.string()
    .min(100, "Answer is shorter than 100 characters.")
    .required("Answer is a required field."),
  answer4: Yup.string()
    .min(100, "Answer is shorter than 100 characters.")
    .required("Answer is a required field."),
});

const stepFourValidationSchema = Yup.object().shape({
  answer5: Yup.string()
    .min(100, "Answer is shorter than 100 characters.")
    .required("Answer is a required field."),
  answer6: Yup.string()
    .min(100, "Answer is shorter than 100 characters.")
    .required("Answer is a required field."),
});

const variants = {
  hidden: { x: "100%" },
  visible: { x: "0%" },
};
export default function CreateAiProject({ openModal }) {
  const [typeProjects, setTypeprojects] = useState([]);
  const [cred, setCredits] = useState(0);
  const { userDetails, updateCache } = useGlobalContext();
  const [showCredits, setShowCredits] = useState(false);
  const [step, setStep] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const formikRef = useRef(null);
  const router = useRouter();

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
    }
  };

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
      console.log(response);
      if (response) {
        const payload = {
          projects: [
            ...userDetails?.projects,
            {
              protected: false,
              password: "",
              description: response.data.description,
              title: response.data.title,
              content: {
                time: `${Date.now()}`,
                version: "2.30.6",
                blocks: response.data.blocks,
              },
            },
          ],
        };
        await _updateUser(payload)
          .then((res) => {
            console.log(
              res?.data?.user?.projects?.find(
                (project) => project.title === response.data.title
              )
            );
            const project = res?.data?.user?.projects?.find(
              (project) => project.title === response.data.title
            );
            updateCache("userDetails", res?.data?.user);
            toast.success("Project created successfully");
            router.push(`/project/${project._id}/editor`);
            setIsLoading(false);
            openModal(null);
          })
          .catch((err) => actions.setSubmitting(false));
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="bg-modal-bg-color h-[95%] w-[95%] m-auto md:w-[602px] md:fixed md:top-[2.25%] md:right-4 flex flex-col rounded-2xl"
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <header className="p-8 text-lg font-bold pb-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-4 items-center">
            <Button
              type="ai"
              icon={
                <AiIcon className="text-secondary-btn-text-color w-[22px] h-[22px]" />
              }
              style={{ background: "var(--ai-btn-bg-color)" }}
            />
            <Text size="p-small" className="font-semibold font-inter">
              Write using AI
            </Text>
          </div>
          <div
            onMouseEnter={() => setShowCredits(true)}
            onMouseLeave={() => setShowCredits(false)}
          >
            <Button
              type="ai"
              text={`${2 - cred} Credits`}
              size="small"
              style={{ background: "var(--ai-btn-bg-color)" }}
            />
          </div>
          <div
            className={`pt-5 origin-top-right absolute z-20 right-[25px] top-[70px] transition-all will-change-transform translateZ(0) duration-120 ease-in-out ${
              showCredits
                ? "opacity-100 scale-100"
                : "opacity-0 scale-90 pointer-events-none"
            }`}
          >
            <div className=" w-[310px] rounded-xl shadow-lg bg-popover-bg-color border-4 border-solid border-popover-border-color">
              <div className="p-4">
                <Text size="p-xxxsmall" className="text-credit-text-color">
                  Your credit balance
                </Text>
                <div className="flex gap-2 items-center mt-2">
                  <Text
                    size="p-small"
                    className="font-semibold text-df-base-text-color"
                  >
                    {`${2 - cred}`}
                  </Text>
                </div>
                <Text size="p-xxsmall" className="mt-2 text-credit-text-color">
                  You can use 2 AI-generated case studies per day.
                </Text>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <ProgressBar progress={100} />
          <ProgressBar progress={step >= 2 && 100} />
          <ProgressBar progress={step >= 3 && 100} />
          <ProgressBar progress={step == 4 && 100} />
        </div>
      </header>
      <div className={`flex-1 overflow-y-auto p-8 relative `}>
        {cred == "2" && <Info className={"mb-4"} />}
        {/* This is the scrollable body */}
        <div
          style={{ height: "200px" }}
          className={`${cred == "2" && "opacity-25"}`}
        >
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
            onSubmit={(values, actions) => {
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
            }}
          >
            {({ setFieldValue, values, errors, touched, isValid }) => (
              <Form id="aiProjectForm">
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
                    <Text size="p-xxxsmall" className="text-df-tip-color mt-3">
                      ✏️Template: {questions[0].template}
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
                    <Text size="p-xxxsmall" className="text-df-tip-color mt-3">
                      ✏️{questions[1].template}
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
                    <Text size="p-xxxsmall" className="text-df-tip-color mt-3">
                      ✏️{questions[2].template}
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
                    <Text size="p-xxxsmall" className="text-df-tip-color mt-3">
                      ✏️{questions[3].template}
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
                    <Text size="p-xxxsmall" className="text-df-tip-color mt-3">
                      ✏️{questions[4].template}
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
                    <Text size="p-xxxsmall" className="text-df-tip-color mt-3">
                      ✏️{questions[5].template}
                    </Text>
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <footer className="bg-modal-footer-bg-color py-4 px-8 rounded-b-2xl">
        <div className="flex justify-between gap-2">
          <Button
            text={"Discard"}
            type="secondary"
            onClick={() => openModal(null)}
          />
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
                  <AiIcon className="text-modal-btn-text-color w-[22px] h-[22px]" />
                )
              }
            />
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
