import React from "react";
import MainHeader from "../components/headers/mainHeader.tsx";
import Container from "../components/container.tsx";
// @ts-ignore
import Inv1 from "../assets/images/inv1.png";
// @ts-ignore
import Inv2 from "../assets/images/inv2.png";
// @ts-ignore
import Inv3 from "../assets/images/inv3.png";
import { CiClock2 } from "react-icons/ci";
import Button from "../components/form/button.tsx";
import Input from "../components/form/input.tsx";

function ReviewInvoice() {
  return (
    <main>
      <MainHeader />
      <Container>
        <>
          <h1 className="text-3xl lg:text-4xl font-extrabold lg:my-8">
            Review invoice #12345
          </h1>
          <div className="flex flex-col my-6">
            <h3 className="font-bold text-lg">Business Name</h3>
            <h3 className="font-bold text-lg">Invoice details</h3>
          </div>
          <div className="border-t border-t-bg_light p-4 flex flex row">
            <div className="w-[50%] flex flex-col gap-3">
              <p className="text-text_light -mb-3">Supplier</p>
              <p className="text-text text-lg">Dunder Mifflin</p>
            </div>
            <div className="lg:basis-3/4 basis-2/4 flex flex-col gap-3">
              <p className="text-text_light -mb-3">Issue date</p>
              <p className="text-text text-lg">Jan 1, 2023</p>
            </div>
          </div>
          <div className="border-t border-t-bg_light p-4 flex flex row">
            <div className="w-[50%] flex flex-col gap-3">
              <p className="text-text_light -mb-3">Due date</p>
              <p className="text-text text-lg">Feb 1, 2023</p>
            </div>
            <div className="w-[50%] flex flex-col gap-3">
              <p className="text-text_light -mb-3">Invoice total</p>
              <p className="text-text text-lg">$5,000</p>
            </div>
          </div>
          <div className="border-t border-t-bg_light p-4 flex flex row">
            <div className="w-[50%] flex flex-col gap-3">
              <p className="text-text_light -mb-3">Total paid</p>
              <p className="text-text text-lg">$0</p>
            </div>
            <div className="w-[50%] flex flex-col gap-3">
              <p className="text-text_light -mb-3">Total unpaid</p>
              <p className="text-text text-lg">$5,000</p>
            </div>
          </div>
          <h3 className="font-bold text-lg">Supporting documents</h3>
          <div className="grid grid-cols-3 gap-4 my-4">
            <div className="w-full h-50 rounded-lg overflow-hidden">
              <img
                src={Inv1}
                alt="inv"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-full h-50 rounded-lg overflow-hidden">
              <img
                src={Inv2}
                alt="inv"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-full h-50 rounded-lg overflow-hidden">
              <img
                src={Inv3}
                alt="inv"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h3 className="font-bold text-lg">Status</h3>
          <div className="flex flex-row justify-between my-4">
            <p className="text-text_light">Pending review</p>
            <CiClock2 size={25} className="text-text_light" />
          </div>
          <h3 className="font-bold text-lg">Action</h3>
          <div className="my-4 flex lg:justify-end">
            <div className="w-full lg:w-[40%] flex flex-row gap-3">
              <Button text="Approve" onClick={() => {}} />
              <Button text="Reject" color="primary" onClick={() => {}} />
            </div>
          </div>
          <h3 className="font-bold text-lg capitalize">Reason for Rejection</h3>
          <Input type="textarea" rows={5} onChange={() => {}}/>
          </>
      </Container>
    </main>
  );
}

export default ReviewInvoice;
