import React, { useState } from "react";
import Button from "./button";
import Text from "./text";
import { _deleteProject } from "@/network/post-request";
import { useGlobalContext } from "@/context/globalContext";

export default function DeleteProject() {
  const { closeModal, selectedProject, userDetailsRefecth } =
    useGlobalContext();
  const [loading, setLoading] = useState(false);
  const onDelete = () => {
    setLoading(true);
    _deleteProject(selectedProject._id)
      .then((res) => {
        userDetailsRefecth();
        closeModal();
      })
      .finally(() => setLoading(false));
  };
  return (
    <div className="p-[24px] rounded-2xl bg-modal-bg-color  w-[400px]">
      <Text className="text-modal-heading-color">Confirm Deletion</Text>
      <Text size="p-xsmall" className="text-df-secondary-text-color mt-2">
        Are you sure you want to delete this case study from your portfolio?
        This action cannot be undone.
      </Text>

      <div className="flex gap-2 mt-[26px] justify-end">
        <Button text={"Cancel"} onClick={closeModal} type="secondary" />
        <Button
          onClick={onDelete}
          text={"Delete"}
          type="modal"
          isLoading={loading}
        />
      </div>
    </div>
  );
}
