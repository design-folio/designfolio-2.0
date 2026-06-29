import React from "react";
import Text from "./text";

export default function ForgotPasswordPlaceHolder({ email }) {
  return (
    <div className="relative m-auto flex flex-col items-center justify-center md:w-[380px]">
      <img
        src="/assets/svgs/email-sent.svg"
        className="h-[160px] w-[160px]"
        alt="designfolio logo"
      />
      <div>
        <Text
          as="h1"
          size={"p-large"}
          className="text-landing-heading-text-color text-center font-bold"
        >
          Check your inbox!
        </Text>
        <Text
          variant={"medium"}
          size={"p-xsmall"}
          className="text-landing-description-text-color mt-2 text-center leading-6 font-medium"
        >
          We have sent an email to <span className="text-df-orange-color">{email}</span> please
          follow the instructions to reset your password
        </Text>
      </div>
    </div>
  );
}
