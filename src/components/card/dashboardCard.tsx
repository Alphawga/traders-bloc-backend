import React from "react";
import Image from "next/image";
import Link from "next/link";
import Subtext from "../subtext";

function DashboardCard() {
  return (
    <div>
      <div className="w-full rounded-lg overflow-hidden mb-2">
       <Image src={"/dash1.png"} alt="img" width={100} height={100} />
      </div>
      <div className="w-full flex flex-col gap-2">
        <h2 className="font-semibold">
          Pending KYC Review: 3 New Applications
        </h2>
        <p className="text-sm text-text_light">
          KYC reviews are required for new suppliers and buyers that you have
          invited.
        </p>
        <Link href="/">
          <Subtext text="View Post" />
        </Link>
      </div>
    </div>
  );
}

export default DashboardCard;
