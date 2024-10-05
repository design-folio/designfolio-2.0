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
      className={`border group border-checked-list-item-border-color w-fit bg-checked-list-item-bg-color  transition-all duration-200 ease-in-out hover:bg-checked-list-item-bg-hover-color rounded-2xl flex gap-[10px] items-center p-[10px]  ${
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
        <div className="w-[25px] h-[25px] border border-check-list-empty-border-color rounded-full"></div>
      )}
      <Text size="p-xxsmall" className="text-checked-list-item-text-color">
        {label}
      </Text>
    </label>
  );
};

export default CustomRadioButton;
