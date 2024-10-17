
import { VscBell } from "react-icons/vsc";
import { CiMenuBurger } from "react-icons/ci";
import React, {useState} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

function MainHeader() {
  const [open, setOpen] = useState(false)
  const router = useRouter();
  const links = [
    { title: "Home", url: "/dashboard" },
    { title: "KYC", url: "/kyc" },
    { title: "Invoice", url: "/invoices" },
    { title: "Milestone", url: "/milestone" },
    { title: "Funding", url: "/funding-request" },
  ];
  return (
    <div className="border-b border-b-bg-light relative px-12 p-4 flex flex-row items-center justify-between">
      <p className="font-extrabold text-xl tracking-tight w-[50%] lg:w-[20%]">
        Traders by bloc 
      </p>
      <div className="hidden lg:block w-[50%] lg:w-[80%]">
        <ul className="flex flex-row justify-end items-center text-sm gap-6">
          {links.map(({ title, url }) => (
            <li onClick={() => router.push(`${url}`)} key={url} className="cursor-pointer">
              {title}
            </li>
          ))}
          <div className="bg-bg_light p-2 rounded-xl cursor-pointer">
            <VscBell size={17} />
          </div>
          <div
            className="bg-bg_light rounded-full cursor-pointer overflow-hidden"
            onClick={() => router.push("/profile")}
          >
            <Image
              src={"/profileImg.png"}
              alt="profile-image"
              className="object-contain w-[40px] h-[40px]"
              width={30}
              height={30}
            />
          </div>
        </ul>
      </div>
      <div className="lg:hidden">
        <CiMenuBurger size={18} onClick={() => setOpen(!open)}/>
          
          {open && <ul className="absolute w-full h-[70vh] left-0 top-20 bg-bg_light flex flex-col text-center list-none">{ links.map(({ title, url }) => (
            <li onClick={() => router.push(`${url}`)} key={url} className="cursor-pointer my-8">
              {title}
            </li>
            
          ))}
          </ul>}
           
         
      </div>
    </div>
  );
}

export default MainHeader;
