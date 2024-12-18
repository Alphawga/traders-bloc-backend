import { VendorRegistrationForm } from "@/components/vendor-registration/vendor-registration-form";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";

export default function VendorRegistration() {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <VendorRegistrationForm />
      <Footer />
    </div>
  )
}