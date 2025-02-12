import React, { useEffect, useRef, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Embed from "@editorjs/embed";
import NestedList from "@editorjs/nested-list";
import Table from "@editorjs/table";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import Underline from "@editorjs/underline";
import ImageTool from "@editorjs/image";
import Paragraph from "@editorjs/paragraph";
import { _updateProject, _uploadImage } from "@/network/post-request";
import { useGlobalContext } from "@/context/globalContext";

import { useRouter } from "next/router";
import Undo from "editorjs-undo";

import Compressor from "compressorjs";
import queryClient from "@/network/queryClient";

import CodepenIcon from "../../public/assets/svgs/codepen.svg";

class FigmaTool {
  constructor({ data }) {
    this.data = data || { url: "" };
  }

  static get toolbox() {
    return {
      title: "Embed Figma",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="none">
    <circle cx="15" cy="12" r="3" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M9 21C10.6569 21 12 19.6569 12 18V15H9C7.34315 15 6 16.3431 6 18C6 19.6569 7.34315 21 9 21Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
    <path d="M12 9V15H9C7.34315 15 6 13.6569 6 12C6 10.3431 7.34315 9 9 9H12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M12 3V9H9C7.34315 9 6 7.65685 6 6C6 4.34315 7.34315 3 9 3H12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M12 3V9H15C16.6569 9 18 7.65685 18 6C18 4.34315 16.6569 3 15 3H12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
</svg>`,
    };
  }

  render() {
    const container = document.createElement("div");
    container.classList.add("figma-tool");

    this.input = document.createElement("textarea");
    this.input.placeholder =
      "Paste your Figma embed code here. \n\nClick share on Figma > Click Get embed code > Copy and paste.";
    this.input.value = this.data.url || "";
    container.appendChild(this.input);

    this.preview = document.createElement("div");
    this.preview.classList.add("figma-preview");
    container.appendChild(this.preview);

    this.input.addEventListener("input", () => {
      this.updatePreview();
    });

    this.updatePreview(); // Initial preview

    return container;
  }

  updatePreview() {
    const code = this.input.value.trim();
    if (code.startsWith("<iframe")) {
      this.input.style.display = "none"; // Hide input when iframe code is present
      this.preview.innerHTML = code; // Display iframe
    } else {
      this.input.style.display = "block"; // Show input if not iframe code
      this.preview.innerHTML = ""; // Clear preview
    }
  }

  save(blockContent) {
    return {
      url: this.input.value.trim(),
    };
  }

  static get sanitize() {
    return {
      url: true,
    };
  }

  static get isReadOnlySupported() {
    return true;
  }
}

const ProjectEditor = ({ projectDetails, userDetails }) => {
  const editorContainer = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { setWordCount, setProjectValue } = useGlobalContext();

  useEffect(() => {
    setIsClient(true);

    if (!editorContainer.current) return;

    if (isClient) {
      const editor = new EditorJS({
        holder: editorContainer.current,
        // minHeight: 75,

        onReady: () => {
          setTimeout(() => {
            const undo = new Undo({ editor });
            try {
              undo.initialize();
            } catch (error) {
              console.error("Error initializing Undo plugin:", error);
            }
          }, 500);

          checkWordCount(editor);
        },
        tools: {
          figma: FigmaTool,
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
              placeholder: "Type here...",
            },
          },
          list: {
            class: NestedList,
            inlineToolbar: true,
            config: {
              defaultStyle: "unordered",
            },
          },
          embed: {
            class: Embed,
            inlineToolbar: true,
            config: {
              services: {
                youtube: true,
                coub: true,
                facebook: true,
                instagram: true,
                twitter: true,
                miro: true,
                vimeo: true,
                codepen: true,
                pinterest: true,
                github: true,
              },
            },
          },
          // nestedList: {
          //   class: NestedList,
          //   inlineToolbar: true,
          // },

          table: {
            class: Table,
            inlineToolbar: true,
          },

          marker: {
            class: Marker,
            shortcut: "CMD+SHIFT+M",
          },
          inlineCode: {
            class: InlineCode,
            shortcut: "CMD+SHIFT+C",
          },
          underline: {
            class: Underline,
            shortcut: "CMD+U",
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile(file) {
                  return new Promise(async (resolve, reject) => {
                    const MAX_SIZE_MB = 2; // Maximum file size in MB
                    const fileSizeMB = file.size / (1024 * 1024); // Convert file size to MB

                    // if (fileSizeMB > MAX_SIZE_MB) {
                    //   alert(
                    //     "The file size exceeds the 2 MB limit. Please choose a smaller file"
                    //   );
                    //   return reject(new Error("File size exceeds 2 MB limit."));
                    // }

                    try {
                      let compressedFile; // Compress before upload

                      if (file?.type === "image/gif") {
                        compressedFile = file;
                      } else {
                        try {
                          compressedFile = await new Promise(
                            (resolveCompression, rejectCompression) => {
                              new Compressor(file, {
                                quality: 0.8, // Adjust the desired image quality (0.0 - 1.0)
                                mimeType: "image/webp", // Specify the output image format
                                maxHeight: 3840,

                                success(result) {
                                  resolveCompression(result);
                                },
                                error(error) {
                                  rejectCompression(error);
                                },
                              });
                            }
                          );
                        } catch (e) {
                          return reject(e);
                        }
                      }

                      const reader = new FileReader();
                      reader.onload = function (e) {
                        const base64 = e.target.result.split(",")[1];

                        _uploadImage({
                          file: {
                            key: "data:image/png;base64," + base64,
                            originalName: compressedFile.name, // Use compressed file's name
                            extension: compressedFile.type, // Use compressed file's type
                          },
                        })
                          .then((result) => {
                            resolve(result.data);
                          })
                          .catch((error) => reject(error));
                      };

                      reader.readAsDataURL(compressedFile); // Read the compressed file
                    } catch (compressionError) {
                      reject(compressionError); // Handle compression errors
                    }
                  });
                },
              },
              field: "image",
              types: "image/*",
              captionPlaceholder: "Enter caption",
              buttonContent: "Select an image",
            },
          },
        },
        data: projectDetails?.content ?? null,
        // Add the onChange callback here
        onChange: () => {
          (async () => {
            const content = await editor?.save();
            if (
              JSON.stringify(content?.blocks) !==
              JSON.stringify(projectDetails?.content?.blocks)
            ) {
              content?.blocks?.forEach((block) => {
                if (block.type == "image") {
                  block.data.file.url = block.data.file.key;
                }
              });
              _updateProject(router.query.id, { content }).then((res) => {
                if (userDetails) {
                  const updatedProjects = userDetails?.projects?.map((item) =>
                    item._id === router.query.id
                      ? { ...item, content: res?.data?.project?.content }
                      : item
                  );
                  queryClient.setQueriesData(
                    { queryKey: ["userDetails"] },
                    (oldData) => {
                      return {
                        user: { ...oldData?.user, projects: updatedProjects },
                      };
                    }
                  );
                }
              });
            }
          })();

          checkWordCount(editor);
        },
      });

      // MutationObserver to detect when .ce-popover__items is available
      const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
          if (mutation.type === "childList") {
            const popoverItems = document.querySelector(".ce-popover__items");
            if (popoverItems) {
              // Create the <p> tag
              const div = document.createElement("div");
              div.innerHTML =
                "💡Embed <img src='/assets/svgs/youtube.svg'  className='w-4'/> or <img src='/assets/svgs/codepen.svg' className='w-4'/> by pasting the link in the editor.";
              div.classList.add("!text-[12px]");
              div.classList.add("flex");
              div.classList.add("flex-wrap");
              div.classList.add("gap-x-1");
              div.classList.add("mt-2");

              // Append the <p> tag to the target element
              popoverItems.appendChild(div);

              // Optionally, stop observing if you only need to add the paragraph once
              observer.disconnect();
              break;
            }
          }
        }
      });

      // Start observing the document for changes
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return async () => {
        if (editor && typeof editor.destroy === "function") {
          // refetchProjectDetail();
          editor.destroy();
        }
      };
    }
  }, [isClient, projectDetails]);

  let checkWordCount = async (edit) => {
    const outputData = await edit.save();
    let totalText = "";
    // Loop through all blocks and concatenate their text content
    outputData.blocks.forEach((block, index) => {
      if (block.data.text) {
        const tempElement = document.createElement("div");
        tempElement.textContent =
          index >= 1 ? " " + block.data.text : block.data.text;
        const textWithoutTags = tempElement.innerText;
        totalText += textWithoutTags;
      }

      if (block.type === "table") {
        let wordCount = 0;
        totalText += " ";
        block.data.content.forEach((row) => {
          row.forEach((cell) => {
            if (cell !== "") totalText += cell + " ";
          });
        });
      }

      if (block.type === "list") {
        let wordCount = 0;
        block.data.items.forEach((item) => {
          if (item.content != "") {
            wordCount += item.content;
            totalText += " " + wordCount;
          }
        });
      }

      if (block.type === "image") {
        // Calculate word count based on image caption
        const imageCaption = block.data.caption;
        totalText += " " + imageCaption;
      }
    });
    setProjectValue(totalText.replace("&nbsp;", "").trim());
    setWordCount(totalText.replace("&nbsp;", "").trim().split(" ").length);
  };

  return (
    <>
      <div className="project-editor bg-df-section-card-bg-color rounded-[24px] p-[16px] md:p-[32px]">
        <div
          ref={editorContainer}
          className={"block w-[100%] mx-0 my-auto"}
        ></div>
      </div>
    </>
  );
};

export default ProjectEditor;
