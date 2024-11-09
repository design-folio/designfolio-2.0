import React, { useState, useEffect } from "react";

function Dropdown({ data, onClick, defaultValue, theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    defaultValue === "" ? "Click to select" : defaultValue
  );

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };


  const handleOptionClick = (option) => {
    setSelectedOption(option);
    onClick(option);
    setIsOpen(false);
  };


  return (
    <div className="relative inline-block">
      <button
        className={`flex items-center justify-between px-4 py-4  rounded-md cursor-pointer text-sm border-2 border-solid border-popover-border-color`}
        onClick={handleToggle}
      >
        <span className="mr-2">
          {selectedOption.length > 15
            ? `${selectedOption.substring(0, 14)}...`
            : selectedOption}
        </span>
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isOpen ? "M19 15l-7-7-7 7" : "M19 9l-7 7-7-7"}
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute top-full left-0 w-[250px] rounded-xl shadow-lg bg-popover-bg-color border-2 border-solid border-popover-border-color`}
          style={{
            maxHeight: "25vh",
            width: "20vw",
            overflowX: "hidden",
          }} // Maintain max height and prevent horizontal overflow
        >
          <div className="py-2" style={{ maxHeight: "25vh" }}>
            {data.map((item) => (
              <>
                <div
                  key={item}
                  className={`px-4 py-2 ml-4 cursor-default`}
                  onClick={() => handleOptionClick(item)}
                >
                  {item}
                </div>
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dropdown;
