import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useGlobalContext } from "@/context/globalContext";
import { _getUserQuota, _getProjectTypes } from "@/network/get-request";
import { aiQuestions } from "@/lib/caseStudyQuestions";
import { _generateCaseStudy, _updateUser } from "@/network/post-request";
import { convertEditorJSToTiptap } from "@/lib/editorjsToTiptap";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { cn } from "@/lib/utils";
import { Sparkles, Coins } from "lucide-react";

const stepOneValidationSchema = Yup.object().shape({
  projectType: Yup.string().required("Please select a project type."),
});

const stepTwoValidationSchema = Yup.object().shape({
  answer1: Yup.string()
    .min(25, "Answer is shorter than 25 characters.")
    .required("Answer is required."),
  answer2: Yup.string()
    .min(25, "Answer is shorter than 25 characters.")
    .required("Answer is required."),
});

const stepThreeValidationSchema = Yup.object().shape({
  answer3: Yup.string()
    .min(25, "Answer is shorter than 25 characters.")
    .required("Answer is required."),
  answer4: Yup.string()
    .min(25, "Answer is shorter than 25 characters.")
    .required("Answer is required."),
});

const stepFourValidationSchema = Yup.object().shape({
  answer5: Yup.string()
    .min(25, "Answer is shorter than 25 characters.")
    .required("Answer is required."),
  answer6: Yup.string()
    .min(25, "Answer is shorter than 25 characters.")
    .required("Answer is required."),
});

export default function CreateAiProject({ openModal }) {
  const [typeProjects, setTypeprojects] = useState([]);
  const [generationCredits, setGenerationCredits] = useState({ limit: 2, used: 0, remaining: 2 });
  const {
    userDetails,
    updateCache,
    setShowUpgradeModal,
    setUpgradeModalSource,
    invalidateAiWritingCredits,
  } = useGlobalContext();
  const [step, setStep] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const formikRef = useRef(null);
  const router = useRouter();

  const creditsLeft = generationCredits.remaining;

  useEffect(() => {
    _getProjectTypes()
      .then((res) => {
        if (res) setTypeprojects(res.data);
      })
      .catch(() => {});
    _getUserQuota()
      .then((res) => {
        const gen = res.data?.quota?.caseStudyGeneration;
        if (gen) {
          const remaining = gen.limit === null ? Infinity : Math.max(0, gen.limit - gen.used);
          if (remaining <= 0) {
            openModal(null);
            setUpgradeModalSource("write-ai");
            setShowUpgradeModal(true);
            return;
          }
          setGenerationCredits({ ...gen, remaining });
        }
      })
      .catch(() => setGenerationCredits({ limit: 2, used: 2, remaining: 0 }));
  }, [openModal, setShowUpgradeModal, setUpgradeModalSource]);

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
        return Yup.object();
    }
  };

  const handleStepOne = (values) => {
    const selected = typeProjects.find((item) => item.name === values.projectType);
    const csType = selected.type;
    const quest =
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
    const selected = typeProjects.find((item) => item.name === values.projectType);
    const data = {
      questionnare: questions
        .map((q, i) => q.question + "\n" + values[`answer${i + 1}`])
        .join("\n"),
      type: selected.type,
      userId: userDetails._id,
    };
    try {
      const response = await _generateCaseStudy(data);
      if (response) {
        const tiptapContent = convertEditorJSToTiptap({
          time: `${Date.now()}`,
          version: "2.30.6",
          blocks: response.data.blocks,
        });
        const payload = {
          projects: [
            ...userDetails?.projects,
            {
              protected: false,
              password: "",
              description: response.data.description,
              title: response.data.title,
              heroView: "immersive",
              contentVersion: 2,
              tiptapContent,
            },
          ],
        };
        const res = await _updateUser(payload);
        const project = res?.data?.user?.projects?.find((p) => p.title === response.data.title);
        updateCache("userDetails", res?.data?.user);
        toast.success("Project created successfully");
        invalidateAiWritingCredits();
        router.push(`/project/${project._id}/editor`);
        openModal(null);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="bg-card border-border m-auto flex h-[95%] w-[95%] flex-col overflow-hidden rounded-2xl border shadow-xl md:fixed md:top-[2.5%] md:right-4 md:w-[560px]"
      initial={{ x: "100%" }}
      animate={{ x: "0%" }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      {/* Header */}
      <div className="border-border flex shrink-0 items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/[0.05] dark:bg-white/[0.05]">
            <Sparkles className="text-foreground h-4 w-4" />
          </div>
          <span className="text-foreground text-[15px] font-semibold">Write using AI</span>
        </div>
        <div className="border-border flex h-8 items-center gap-1.5 rounded-full border bg-black/[0.04] px-3 dark:bg-white/[0.04]">
          <Coins className="text-foreground/50 h-3.5 w-3.5" />
          <span className="text-foreground/70 text-[13px] font-medium">
            {creditsLeft === Infinity ? "∞" : creditsLeft} credit{creditsLeft !== 1 ? "s" : ""} left
          </span>
        </div>
      </div>

      {/* Step progress */}
      <div className="flex shrink-0 gap-1.5 px-6 pt-4">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              step >= s ? "bg-foreground" : "bg-border"
            )}
          />
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
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
                handleStepOne(values, actions);
                break;
              case 2:
                setStep(3);
                break;
              case 3:
                setStep(4);
                break;
              case 4:
                handleSubmit(values, actions);
                break;
            }
            formikRef.current?.validateForm();
            formikRef.current?.setTouched({});
          }}
        >
          {({ setFieldValue, values, errors, touched }) => (
            <Form id="aiProjectForm" className="space-y-5">
              {/* Step 1 — Project type */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-foreground text-[14px] font-medium">
                    I want to create a project or write a case study on:
                  </p>
                  <RadioGroup
                    value={values.projectType}
                    onValueChange={(val) => setFieldValue("projectType", val)}
                    className="gap-3"
                  >
                    {typeProjects.map((res) => (
                      <label
                        key={res.name}
                        htmlFor={`type-${res.name}`}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 transition-all",
                          values.projectType === res.name
                            ? "border-foreground/30 bg-black/[0.04] dark:bg-white/[0.04]"
                            : "border-border bg-black/[0.02] hover:bg-black/[0.04] dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                        )}
                      >
                        <RadioGroupItem
                          id={`type-${res.name}`}
                          value={res.name}
                          className="shrink-0"
                        />
                        <span className="text-foreground text-[14px] font-medium">{res.name}</span>
                      </label>
                    ))}
                  </RadioGroup>
                  <ErrorMessage name="projectType" component="p" className="error-message" />
                </div>
              )}

              {/* Steps 2–4 — Questions */}
              {step >= 2 && questions.length > 0 && (
                <div className="space-y-6">
                  {[
                    [0, 1],
                    [2, 3],
                    [4, 5],
                  ][step - 2].map((qIndex) => {
                    const answerKey = `answer${qIndex + 1}`;
                    const q = questions[qIndex];
                    return (
                      <div key={qIndex} className="space-y-1.5">
                        <Label className="text-foreground ml-1 text-[13px] font-medium">
                          {q.question}
                        </Label>
                        <Textarea
                          name={answerKey}
                          rows={4}
                          autoComplete="off"
                          placeholder="Write your answer here…"
                          value={values[answerKey]}
                          onChange={(e) => setFieldValue(answerKey, e.target.value)}
                          className={cn(
                            "resize-none",
                            errors[answerKey] &&
                              touched[answerKey] &&
                              "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                        <ErrorMessage name={answerKey} component="p" className="error-message" />
                        {q.template && (
                          <p className="text-muted-foreground mt-1 ml-1 text-[12px]">
                            ✏️ <span className="font-medium">Template:</span> {q.template}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>

      {/* Footer */}
      <div className="border-border bg-card flex shrink-0 items-center justify-between gap-2 border-t px-6 py-4">
        <Button
          variant="outline"
          type="button"
          onClick={() => openModal(null)}
          disabled={isLoading}
        >
          Discard
        </Button>
        <div className="flex gap-2">
          {step > 1 && (
            <Button
              variant="outline"
              type="button"
              onClick={() => setStep((p) => p - 1)}
              disabled={isLoading}
            >
              Back
            </Button>
          )}
          <Button type="submit" form="aiProjectForm" disabled={isLoading}>
            {step === 4 ? (
              <>
                {isLoading ? (
                  "Generating…"
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-4 w-4" />
                    Generate Now
                  </>
                )}
              </>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
