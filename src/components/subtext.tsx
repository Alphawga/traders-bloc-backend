import React from "react";

function Subtext({ text, className }: { text: string; className?: string }) {
  return <p className={`text-xs text-text_light ${className}`}>{text}</p>;
}

export default Subtext;
