import { useGlobalContext } from "@/context/globalContext";
import { _deleteResume, _updateUser } from "@/network/post-request";
import { useState } from "react";
import { Button } from "./ui/button";
import Text from "./text";
import CloseIcon from "../../public/assets/svgs/close.svg";
import NoteIcon from "../../public/assets/svgs/noteIcon.svg";
import DeleteIcon from "../../public/assets/svgs/deleteIcon.svg";

export default function AddResume() {
  const { userDetails, closeModal, userDetailsRefecth, updateCache } =
    useGlobalContext();
  const [resume, setResume] = useState(userDetails?.resume);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result;
      const payload = {
        resume: {
          key: base64Image,
          originalName: resume.name,
          extension: resume.type,
        },
      };

      _updateUser(payload)
        .then((res) => {
          updateCache("userDetails", res?.data?.user);
          closeModal();
        })
        .catch((err) => console.log(err))
        .finally(() => setLoading(true));
    };
    reader.readAsDataURL(resume);
  };

  const handleDelete = () => {
    _deleteResume().then((res) => userDetailsRefecth());
  };
  return (
    <div className="rounded-2xl bg-card flex flex-col justify-between  m-auto lg:w-[500px] max-h-[550px] my-auto overflow-hidden">
      <div className="flex p-5 justify-between items-center">
        <Text size="p-small" className="font-semibold">
          Upload your resume
        </Text>
        <Button variant="outline" size="icon" type="button" onClick={closeModal}>
          <CloseIcon className="text-icon-color" />
        </Button>
      </div>
      <div className="px-5">
        <div>
          <label htmlFor="picture">
            <div className="bg-background rounded-[18px] p-4 m-auto text-center flex flex-col items-center  w-full justify-center border border-dashed border-input-upload-border-color h-[250px] mt-2 ">
              <img src="/assets/svgs/upload-red.svg" alt="" />
              <Text
                size="p-xsmall"
                className="text-input-upload-heading-color mt-2 text-center"
              >
                Select the PDF file of your resume.
              </Text>
              <Text
                size="p-xxxsmall"
                className="mt-2 text-center text-input-upload-description-color"
              >
                Maximum size should be 5MB.
              </Text>
              <Button variant="outline" type="button" className="mt-4 pointer-events-none">Browse and choose</Button>
            </div>
          </label>
          <input
            id="picture"
            name="picture"
            type="file"
            hidden
            accept="application/pdf"
            onChange={(event) => setResume(event.currentTarget.files[0])}
          />
        </div>

        {resume && (
          <div
            className={`bg-secondary-btn-bg-color hover:bg-secondary-btn-bg-hover-color text-secondary-btn-text-color  border-solid border border-secondary-btn-border-color flex  mb-[32px]  cursor-pointer  rounded-2xl px-[13px] py-4 justify-between items-center mt-[24px]`}
          >
            <div className="flex justify-between items-center gap-2">
              <NoteIcon className="text-df-icon-color" />
              <Text size="p-xsmall" className="text-secondary-btn-text-color">
                {resume?.name ?? userDetails?.resume?.originalName}
              </Text>
            </div>

            <Button
              variant="outline"
              size="icon"
              type="button"
              className="border-[var(--delete-btn-border-color)] bg-[var(--delete-btn-bg-color)] hover:bg-[var(--delete-btn-bg-hover-color)] hover:border-[var(--delete-btn-border-hover-color)]"
              onClick={handleDelete}
            >
              <DeleteIcon className="stroke-delete-btn-icon-color w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-[26px] justify-end p-3 bg-modal-footer-bg-color rounded-br-[24px] rounded-bl-[24px]">
        <Button variant="outline" type="button" onClick={closeModal}>Cancel</Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !resume || !!resume?.extension}
        >{loading ? "Saving…" : "Save resume"}</Button>
      </div>
    </div>
  );
}
