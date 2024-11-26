import React, { useState, useEffect, useRef } from "react";

function Dropdown({ data, onClick, defaultValue, theme }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    defaultValue === "" ? "Click to select" : defaultValue
  );
  const dropdownRef = useRef(null); // Reference to the dropdown element

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    onClick(option);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click happened outside the dropdown element
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Add event listener on component mount
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        className={`flex items-center justify-between px-4 py-4 rounded-lg cursor-pointer text-sm border-2 border-solid border-popover-border-color`}
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
          className={`pt-2 absolute z-20 right-0 origin-top-right transition-all will-change-transform translateZ(0) duration-120 ease-in-out ${
            isOpen
              ? "opacity-100 scale-100"
              : "opacity-0 scale-90 pointer-events-none"
          }`}
          style={{
            maxHeight: "25vh",
          }}
        >
          <div className="w-[250px] rounded-xl shadow-lg bg-popover-bg-color border-4 border-solid border-popover-border-color">
            <div className="p-4">
              {data.map((item) => (
                <div
                  key={item}
                  className={`px-4 py-2 cursor-pointer hover:bg-normal-btn-bg-hover-color rounded-lg text-[14px] font-medium `}
                  onClick={() => handleOptionClick(item)}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dropdown;
