// Custom checkbox component
const ToolCheckbox = ({ tool, field, form, theme }) => {
  const isSelected = form?.values?.selectedTools?.filter(
    (selectedTool) => tool?.value == selectedTool?.value
  );

  const handleSelect = () => {
    if (isSelected?.length > 0) {
      const nextSelectedTools = form?.values?.selectedTools?.filter(
        (selectedTool) => selectedTool?.value !== tool?.value
      );
      form.setFieldValue("selectedTools", nextSelectedTools);
    } else {
      const nextSelectedTools = [...form?.values?.selectedTools, tool];
      form.setFieldValue("selectedTools", nextSelectedTools);
    }
  };

  return (
    <div
      onClick={handleSelect}
      className={`flex cursor-pointer items-center justify-between gap-2 rounded-full border border-solid p-2 px-3 dark:border-[#30323D] dark:bg-[#13151A] dark:text-[#E9EAEB] dark:hover:bg-[#30323D]`}
    >
      {tool?.image && <img src={tool?.image} alt={tool?.name} className="h-[26px] w-[26px]" />}

      <p className="font-inter text-[16px] font-[500] text-[#202937] dark:text-[#E9EAEB]">
        {tool?.label}
      </p>
      <div className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-[#E9EAEB] hover:bg-[#E9EAEB]">
        <img
          src={`${isSelected?.length != 0 ? "/assets/svgs/checkbox.svg" : "/assets/svgs/plus.svg"}`}
          alt="add"
          className={`${isSelected?.length != 0 ? "h-[24px] w-[24px]" : "h-[14px] w-[14px]"}`}
        />
      </div>
    </div>
  );
};

export default ToolCheckbox;
