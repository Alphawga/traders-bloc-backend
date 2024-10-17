import React, { ReactNode } from "react";

function FormGroup({ children }: { children: ReactNode }) {
  return <div className="flex w-full gap-4">{children}</div>;
}

export default FormGroup;
