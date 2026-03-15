import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import AiIcon from "../../public/assets/svgs/ai.svg";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useGlobalContext } from "@/context/globalContext";
import { _getCredits, _getProjectTypes } from "@/network/get-request";
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
import Info from "./info";

const stepOneValidationSchema = Yup.object().shape({
  projectType: Yup.string().required("Please select a project type."),
});

const stepTwoValidationSchema = Yup.object().shape({
  answer1: Yup.string().min(25, "Answer is shorter than 25 characters.").required("Answer is required."),
  answer2: Yup.string().min(25, "Answer is shorter than 25 characters.").required("Answer is required."),
});

const stepThreeValidationSchema = Yup.object().shape({
  answer3: Yup.string().min(25, "Answer is shorter than 25 characters.").required("Answer is required."),
  answer4: Yup.string().min(25, "Answer is shorter than 25 characters.").required("Answer is required."),
});

const stepFourValidationSchema = Yup.object().shape({
  answer5: Yup.string().min(25, "Answer is shorter than 25 characters.").required("Answer is required."),
  answer6: Yup.string().min(25, "Answer is shorter than 25 characters.").required("Answer is required."),
});

export default function CreateAiProject({ openModal }) {
  const [typeProjects, setTypeprojects] = useState([]);
  const [cred, setCredits] = useState(0);
  const { userDetails, updateCache } = useGlobalContext();
  const [step, setStep] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const formikRef = useRef(null);
  const router = useRouter();

  const creditsLeft = 2 - cred;
  const outOfCredits = cred >= 2;

  useEffect(() => {
    _getProjectTypes()
      .then((res) => {
        if (res) setTypeprojects(res.data);
      })
      .catch(() => {});
    _getCredits(userDetails._id)
      .then((res) => setCredits(res.data.usedToday))
      .catch(() => setCredits(2));
  }, []);

  const getSchemaValidation = () => {
    switch (step) {
      case 1: return stepOneValidationSchema;
      case 2: return stepTwoValidationSchema;
      case 3: return stepThreeValidationSchema;
      case 4: return stepFourValidationSchema;
      default: return Yup.object();
    }
  };

  const handleStepOne = (values) => {
    const selected = typeProjects.find((item) => item.name === values.projectType);
    const csType = selected.type;
    const quest =
      csType === "dev" ? aiQuestions.dev :
      csType === "design" ? aiQuestions.design :
      csType === "product" ? aiQuestions.product :
      aiQuestions.others;
    setQuestions(quest.data);
    setStep(2);
  };

  const handleSubmit = async (values, actions) => {
    setIsLoading(true);
    const selected = typeProjects.find((item) => item.name === values.projectType);
    const data = {
      questionnare: questions.map((q, i) => q.question + "\n" + values[`answer${i + 1}`]).join("\n"),
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
              contentVersion: 2,
              tiptapContent,
            },
          ],
        };
        const res = await _updateUser(payload);
        const project = res?.data?.user?.projects?.find((p) => p.title === response.data.title);
        updateCache("userDetails", res?.data?.user);
        toast.success("Project created successfully");
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
      className="bg-card h-[95%] w-[95%] m-auto md:w-[560px] md:fixed md:top-[2.5%] md:right-4 flex flex-col rounded-2xl border border-border shadow-xl overflow-hidden"
      initial={{ x: "100%" }}
      animate={{ x: "0%" }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black/[0.05] dark:bg-white/[0.05] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-foreground" />
          </div>
          <span className="text-[15px] font-semibold text-foreground">Write using AI</span>
        </div>
        <div className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-black/[0.04] dark:bg-white/[0.04] border border-border">
          <Coins className="w-3.5 h-3.5 text-foreground/50" />
          <span className="text-[13px] font-medium text-foreground/70">
            {creditsLeft} credit{creditsLeft !== 1 ? "s" : ""} left
          </span>
        </div>
      </div>

      {/* Step progress */}
      <div className="flex gap-1.5 px-6 pt-4 flex-shrink-0">
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
        {outOfCredits && <Info className="mb-5" />}

        <Formik
          innerRef={formikRef}
          validationSchema={getSchemaValidation()}
          initialValues={{ projectType: "", answer1: "", answer2: "", answer3: "", answer4: "", answer5: "", answer6: "" }}
          onSubmit={(values, actions) => {
            switch (step) {
              case 1: handleStepOne(values, actions); break;
              case 2: setStep(3); break;
              case 3: setStep(4); break;
              case 4: handleSubmit(values, actions); break;
            }
            formikRef.current?.validateForm();
            formikRef.current?.setTouched({});
          }}
        >
          {({ setFieldValue, values, errors, touched }) => (
            <Form id="aiProjectForm" className={cn("space-y-5", outOfCredits && "opacity-30 pointer-events-none")}>
              {/* Step 1 — Project type */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-[14px] font-medium text-foreground">
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
                          "flex items-center gap-3 px-4 py-3.5 rounded-xl border cursor-pointer transition-all",
                          values.projectType === res.name
                            ? "border-foreground/30 bg-black/[0.04] dark:bg-white/[0.04]"
                            : "border-border bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                        )}
                      >
                        <RadioGroupItem
                          id={`type-${res.name}`}
                          value={res.name}
                          className="shrink-0"
                        />
                        <span className="text-[14px] font-medium text-foreground">{res.name}</span>
                      </label>
                    ))}
                  </RadioGroup>
                  <ErrorMessage name="projectType" component="p" className="error-message" />
                </div>
              )}

              {/* Steps 2–4 — Questions */}
              {step >= 2 && questions.length > 0 && (
                <div className="space-y-6">
                  {[[0, 1], [2, 3], [4, 5]][step - 2].map((qIndex) => {
                    const answerKey = `answer${qIndex + 1}`;
                    const q = questions[qIndex];
                    return (
                      <div key={qIndex} className="space-y-1.5">
                        <Label className="text-[13px] font-medium text-foreground ml-1">
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
                            errors[answerKey] && touched[answerKey] && "border-destructive focus-visible:ring-destructive"
                          )}
                        />
                        <ErrorMessage name={answerKey} component="p" className="error-message" />
                        {q.template && (
                          <p className="text-[12px] text-muted-foreground ml-1 mt-1">
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
      <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-border flex-shrink-0 bg-card">
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
          <Button
            type="submit"
            form="aiProjectForm"
            disabled={isLoading || outOfCredits}
          >
            {step === 4 ? (
              <>
                {isLoading ? "Generating…" : (
                  <>
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    Generate Now
                  </>
                )}
              </>
            ) : "Next"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
