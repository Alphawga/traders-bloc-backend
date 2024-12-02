import TopNav from '@/components/TopNav'
import Hero from '@/components/Hero'
import VendorFinancingOverview from '@/components/VendorFinancingOverview'
import PartnerWithTraders from '@/components/PartnerWithTraders'
import AboutTraders from '@/components/AboutTraders'
import FinalCTA from '@/components/FinalCTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-black">
      <TopNav />
      <main className="flex-grow">
        <Hero />
        <VendorFinancingOverview />
        <PartnerWithTraders />
        <AboutTraders />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}

