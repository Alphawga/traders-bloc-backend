import React from "react";
import MainHeader from "../components/headers/mainHeader.tsx";
import Container from "../components/container.tsx";
import Subtext from "../components/subtext.tsx";
// @ts-ignore
import pp from "../assets/images/pp.png";
import Button from "../components/form/button.tsx";
import Input from "../components/form/input.tsx";

function Profile() {
  return (
    <main>
      <MainHeader />
      <Container>
        <>
          <h1 className="text-3xl lg:text-4xl font-extrabold lg:my-6">
            Profile & Permissions{" "}
          </h1>
          <Subtext text="Manage your personal information, security settings, and permissions." />
          <div className="flex flex-col gap-4 items-end lg:flex-row my-6">
            <div className="w-[50%] h-[300px] overflow-hidden rounded-lg">
              <img
                src={pp}
                alt="profile-image"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="w-[50%] flex flex-col gap-2 py-4">
              <p className="text-text_light">Personal Information</p>
              <p className="font-bold text-2xl text-text">John Doe</p>
              <div className=" flex flex-row justify-between items-center">
                <p className="text-text_light">johndoe@gmail.com</p>
                <div className="w-[20%]">
                  <Button
                    text="edit"
                    className="!py-1 !bg-info"
                    onClick={() => {}}
                  />
                </div>
              </div>
            </div>
          </div>

          <h3 className="font-bold text-lg my-6">Change Password</h3>
          <div className="w-[50%]">
            <Input
              label="Current Password"
              placeholder="Enter  current password"
              onChange={() => {}}
            />
            <Input
              label="New Password"
              placeholder="Enter new password"
              onChange={() => {}}
            />
            <Input
              label="Confirm New Password"
              placeholder="Re-enter new password"
              onChange={() => {}}
            />
            <Button text="update password" onClick={() => {}} />
          </div>
          <h3 className="font-bold text-lg my-6">Two-Factor Authentication</h3>
          <Subtext text="Add an extra layer of security to your account by enabling two-factor authentication. When it's enabled, you'll need to provide a verification code in addition to your password when you sign in." />
          <div className='border border-bg_light flex flex-row justify-between p-4 px-8 my-6 rounded-lg'>
            <div className='flex flex-col w-[80%]'>
            <p className='text-text font-bold'>Two-Factor Authentication</p>
            <p className='text-text_light'>Disabled</p>
            </div>
            <div  className="w-[20%]">
            <Button text="Enable" className='!bg-info' onClick={() => {}}/>
</div>
          </div>
          <h3 className="font-bold text-lg my-6">Request Additional Permissions</h3>
          <Subtext text="Request additional permissions to access more features on TradeCo." />
          <div className="w-[20%] my-6">
          <Button text="Request Permissions" color="primary" onClick={() => {}} />
</div>
        </>
      </Container>
    </main>
  );
}

export default Profile;
