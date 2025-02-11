import { useEffect, useRef, useState } from "react";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import NestedList from "@editorjs/nested-list";
import Table from "@editorjs/table";
import EditorJS from "@editorjs/editorjs";
import Undo from "editorjs-undo";
import Text from "./text";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Button from "./button";
import { scrapeMedium } from "@/network/post-request";

const validationSchema = Yup.object().shape({
  medium: Yup.string()
    .required()
    .url("Invalid URL")
    .matches(/(medium.com)/, "Invalid Medium link"),
});

export default function AnalyzeEditor() {
  const editorContainer = useRef(null);
  const editor = useRef(null); // Ref to hold the editor instance
  const [mediumPopup, setMediumPopup] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isDataPresent, setIsDataPresent] = useState(false);

  // Set up the editor after the component mounts
  useEffect(() => {
    setIsClient(true);

    if (!editorContainer.current) return;

    if (isClient) {
      const editorInstance = new EditorJS({
        holder: editorContainer.current,
        minHeight: 0,
        onReady: () => {
          setTimeout(() => {
            const undo = new Undo({ editor: editorInstance });
            try {
              undo.initialize();
            } catch (error) {
              console.error("Error initializing Undo plugin:", error);
            }
          }, 500);
        },
        tools: {
          header: {
            class: Header,
            config: {
              placeholder: "Enter a heading",
              levels: [2, 3, 4, 5, 6],
              defaultLevel: 2,
            },
          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
            config: {
              placeholder:
                "Type here or copy-paste at least 300 words of content.",
            },
          },
          list: {
            class: NestedList,
            inlineToolbar: true,
            config: {
              defaultStyle: "unordered",
            },
          },
          table: {
            class: Table,
            inlineToolbar: true,
          },
        },
        data: null,
        onChange: () => {
          handleUpdateContent(editorInstance);
        },
      });

      // Store the editor instance in the ref for future use
      editor.current = editorInstance;

      return () => {
        if (editor.current && typeof editor.current.destroy === "function") {
          editor.current.destroy();
        }
      };
    }
  }, [isClient]);

  // Function to update content in the editor
  const handleUpdateContent = (editorInstance) => {
    if (editorInstance) {
      editorInstance
        .save()
        .then((data) => {
          if (data && data.blocks && data.blocks.length > 0) {
            setIsDataPresent(true);
          } else {
            setIsDataPresent(false);
          }
        })
        .catch((error) => {
          console.error("Error saving editor content:", error);
        });
    }
  };

  const handleAnalyze = (editorInstance) => {
    if (editor.current) {
      const editorInstance = editor.current; // Get the editor instance from the ref
      editorInstance.save().then((data) => {
        if (data && data.blocks && data.blocks.length > 0) {
          scrapeMedium({
            mode: "manual",
            mediumPostURL: "",
          }).then((res) => console.log(res));
        }
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div
        className="project-editor bg-df-section-card-bg-color rounded-[24px] p-[16px] md:p-[32px] w-full flex-1 overflow-hidden"
        style={{ maxHeight: "calc(100vh - 122px)" }}
      >
        <div
          ref={editorContainer}
          className={
            "block w-[100%] mx-0 my-auto h-full relative overflow-auto"
          }
        >
          {/* {!isDataPresent && (
          <div className="relative">
            <div className="flex justify-center items-center gap-4 absolute z-50 right-0 left-0 top-[150px]">
              <div
                onClick={handleClick}
                className="cursor-pointer bg-white flex flex-col justify-center items-center border border-[#E0E6EB] rounded-[16px] w-[190px] p-4"
              >
                <img
                  src="/assets/svgs/notepad.svg"
                  alt="notepad"
                  className="cursor-pointer"
                />
                <Text size="p-xsmall" className="text-[#202937] mt-[10px]">
                  Paste text
                </Text>
              </div>
              <div
                onClick={() => setMediumPopup((prev) => !prev)}
                className="relative cursor-pointer bg-white flex flex-col justify-center items-center border border-[#E0E6EB] rounded-[16px] w-[190px] p-4"
              >
                <img
                  src="/assets/svgs/medium.svg"
                  alt="medium"
                  className="cursor-pointer"
                />
                <Text size="p-xsmall" className="text-[#202937] mt-[10px]">
                  Import from Medium
                </Text>
              </div>
            </div>
            {mediumPopup && (
              <div className="w-[310px] absolute right-0 top-[250px] z-50 rounded-xl shadow-lg bg-popover-bg-color border-4 border-solid border-popover-border-color">
                <div className="p-4">
                  <Text
                    size="p-small"
                    className="!mt-0 text-[#202937] !font-semibold"
                  >
                    Enter Medium URL
                  </Text>
                  <Formik
                    initialValues={{
                      medium: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, actions) => {
                      scrapeMedium({
                        mode: "medium",
                        mediumPostURL: values.medium,
                      }).then((res) => console.log(res));
                    }}
                  >
                    {({ isSubmitting, errors, touched }) => (
                      <Form id="mediumForm">
                        <Field
                          name="medium"
                          type="text"
                          placeholder="www.medium.com/batman/xyz"
                          className={`text-input mt-2  ${
                            errors.medium &&
                            touched.medium &&
                            "!text-input-error-color !border-input-error-color !shadow-input-error-shadow"
                          }`}
                          autoComplete="off"
                        />
                        <ErrorMessage
                          name="medium"
                          component="div"
                          className="error-message"
                        />
                        <Button
                          text={"Import & Analyze"}
                          btnType="submit"
                          isLoading={false}
                          form="mediumForm"
                          customClass="w-full mt-2"
                        />
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            )}
          </div>
        )} */}
        </div>
      </div>
      <Button
        text={"Analyze"}
        customClass="w-full mt-4"
        onClick={handleAnalyze}
      />
    </div>
  );
}
