import React from "react";
import MainHeader from "../components/headers/mainHeader.tsx";
import Container from "../components/container.tsx";
import { CiStickyNote } from "react-icons/ci";
import { BsCalendar2Date } from "react-icons/bs";
import { PiMoneyFill } from "react-icons/pi";
import Input from "../components/form/input.tsx";

function Milestone() {
  return (
    <main>
      <MainHeader />
      <Container>
        <>
          <div className="flex flex-col my-6">
            <h3 className="font-bold text-lg">Review Milestone</h3>
            <h3 className="font-bold text-lg my-4">Milestone Details</h3>
          </div>
          <div className="border-t border-t-bg_light p-4 flex flex-row w-full">
            <div className="w-[50%] flex flex-col gap-3">
              <p className="text-text_light -mb-3">Milestone</p>
              <p className="text-text text-lg">1</p>
            </div>
            <div className="w-[50%] flex flex-col gap-3">
              <p className="text-text_light -mb-3">Project</p>
              <p className="text-text text-lg">Data Labeling</p>
            </div>
          </div>
          <div className="border-t border-t-bg_light p-4 flex flex-row w-full">
            <div className="w-[50%] flex flex-col gap-3">
              <p className="text-text_light -mb-3">Amount</p>
              <p className="text-text text-lg">$1,000</p>
            </div>
            <div className="w-[50%] flex flex-col gap-3">
              <p className="text-text_light -mb-3">Due Date</p>
              <p className="text-text text-lg">Dec 24, 2022</p>
            </div>
          </div>
          <div className="border-t border-t-bg_light p-4 flex flex-row w-full">
            <div className="w-[50%] flex flex-col gap-3">
              <p className="text-text_light -mb-3">Vendor</p>
              <p className="text-text text-lg">Data Label Co.</p>
            </div>
            <div className="w-[50%] flex flex-col gap-3">
              <p className="text-text_light -mb-3">Status</p>
              <p className="text-text text-lg">Pending</p>
            </div>
          </div>
          <h3 className="font-bold text-lg my-4">Linked Invoices</h3>
          <div className="flex flex-row items-center justify-between py-4">
            <div className="lg:w-[40%] w-full flex flex-row items-center gap-4">
              <div className="p-2 bg-bg_light rounded-lg">
                <CiStickyNote size={25} />
              </div>
              <p className="text-text">View Milestone</p>
            </div>
          </div>
          <h3 className="font-bold text-lg my-4">Vendor Information</h3>
          <div className="border-t border-t-bg_light p-4 flex flex-row w-full">
            <div className="w-[50%] flex flex-col gap-3">
              <p className="text-text_light -mb-3">Vendor Name</p>
              <p className="text-text text-lg">Data Label Co.</p>
            </div>
            <div className="w-[50%] flex flex-col gap-3">
              <p className="text-text_light -mb-3">Address</p>
              <p className="text-text text-lg">
                123 Main St., San Francisco, CA 94102
              </p>
            </div>
          </div>
          <h3 className="font-bold text-lg my-4">Payment Details</h3>
          <div className="flex flex-row items-center justify-between py-4">
            <div className="lg:w-[40%] w-full flex flex-row items-center gap-4">
              <div className="p-2 bg-bg_light rounded-lg">
                <BsCalendar2Date size={25} />
              </div>
              <div className="flex flex-col items-left">
                <p className="text-text">Due Date</p>
                <p className="text-text_light text-sm">Dec 24, 2022</p>
              </div>
            </div>
          </div>{" "}
          <div className="flex flex-row items-center justify-between py-4">
            <div className="lg:w-[40%] w-full flex flex-row items-center gap-4">
              <div className="p-2 bg-bg_light rounded-lg">
                <PiMoneyFill size={25} />
              </div>
              <div className="flex flex-col items-left">
                <p className="text-text">Amount</p>
                <p className="text-text_light text-sm">$1,000</p>
              </div>
            </div>
          </div>
          <h3 className="font-bold text-lg my-4">Supporting Documents</h3>
          <div className="flex flex-row items-center justify-between py-4">
            <div className="lg:w-[40%] w-full flex flex-row items-center gap-4">
              <div className="p-2 bg-bg_light rounded-lg">
                <CiStickyNote size={25} />
              </div>
              <p className="text-text">Proof of Work</p>
            </div>
          </div>{" "}
          <div className="flex flex-row items-center justify-between py-4">
            <div className="lg:w-[40%] w-full flex flex-row items-center gap-4">
              <div className="p-2 bg-bg_light rounded-lg">
                <CiStickyNote size={25} />
              </div>
              <p className="text-text">Vendor Agreement</p>
            </div>
          </div>
          <h3 className="font-bold text-lg my-4">Reason for Rejection</h3>
          <div className="flex flex-row items-center justify-between py-4">
            <div className="lg:w-[40%] w-full">
              <Input type="textarea" rows={5} onChange={() => {}} />
            </div>
          </div>
          <div className="flex flex-row gap-4 justify-end mt-5">
            <button className="bg-bg_light text-text p-2 rounded-lg px-5">
              Reject
            </button>
            <button className="bg-info text-white p-2 rounded-lg px-5">
              Approve
            </button>
          </div>
        </>
      </Container>
    </main>
  );
}
export default Milestone;
