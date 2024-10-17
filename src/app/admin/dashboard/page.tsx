import React from "react";
import MainHeader from "@/components/headers/mainHeader";
import Container from "@/components/container";
import { IoSearchOutline } from "react-icons/io5";
import Task from "@/components/task";
import DashboardCard from "@/components/card/dashboardCard";

function Dashboard() {
  const Tasks = [
    { name: "All" },
    { name: "Due in 7days" },
    { name: "Overdue" },
    { name: "KYC Review" },
    { name: "Invoice Approval" },
    { name: "Pending Funding" },
  ];
  const Tasks2 = [{ name: "All" }, { name: "Pending" }, { name: "Reviewed" }];
  return (
    <main>
      <MainHeader />
      <Container>
        <div className="w-full lg:w-[80%] m-auto">
          <h1 className="text-3xl lg:text-4xl font-extrabold lg:my-8">
            Welcome back, Ariana
          </h1>
          <div className="w-full bg-bg_light rounded-xl mt-5 lg:mt-20 flex flex-row px-4 items-center">
            <IoSearchOutline size={25} className="text-text w-[10%]" />
            <input
              type="text"
              placeholder="Search  for invoices, tasks, or companies"
              className="bg-transparent p-4 w-[90%]"
            />
          </div>
          <h2 className="font-bold my-7 text-2xl">Your Tasks</h2>
          <div className="flex flex-row my-4 gap-4 overflow-hidden overflow-x-scroll">
            {Tasks.map((items) => (
              <Task text={items.name} />
            ))}
          </div>
          <h2 className="font-bold my-7 text-2xl">Sort by status</h2>
          <div className="flex flex-row my-4 gap-4">
            {Tasks2.map((items) => (
              <Task text={items.name} />
            ))}
          </div>
          <h2 className="font-bold my-7 text-2xl">Notification</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardCard />
            <DashboardCard />
            <DashboardCard />
            <DashboardCard />
          </div>
        </div>
      </Container>
    </main>
  );
}

export default Dashboard;
