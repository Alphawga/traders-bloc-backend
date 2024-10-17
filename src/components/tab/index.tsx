import React, { useState } from "react";

interface TabProps {
  tabs: { title: string }[];
}

function Tab({ tabs }: TabProps) {
  // Store the active tab index
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <ul className="my-8 flex flex-row gap-8 border-b border-b-bg_light">
      {tabs.map(({ title }, index) => (
        <li
          key={index}
          className={`capitalize cursor-pointer pb-4 ${
            activeIndex === index
              ? "border-b-4 border-secondary text-text_light"
              : "text-text_light"
          }`}
          onClick={() => setActiveIndex(index)} // Update active tab index
        >
          {title}
        </li>
      ))}
    </ul>
  );
}

export default Tab;
