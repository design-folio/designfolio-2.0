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
        className={`border-popover-border-color flex cursor-pointer items-center justify-between rounded-lg border-2 border-solid px-4 py-4 text-sm`}
        onClick={handleToggle}
      >
        <span className="mr-2">
          {selectedOption.length > 15 ? `${selectedOption.substring(0, 14)}...` : selectedOption}
        </span>
        <svg
          className="h-5 w-5 text-gray-500"
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
          className={`translateZ(0) absolute right-0 z-20 origin-top-right pt-2 transition-all duration-120 ease-in-out will-change-transform ${
            isOpen ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0"
          }`}
          style={{
            maxHeight: "25vh",
          }}
        >
          <div className="bg-popover-bg-color border-popover-border-color w-[250px] rounded-xl border-4 border-solid shadow-lg">
            <div className="p-4">
              {data.map((item) => (
                <div
                  key={item}
                  className={`hover:bg-normal-btn-bg-hover-color cursor-pointer rounded-lg px-4 py-2 text-[14px] font-medium`}
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
