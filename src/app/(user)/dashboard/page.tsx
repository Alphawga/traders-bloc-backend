"use client"

import Container from "@/components/container";
import FormGroup from "@/components/form/formgroup";
import useUserStore from "@/store/user-store";

import Image from "next/image";
import Link from "next/link";

import { GoArrowRight } from "react-icons/go";
import { LuWatch } from "react-icons/lu";
import { FaRegMoneyBillAlt } from "react-icons/fa";

function Dashboard() {

  const { user } = useUserStore();



  return (
    <main>
      
      <Container>
        <>
        <div className="flex lg:flex-row flex-col items-center lg:gap-8 gap-0">
            <div className="overflow-hidden rounded-lg lg:w-2/4 w-full lg:h-[20rem] h-[15rem] bg-black">
              <Image
                src={"/images/bg_.png"}
                alt="bg"
                className="w-[100%] object-contain object-center lg:-translate-y-28"
                width={100}
                height={100}
              />
            </div>
            <div className="lg:w-2/4 w-full flex flex-col place-content-center items-center">
              <p className="font-black lg:text-6xl text-3xl capitalize my-4">
                {user?.company_name}
              </p>
              <div className="lg:w-[70%] w-[100%] lg:my-6">
                <Link href={"/add-invoice"}>
                  Submit Invoice
                </Link>
              </div>
            </div>
          </div>
          <p className="max-md:text-md lg:text-xl max-md:text-text_light mt-8 mb-4 font-extrabold max-md:text-left text-center max-sm:tracking-tighter lg:tracking-tight">
            Quick Links
          </p>
          <FormGroup>
        <Link href="/add-invoice" className="flex flex-row items-center gap-4 w-full border border-bg_light rounded-lg p-4 px-8 cursor-pointer">
          <GoArrowRight size={30} />
          <p className="font-bold capitalize max-md:text-sm">Submit an invoice</p>
        </Link>
        <Link href="/milestone" className="flex flex-row items-center gap-4 w-full border border-bg_light rounded-lg p-4 px-8 cursor-pointer">
          <LuWatch size={30} />
          <p className="font-bold capitalize max-md:text-sm">Track milestones</p>
        </Link>
        <Link href="/funding-request" className="flex flex-row items-center gap-4 w-full border border-bg_light rounded-lg p-4 px-8 cursor-pointer">
          <FaRegMoneyBillAlt size={30} />
          <p className="font-bold capitalize max-md:text-sm">Request funding</p>
        </Link>
        </FormGroup>
          <p className="max-md:text-md lg:text-xl  max-md:text-text_light mt-8 mb-4 font-extrabold max-md:text-left text-center max-sm:tracking-tighter lg:tracking-tight">
            Summary
          </p>
          <FormGroup>
            <div className="flex flex-col gap-1 w-full border border-bg_light rounded-lg p-4">
              <p className=" capitalize text-text_light h-[50%]">Invoices</p>
              <p className="font-bold text-3xl capitalize">{user?.invoices.length}</p>
              <p className=" capitalize text-success"> {user?.invoices.filter(invoice => invoice.status === 'APPROVED').length ?? 0 / (user?.invoices.length ?? 0) * 100}%</p>
            </div>
            <div className="flex flex-col gap-1 w-full border border-bg_light rounded-lg p-4">
              <p className=" capitalize text-text_light h-[50%]">Funding requests</p>
              <p className="font-bold text-3xl capitalize">{user?.funding_requests.length}</p>
              <p className=" capitalize text-success"> {user?.funding_requests.filter(request => request.status === 'APPROVED').length ?? 0 / (user?.funding_requests.length ?? 0) * 100}%</p>
            </div>
            <div className="flex flex-col gap-1 w-full border border-bg_light rounded-lg p-4">
              <p className="capitalize text-text_light h-[50%]">Total funded</p>
              <p className="font-bold text-3xl capitalize">${user?.invoices.filter(invoice => invoice.status === 'APPROVED').reduce((acc, invoice) => acc + (invoice.total_price ?? 0), 0)}</p>
              <p className=" capitalize text-success">${user?.funding_requests.filter(request => request.status === 'APPROVED').reduce((acc, request) => acc + (request.requested_amount ?? 0), 0)}</p>
            </div>
            <div className="flex flex-col gap-1 w-full border border-bg_light rounded-lg p-4">
              <p className=" capitalize text-text_light h-[50%]">Upcoming payments</p>
              <p className="font-bold text-3xl capitalize">{user?.invoices.filter(invoice => invoice.status === 'PENDING').length}</p>
              <p className=" capitalize text-text_light">${user?.invoices.filter(invoice => invoice.status === 'PENDING').reduce((acc, invoice) => acc + (invoice.total_price ?? 0), 0)}</p>
            </div>
          </FormGroup>
          <p className="max-md:text-md lg:text-xl  max-md:text-text_light mt-8 mb-4 font-extrabold max-md:text-left text-center max-sm:tracking-tighter lg:tracking-tight">
            Notification
          </p>
          <div className="flex flex-col gap-6">
            <div className="flex flex-row items-center gap-2">
              <div className="bg-bg_light overflow-hidden w-14 rounded-lg">
                <Image src={"/images/not1.png"} alt="img" width={20}height={20} />
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-text">
                  Invoice {user?.invoices?.filter(invoice => invoice.status === 'PENDING')?.[0]?.description} 
                </p>
                <p className="text-xs text-text_light">Due date: {user?.invoices?.filter(invoice => invoice.status === 'PENDING')?.[0]?.due_date ? new Date(user?.invoices?.filter(invoice => invoice.status === 'PENDING')?.[0]?.due_date).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
            <div className="flex flex-row items-center gap-2">
              <div className="bg-bg_light overflow-hidden w-14 rounded-lg">
                <Image src={"/images/not2.png"} alt="img" width={20} height={20}/>
              </div>
              <div className="flex flex-col">
                <p className="text-sm text-text">Funding request #{user?.invoices?.filter(invoice => invoice.status === 'PENDING')?.[0]?.description}</p>
                <p className="text-xs text-text_light">{user?.funding_requests?.filter(request => request.status === 'PENDING')?.[0]?.requested_amount}</p>
              </div>
            </div>
          </div>
        </>
      </Container>
    </main>
  );
}

export default Dashboard;
