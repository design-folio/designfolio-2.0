import React from "react";
import DangerIcon from "../../public/assets/svgs/danger.svg";
import Text from "./text";

export default function Info({ className = "" }) {
  return (
    <div
      className={`flex gap-4 items-center bg-delete-btn-bg-color px-4 py-3 border border-solid border-delete-btn-icon-color rounded-2xl ${className}`}
    >
      <div>
        <DangerIcon className="text-delete-btn-icon-color" />
      </div>
      <Text size="p-xsmall" className="font-medium">
        Oops! You've used up your 2 credits for today. Check back tomorrow to
        get more!
      </Text>
    </div>
  );
}
