import React, { useState } from "react";
import { BiCheck } from "react-icons/bi";

const Checkbox = () => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleCheckboxChange}
        className="hidden"
      />
      <div
        className={`w-6 h-6 flex justify-center items-center rounded-md border transition-colors duration-200 
        ${
          isChecked
            ? "bg-bg_light border-text_light"
            : "bg-bg_light border-text_light"
        }`}
      >
        {isChecked && <BiCheck size={25} />}
      </div>
    </label>
  );
};

export default Checkbox;
