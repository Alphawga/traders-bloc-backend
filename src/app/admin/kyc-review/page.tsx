import React from "react";
import MainHeader from "../components/headers/mainHeader.tsx";
import Container from "../components/container.tsx";
import { IoSearchOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

function KYCReview() {
  return (
    <main>
      <MainHeader />
      <Container>
        <>
          <h1 className="text-3xl lg:text-4xl font-extrabold lg:my-8">
            Businesses KYB Review{" "}
          </h1>
          <div className="w-full bg-bg_light rounded-xl mt-5 lg:mt-15 flex flex-row px-4 items-center">
            <IoSearchOutline size={25} className="text-text w-[10%]" />
            <input
              type="text"
              placeholder="Search  for invoices, tasks, or companies"
              className="bg-transparent p-4 w-[90%]"
            />
          </div>
          <div className="w-full mt-5">
            <table className="w-full p-4">
              <thead>
                <tr className="border border-bg_light rounded-lg">
                  <th className="p-2">Business Name</th>
                  <th className="p-2">Primary User</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-center border border-bg_light">
                  <td className="p-4 text-text">
                    <Link to="/review_document">Acme Inc</Link>
                  </td>
                  <td className="text-text_light">Sarah</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      </Container>
    </main>
  );
}

export default KYCReview;
