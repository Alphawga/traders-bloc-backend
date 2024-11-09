import React from "react";

function Task({text}:{text:string}) {
  return <div className={`px-8 py-2 w-auto text-sm bg-bg_light text-secondary rounded-lg`}>{text}</div>;
}

export default Task;
