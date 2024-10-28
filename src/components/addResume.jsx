import { useGlobalContext } from "@/context/globalContext";
import { _deleteResume, _updateUser } from "@/network/post-request";
import { useState } from "react";
import Button from "./button";
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
    <div className="rounded-2xl bg-modal-bg-color flex flex-col justify-between  m-auto lg:w-[500px] max-h-[550px] my-auto overflow-hidden">
      <div className="flex p-5 justify-between items-center">
        <Text size="p-small" className="font-semibold">
          Upload your resume
        </Text>
        <Button
          // customClass="lg:hidden"
          type="secondary"
          customClass="!p-2 rounded-[8px]"
          icon={<CloseIcon className="text-icon-color" />}
          onClick={closeModal}
        />
      </div>
      <div className="px-5">
        <div>
          <label htmlFor="picture">
            <div className="bg-input-upload-bg-color rounded-[18px] p-4 m-auto text-center flex flex-col items-center  w-full justify-center border border-dashed border-input-upload-border-color h-[250px] mt-2 ">
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
              <Button
                text={"Browse and choose"}
                size="small"
                type="secondary"
                customClass="mt-4 pointer-events-none"
              />
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
              icon={
                <DeleteIcon className="stroke-delete-btn-icon-color w-6 h-6" />
              }
              type="normal"
              className=""
              onClick={handleDelete}
            />
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-[26px] justify-end p-3 bg-modal-footer-bg-color rounded-br-[24px] rounded-bl-[24px]">
        <Button text={"Cancel"} onClick={closeModal} type="secondary" />
        <Button
          text={"Save resume"}
          onClick={handleSubmit}
          isLoading={loading}
          isDisabled={!resume || resume?.extension}
          type="modal"
        />
      </div>
    </div>
  );
}
