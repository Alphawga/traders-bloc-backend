import { useNavigate } from "react-router-dom";
import Button from "../components/form/button";
import { PiBuildingsThin } from "react-icons/pi";
import { CiCreditCard2 } from "react-icons/ci";
import Subtext from "../components/subtext";
import MainHeader from "../components/headers/mainHeader";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const transactionHistory = [
  { fundedAmount: 5000, date: "Jun 1, 2022" },
  { fundedAmount: 10000, date: "Jun 7, 2022" },
  { fundedAmount: 15000, date: "Jun 14, 2022" },
  { fundedAmount: 20000, date: "Jun 21, 2022" },
  { fundedAmount: 25000, date: "Jun 28, 2022" },
];

function Transaction() {
  const navigate = useNavigate();
  return (
    <>
      <MainHeader />
      <div className="w-full h-full lg:w-[90%] m-auto p-8 flex flex-col items-center justify-center mb-4">
        <p className="max-md:text-2xl lg:text-3xl font-extrabold max-md:text-center max-sm:tracking-tighter lg:tracking-tight">
          Transaction Tracking{" "}
        </p>
        <div className="max-md:w-full lg:w-[60%] flex flex-col gap-4 mt-8">
          <div className="overflow-y-scroll h-[40vh]">
            {transactionHistory.map((transaction, index) => (
              <div className="flex flex-row mt-0 gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-1 bg-secondary rounded-full w-2 h-2"></div>
                  {index !== transactionHistory.length - 1 && (
                    <div className="p-0.4 bg-bg_light w-0.5 h-10"></div>
                  )}
                </div>
                <div className="flex flex-col items-start gap-1">
                  <p className="text-sm text-left font-semibold text-text">
                    Funded ${transaction.fundedAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-left font-normal text-text_light">
                    {transaction.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div>
            <p className="max-md:text-lg mb-2 lg:text-xl font-extrabold max-md:text-center max-sm:tracking-tighter lg:tracking-tight">
              Funding Summary{" "}
            </p>
            <div className="flex flex-row justify-between mb-4">
              <div>
                <p className="text-xs text-text_light">Total Funding</p>
                <p className="text-lg text-text">$25,000</p>
              </div>{" "}
              <div>
                <p className="text-xs text-text_light">Due Date</p>
                <p className="text-lg text-text">Jul 1, 2022</p>
              </div>{" "}
              <div>
                <p className="text-xs text-text_light">Repayment Terms</p>
                <p className="text-lg text-text">30 days</p>
              </div>
            </div>
          </div>{" "}
          <Button
            text="Upload documents"
            color="primary"
            className="lg:w-[50%]"
          />
          <div className="mt-6">
            <p className="max-md:text-lg mb-2 lg:text-xl font-extrabold max-md:text-center max-sm:tracking-tighter lg:tracking-tight">
              Bank Details
            </p>
            <div className="flex flex-row gap-4 mb-4">
              <div className="bg-bg_light p-2 rounded-lg">
                <PiBuildingsThin size={30} />
              </div>
              <div>
                <p className="text-lg text-text">Bank Account</p>
                <p className="text-xs text-text_light">1234123412</p>
              </div>
            </div>
            <div className="flex flex-row gap-4 mb-4">
              <div className="bg-bg_light p-2 rounded-lg">
                <CiCreditCard2 size={30} />
              </div>
              <div>
                <p className="text-lg text-text">Card Details</p>
                <p className="text-xs text-text_light">1234 1234 1234 1234</p>
              </div>
            </div>
          </div>{" "}
          <div className="mt-4">
            <p className="mb-2 text-lg max-md:text-center">Funding Progress</p>
            <div className="w-full bg-bg_light rounded-lg overflow-hidden mb-2">
              <div className="bg_secondary bg-secondary w-[50%] rounded-lg p-1.5"></div>
            </div>
            <Subtext text="You've been funded $10,000 of the $25,000 requested." />
          </div>
          <div className="border-2 border-bg_light p-4 flex flex-row rounded-lg items-center mt-4 gap-2">
            <div className="flex flex-col gap-2 w-[80%]">
              <p>You're almost there!</p>
              <p className="text-xs text-text_light">
                If you haven't already, please upload your supporting documents
                for this transaction. Once we receive your documents and confirm
                your bank details, we'll be able to fund your remaining balance.
              </p>
            </div>
            <div className="w-[20%]">
              <Button
                text={"Upload Now"}
                color="secondary"
                onClick={() => navigate("/")}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Transaction;
