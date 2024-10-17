import React from "react";
import MainHeader from "../components/headers/mainHeader.tsx";
import Container from "../components/container.tsx";
import Button from "../components/form/button.tsx";
import { PiUsers } from "react-icons/pi";
import { GoChevronRight } from "react-icons/go";
import { MdOutlineStickyNote2 } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Subtext from "../components/subtext.tsx";
import { HiOutlinePaperClip } from "react-icons/hi2";

function Funding() {
  const navigate = useNavigate()
  return (
    <main>
      <MainHeader />
      <Container>
        <>
          <div className="flex flex-row gap-5 my-4">
            <p className="text-text_light">Funding Requests</p> /{" "}
            <p className="text-text">Request #0001</p>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold lg:my-8">
            Request #001
          </h1>
          <h3 className="font-bold text-lg my-3">Requested Funding</h3>
          <div className="border-t border-t-bg_light p-4 flex flex row">
            <div className="w-[50%] flex flex-col gap-3">
              <p className="text-text_light -mb-3">Requested Amount</p>
              <p className="text-text text-lg">$1,000.00</p>
            </div>
            <div className="w-[50%] flex flex-col gap-3">
              <p className="text-text_light -mb-3">Invoice</p>
              <p className="text-text text-lg">Inv #123</p>
            </div>
          </div>
          <div className="border-t border-t-bg_light p-4 flex flex row">
            <div className="w-[50%] flex flex-col gap-3">
              <p className="text-text_light -mb-3">Milestone</p>
              <p className="text-text text-lg">Milestone 1</p>
            </div>
          </div>
          <h3 className="font-bold text-lg my-3">Approve or Reject</h3>
          <p className="text-text_light text-sm -mb-3">
            You can approve or reject this request. If you reject it, the trader
            will have to submit a new request.
          </p>
          <div className="my-8 flex lg:justify-end">
            <div className="w-full lg:w-[40%] flex flex-row gap-3">
              <Button text="Approve" onClick={() => {}} />
              <Button text="Reject" color="primary" onClick={() => {}} />
            </div>
          </div>
          <h3 className="font-bold text-lg my-3">Actions</h3>
          <div className="flex flex-row items-center justify-between py-4">
            <div className="w-full lg:w-[40%] flex flex-row items-center gap-4">
              <div className="p-2 bg-bg_light rounded-lg">
                <PiUsers size={25} />
              </div>
              <p className="text-text">View Trader Profile</p>
            </div>
            <GoChevronRight size={25} onClick={() => navigate('/profile')}/>
          </div>
          <div className="flex flex-row items-center justify-between py-4">
            <div className="w-full lg:w-[40%] flex flex-row items-center gap-4">
              <div className="p-2 bg-bg_light rounded-lg">
                <MdOutlineStickyNote2 size={25} />
              </div>
              <p className="text-text">View Funding Request</p>
            </div>
            <GoChevronRight size={25} onClick={() => navigate("/funding")}/>
          </div>
          <div className="flex flex-row items-center justify-between py-4">
            <div className="w-full lg:w-[40%] flex flex-row items-center gap-4">
              <div className="p-2 bg-bg_light rounded-lg">
                <MdOutlineStickyNote2 size={25} />
              </div>
              <p className="text-text">View Invoice</p>
            </div>
            <GoChevronRight size={25} onClick={() => navigate("/invoice")}/>
          </div>
          <div className="flex flex-row items-center justify-between py-4">
            <div className="w-[40%] flex flex-row items-center gap-4">
              <div className="p-2 bg-bg_light rounded-lg">
                <MdOutlineStickyNote2 size={25} />
              </div>
              <p className="text-text">View Milestone</p>
            </div>
            <GoChevronRight size={25} onClick={() => navigate("/milestone")}/>
          </div>
          <h3 className="font-bold text-lg my-3">Notes</h3>
          <Subtext text="Add a note to the trader. This will be displayed on the trader's dashboard and included in email notifications." />
          <div className="bg-bg_light p-2 my-4 lg:p-0 rounded-lg flex flex-col gap-2 lg:gap-0 lg:flex-row items-center w-full">
            <div className="w-[90%]">
              <input
                className="bg-transparent p-4 outline-1 outline-text w-full"
                placeholder="Send  feedback or request more documents"
              />
            </div>
            <div className="w-[10%] flex flex-row items-center justify-start lg:justify-between px-2">
            <HiOutlinePaperClip size={25} />
            <button className="bg-info text-white p-2 rounded-lg px-4">
                Send
              </button>
            </div>
          </div>
        </>
      </Container>
    </main>
  );
}

export default Funding;
