import React from "react";
import DangerIcon from "../../public/assets/svgs/danger.svg";
import Text from "./text";

export default function Info({ className = "", onUpgrade }) {
  return (
    <div
      className={`flex gap-4 items-center bg-delete-btn-bg-color px-4 py-3 border border-solid border-delete-btn-icon-color rounded-2xl ${className}`}
    >
      <div>
        <DangerIcon className="text-delete-btn-icon-color" />
      </div>
      <Text size="p-xsmall" className="font-medium">
        You&apos;ve used all your free credits.{" "}
        {onUpgrade ? (
          <button
            onClick={onUpgrade}
            className="underline underline-offset-2 hover:opacity-70 transition-opacity"
          >
            Upgrade to Pro
          </button>
        ) : (
          "Upgrade to Pro"
        )}{" "}
        for unlimited access.
      </Text>
    </div>
  );
}
