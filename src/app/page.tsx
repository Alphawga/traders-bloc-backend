'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TopNav from '@/components/TopNav'
import Hero from '@/components/Hero'
import VendorFinancingOverview from '@/components/VendorFinancingOverview'
import PartnerWithTraders from '@/components/PartnerWithTraders'
import AboutTraders from '@/components/AboutTraders'
import FinalCTA from '@/components/FinalCTA'
import Footer from '@/components/Footer'

export default function Home() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  // Handle scroll event to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true)
      } else {
        setShowBackToTop(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Smooth scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

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

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-black text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-800 transition-colors z-50"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 10l7-7m0 0l7 7m-7-7v18" 
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

