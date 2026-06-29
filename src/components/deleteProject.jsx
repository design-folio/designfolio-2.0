import React, { useState } from "react";
import Button from "./button";
import Text from "./text";
import { _deleteProject } from "@/network/post-request";
import { useGlobalContext } from "@/context/globalContext";

export default function DeleteProject() {
  const { closeModal, selectedProject, userDetailsRefecth } = useGlobalContext();
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
    <div className="bg-card w-[400px] rounded-2xl p-[24px]">
      <Text className="text-modal-heading-color">Confirm Deletion</Text>
      <Text size="p-xsmall" className="text-df-secondary-text-color mt-2">
        Are you sure you want to delete this case study from your portfolio? This action cannot be
        undone.
      </Text>

      <div className="mt-[26px] flex justify-end gap-2">
        <Button text={"Cancel"} onClick={closeModal} type="secondary" />
        <Button onClick={onDelete} text={"Delete"} type="tertiary" isLoading={loading} />
      </div>
    </div>
  );
}
