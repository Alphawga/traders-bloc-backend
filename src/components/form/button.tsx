import React from "react";

function Button({
  text,
  onClick,
  color = "secondary",
  disabled = false,
  className,
}: {
  text: string;
  onClick?: () => void;
  color?: string;
  disabled?: boolean;
  className?: string;
}) {
  const baseStyle =
    "rounded-xl p-3 w-full text-sm capitalize text-center font-bold cursor-pointer";
  const disabledStyle = "opacity-50 cursor-not-allowed";

  const colorStyles = {
    secondary:
      "bg-secondary text-primary hover:bg-text_light hover:text-secondary",

    primary: "bg-bg_light text-dark hover:bg-text_light hover:text-secondary",
  };


  const combinedStyle = `${baseStyle} ${colorStyles[color]} ${
    disabled ? disabledStyle : ""
  } ${className}`;

  return (
    <button className={combinedStyle} onClick={onClick}>
      {text}
    </button>
  );
}

export default Button;
