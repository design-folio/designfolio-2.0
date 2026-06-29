import React from "react";
import DangerIcon from "../../public/assets/svgs/danger.svg";
import Text from "./text";

export default function Info({ className = "", onUpgrade }) {
  return (
    <div
      className={`bg-delete-btn-bg-color border-delete-btn-icon-color flex items-center gap-4 rounded-2xl border border-solid px-4 py-3 ${className}`}
    >
      <div>
        <DangerIcon className="text-delete-btn-icon-color" />
      </div>
      <Text size="p-xsmall" className="font-medium">
        You&apos;ve used all your free credits.{" "}
        {onUpgrade ? (
          <button
            onClick={onUpgrade}
            className="underline underline-offset-2 transition-opacity hover:opacity-70"
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
