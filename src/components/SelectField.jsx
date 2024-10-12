import { useField } from "formik";
import CreatableSelect from "react-select/creatable";
import { components } from "react-select"; // Import components from react-select

const SelectField = ({ options, theme, placeholder = "Select", ...props }) => {
  const [field, , helpers] = useField(props.name);
  const { setValue } = helpers;

  // Custom Option component for displaying an image alongside the label
  const CustomOption = ({ data, ...props }) => (
    <components.Option {...props}>
      <div className={`flex gap-2 items-center text-black dark:!text-black`}>
        {data.image && (
          <img
            src={data.image}
            alt=""
            style={{ width: 20, height: 20, marginRight: 8 }}
          />
        )}
        {props.children}
      </div>
    </components.Option>
  );

  // No need to customize MultiValueRemove explicitly unless you want to change its appearance or behavior.
  // It will display and function correctly if you just use the default or ensure it's correctly integrated in CustomMultiValue.

  // Ensure the CustomMultiValue component integrates well with React Select's default behavior, including the remove option
  const CustomMultiValue = (props) => {
    // Directly use the default MultiValue and MultiValueRemove components for layout and functionality
    return (
      <components.MultiValue
        {...props}
        className={"bg-[#E6E6E6] dark:bg-[#30323D]"}
      >
        <div
          className={`flex items-center !rounded-none dark:text-[#E9EAEB] text-black`}
        >
          {props.data.image && (
            <img
              src={props.data.image}
              alt=""
              style={{ width: 20, height: 20, marginRight: 8 }}
            />
          )}
          {props.children}
        </div>
      </components.MultiValue>
    );
  };

  const MultiValueRemove = (props) => {
    return (
      <components.MultiValueRemove {...props}>
        {/* <Cross stroke={theme == "light" ? "#1D1F27" : "#000"} /> X */}
      </components.MultiValueRemove>
    );
  };

  return (
    <CreatableSelect
      options={options}
      isMulti
      placeholder={placeholder}
      styles={{
        control: (provided, state) => ({
          ...provided,
          boxShadow: "none",
          border: `solid 1px ${theme == "dark" ? "#363A48" : "#DFDFDF"}`,
          borderRadius: "8px",
          width: "100%",
          background: theme == "dark" ? "#1D1F27" : "#fff",
        }),
      }}
      closeMenuOnSelect={false}
      components={{
        Option: CustomOption,
        MultiValue: CustomMultiValue,
        MultiValueRemove,
      }}
      value={field.value}
      onChange={(option) => setValue(option)}
      onBlur={() => field.onBlur({ target: { name: props.name } })}
      isClearable={false}
      className={"!text-input"}
      maxMenuHeight={250}
    />
  );
};

export default SelectField;
