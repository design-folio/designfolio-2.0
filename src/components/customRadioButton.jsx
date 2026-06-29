// components/CustomRadioButton.js
import React from "react";
import Text from "./text";
import EmptyCircle from "../../public/assets/svgs/emptyCircle.svg";
import SelectedCircle from "../../public/assets/svgs/selectedCircle.svg";
import { twMerge } from "tailwind-merge";
import CheckedIcon from "../../public/assets/svgs/checked.svg";

const CustomRadioButton = ({ field, label, value, selected, disabled }) => {
  return (
    <label
      className={`group border-checked-list-item-border-color bg-checked-list-item-bg-color hover:bg-checked-list-item-bg-hover-color flex w-fit items-center gap-[10px] rounded-2xl border p-[10px] transition-all duration-200 ease-in-out ${
        !selected ? "cursor-pointer " : "cursor-default"
      }`}
    >
      <input
        type="radio"
        {...field}
        value={value}
        checked={selected}
        style={{ display: "none" }} // Hide the default radio button
        onChange={field.onChange}
        disabled={disabled}
      />
      {selected ? (
        <CheckedIcon className="text-checked-list-item-icon-color" />
      ) : (
        <div className="border-check-list-empty-border-color h-[25px] w-[25px] rounded-full border"></div>
      )}
      <Text size="p-xxsmall" className="text-checked-list-item-text-color">
        {label}
      </Text>
    </label>
  );
};

export default CustomRadioButton;
