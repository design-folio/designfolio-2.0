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
      // console.log(nextSelectedTools);
      form.setFieldValue("selectedTools", nextSelectedTools);
    } else {
      const nextSelectedTools = [...form?.values?.selectedTools, tool];
      form.setFieldValue("selectedTools", nextSelectedTools);
    }
  };

  return (
    <div
      onClick={handleSelect}
      className={`cursor-pointer flex gap-2 justify-between items-center  border border-solid rounded-full p-2 px-3 dark:bg-[#13151A] dark:border-[#30323D] dark:text-[#E9EAEB] dark:hover:bg-[#30323D]`}
    >
      {tool?.image && (
        <img
          src={tool?.image}
          alt={tool?.name}
          className="w-[26px] h-[26px] "
        />
      )}

      <p className="text-[16px] text-[#202937] dark:text-[#E9EAEB] font-inter font-[500]">
        {tool?.label}
      </p>
      <div className="bg-[#E9EAEB] hover:bg-[#E9EAEB] rounded-full w-[24px] h-[24px] flex justify-center items-center">
        <img
          src={`${
            isSelected?.length != 0
              ? "/assets/svgs/checkbox.svg"
              : "/assets/svgs/plus.svg"
          }`}
          alt="add"
          className={`${
            isSelected?.length != 0 ? "w-[24px] h-[24px]" : "w-[14px] h-[14px]"
          }`}
        />
      </div>
    </div>
  );
};

export default ToolCheckbox;
