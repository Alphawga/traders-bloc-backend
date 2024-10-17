"use client";

import {  useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { trpc } from "@/app/_providers/trpc-provider";
import Button from "@/components/form/button";
import Input from "@/components/form/input";
import SignupHeader from "@/components/headers/signupHeader";
import { useToast } from "@/hooks/use-toast";


function Signup() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [ company_name, setCompany_name] = useState("");
  const [tax_id, setTax_id] = useState("");
  const [industry, setIndustry] = useState("");
  const [isTerms, setIsTerms] = useState(false);

  const addUser = trpc.registerUser.useMutation({
    onSuccess: async () => {
      toast({
        title: "User created successfully",
        variant: "default",
      });
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
       toast({
        title: "Failed to sign in after registration",
        variant: "destructive",
      });
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error) => {
      toast({
        title: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    const data = {
      first_name,
      last_name,
      phone_number,
      email,
      password,
      company_name,
      tax_id,
      industry,
      isTerms,
    };
    addUser.mutate(data);
  };

  return (
    <>
      <SignupHeader />
      <div className="w-full h-full lg:w-[80%] m-auto p-8 flex flex-col items-center justify-center gap-10">
        <p className="max-md:text-3xl lg:text-4xl font-extrabold max-md:text-center max-sm:tracking-tighter lg:tracking-tight">
          Create your Traders Account
        </p>
        <div className="lg:w-[50%]">
          <Input
            type="text"
            label={"First name"}
            value={first_name}
            onChange={(e:  React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFirst_name(e.target.value)}
          />    
          <Input
            type="text"
            label={"Last name"}
            value={last_name}
            onChange={(e:  React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setLast_name(e.target.value)}
          />
          <Input
            type="text"
            label={"Phone number"}
            value={phone_number}
            onChange={(e:  React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setPhone_number(e.target.value)}
          />
          <Input
            type="email"
            label={"Email address"}
            onChange={(e:  React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            label={"Password"}
            value={password}
            onChange={(e:  React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setPassword(e.target.value)}
            subText="Password must be 8 characters or longer and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
          />
          <Input
            type="password"
            label={"Confirm Password"}
            value={confirmPassword}
            onChange={(e:  React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setConfirmPassword(e.target.value)}
          />
          <Input
            label={"Company details"}
            value={company_name}
            onChange={(e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setCompany_name(e.target.value)}
          />
          <Input
            label={"Industry"}
            value={industry}
            type="textarea"
            onChange={(e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setIndustry(e.target.value)}
          />
          <Input
            label={"Tax ID"}
            value={tax_id}
            onChange={(e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setTax_id(e.target.value)}
          />

          <div className="flex flex-row gap-3 my-3">
          <label className="flex items-center space-x-2">
  <input
    type="checkbox"
    id="terms"
    checked={isTerms}
    onChange={(e) => setIsTerms(e.target.checked)}
    className="form-checkbox h-5 w-5 text-blue-600"
  />
  <span>I agree to the terms and conditions</span>
</label>
          </div>
          <Button text="Create account" onClick={handleSignUp} />
          <p className="max-md:text-xs lg:text-sm text-text_light m-2 text-center">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy
          </p>
        </div>
      </div>
    </>
  );
}

export default Signup;