// components/CustomRadioButton.js
import React from "react";
import Text from "./text";
import EmptyCircle from "../../public/assets/svgs/emptyCircle.svg";
import SelectedCircle from "../../public/assets/svgs/selectedCircle.svg";
import { twMerge } from "tailwind-merge";

const CustomRadioButton = ({ field, label, value, selected }) => {
  return (
    <label
      className={twMerge(
        "flex gap-2 items-center border border-radio-btn-border-color bg-radio-btn-bg-color w-fit p-4 rounded-2xl cursor-pointer",
        `${selected && "bg-radio-btn-bg-selected-color"}`
      )}
    >
      <input
        type="radio"
        {...field}
        value={value}
        checked={selected}
        style={{ display: "none" }} // Hide the default radio button
        onChange={field.onChange}
      />
      {selected ? (
        <SelectedCircle className="fill-radio-btn-selected-fill-color stroke-radio-btn-selected-stroke-color" />
      ) : (
        <EmptyCircle className="text-radio-btn-border-color" />
      )}
      <Text size="p-xxsmall" className="text-radio-btn-text-color">
        {label}
      </Text>
    </label>
  );
};

export default CustomRadioButton;
