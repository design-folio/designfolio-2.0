import { useGlobalContext } from "@/context/globalContext";
import { _deleteResume, _updateUser } from "@/network/post-request";
import { useState } from "react";
import { Button } from "./ui/button";
import Text from "./text";
import CloseIcon from "../../public/assets/svgs/close.svg";
import NoteIcon from "../../public/assets/svgs/noteIcon.svg";
import DeleteIcon from "../../public/assets/svgs/deleteIcon.svg";

export default function AddResume() {
  const { userDetails, closeModal, userDetailsRefecth, updateCache } = useGlobalContext();
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
    <div className="bg-card m-auto my-auto flex max-h-[550px] flex-col justify-between overflow-hidden rounded-2xl lg:w-[500px]">
      <div className="flex items-center justify-between p-5">
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
            <div className="bg-background border-input-upload-border-color m-auto mt-2 flex h-[250px] w-full flex-col items-center justify-center rounded-[18px] border border-dashed p-4 text-center">
              <img src="/assets/svgs/upload-red.svg" alt="" />
              <Text size="p-xsmall" className="text-input-upload-heading-color mt-2 text-center">
                Select the PDF file of your resume.
              </Text>
              <Text
                size="p-xxxsmall"
                className="text-input-upload-description-color mt-2 text-center"
              >
                Maximum size should be 5MB.
              </Text>
              <Button variant="outline" type="button" className="pointer-events-none mt-4">
                Browse and choose
              </Button>
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
            className={`bg-secondary-btn-bg-color hover:bg-secondary-btn-bg-hover-color text-secondary-btn-text-color border-secondary-btn-border-color mt-[24px] mb-[32px] flex cursor-pointer items-center justify-between rounded-2xl border border-solid px-[13px] py-4`}
          >
            <div className="flex items-center justify-between gap-2">
              <NoteIcon className="text-df-icon-color" />
              <Text size="p-xsmall" className="text-secondary-btn-text-color">
                {resume?.name ?? userDetails?.resume?.originalName}
              </Text>
            </div>

            <Button
              variant="outline"
              size="icon"
              type="button"
              className="border-(--delete-btn-border-color) bg-(--delete-btn-bg-color) hover:border-(--delete-btn-border-hover-color) hover:bg-(--delete-btn-bg-hover-color)"
              onClick={handleDelete}
            >
              <DeleteIcon className="stroke-delete-btn-icon-color h-5 w-5" />
            </Button>
          </div>
        )}
      </div>

      <div className="bg-modal-footer-bg-color mt-[26px] flex justify-end gap-2 rounded-br-[24px] rounded-bl-[24px] p-3">
        <Button variant="outline" type="button" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !resume || !!resume?.extension}
        >
          {loading ? "Saving…" : "Save resume"}
        </Button>
      </div>
    </div>
  );
}
