import React from "react";
import MainHeader from "../components/headers/mainHeader.tsx";
import Container from "../components/container.tsx";
// @ts-ignore
import receipt from "../assets/images/receipt.png";
import { useNavigate } from "react-router-dom";

function Preview() {
  const navigate = useNavigate();
  return (
    <main>
      <MainHeader />
      <Container>
        <div className="w-full">
          <img src={receipt} alt="invoice" className="w-full" />
          <div className="flex flex-row justify-end my-4">
            <button
              className="bg-bg_light text-text font-bold px-4 p-2 rounded-lg"
              onClick={() => navigate("/review_document")}
            >
              Close
            </button>
          </div>
        </div>
      </Container>
    </main>
  );
}

export default Preview;
