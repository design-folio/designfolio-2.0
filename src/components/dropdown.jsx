import React, { useState, useEffect } from "react";

function Dropdown({ data, onClick, defaultValue, theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    defaultValue === "" ? "Click to select" : defaultValue
  );

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const hoverStyles = {
    backgroundColor: theme === "dark" ? "red" : "#F5F5F5", // Adjust hover color based on theme
    cursor: "pointer",
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    onClick(option);
    setIsOpen(false);
  };

  const getDropdownStyles = () => {
    return theme === "dark"
      ? {
          backgroundColor: "#262832",
          color: "#fff",
          border: "2px solid #373B43",
          boxBorder: "0px solid #E0E6EB",
          label: "#7A829D",
        }
      : {
          backgroundColor: "#ffffff",
          color: "#202937",
          border: "2px solid #F0F1F4",
          boxBorder: "1px solid #E0E6EB",
          label: "#7A829D",
        };
  };

  return (
    <div className="relative inline-block">
      <button
        className={`flex items-center justify-between px-4 py-4 ${
          getDropdownStyles().color
        } border rounded-md cursor-pointer text-sm`}
        onClick={handleToggle}
        style={{ border: getDropdownStyles().boxBorder }}
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
          className={`absolute top-full left-0 bg-white rounded-md shadow-md mt-2 overflow-y-auto ${
            getDropdownStyles().backgroundColor
          }`}
          style={{
            maxHeight: "25vh",
            width: "20vw",
            overflowX: "hidden",
            backgroundColor: getDropdownStyles().backgroundColor,
            border: getDropdownStyles().border,
          }} // Maintain max height and prevent horizontal overflow
        >
          <div className="py-2" style={{ maxHeight: "25vh" }}>
            {data.map((item) => (
              <>
                <div
                  key={item}
                  className={`px-4 py-2 ml-4 cursor-default`}
                  onClick={() => handleOptionClick(item)}
                  style={{ hover: hoverStyles.backgroundColor }}
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
