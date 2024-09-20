import React from "react";
import Text from "./text";

export default function ForgotPasswordPlaceHolder({ email }) {
  return (
    <div className="md:w-[380px] m-auto flex flex-col items-center justify-center relative">
      <img
        src="/assets/svgs/email-sent.svg"
        className="w-[160px] h-[160px]"
        alt="designfolio logo"
      />
      <div>
        <Text
          as="h1"
          size={"p-large"}
          className="text-sub-heading-text-color font-bold text-center"
        >
          Check your inbox!
        </Text>
        <Text
          variant={"medium"}
          size={"p-xsmall"}
          className="mt-2 text-description-text font-medium text-center leading-6"
        >
          We have sent an email to{" "}
          <span className="text-input-error-color">{email}</span> please follow
          the instructions to reset your password
        </Text>
      </div>
    </div>
  );
}
