'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Container from './container'

export default function Hero() {
  return (
    <Container>
      <div className="relative py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center space-y-4"
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter text-black sm:text-5xl xl:text-6xl/none">
                Get Paid in 48 Hours with Traders Vendor Financing
              </h1>
              <p className="max-w-[600px] text-gray-600 md:text-xl">
                Streamline cash flow with fast, milestone-based financing for vendors.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex h-10 items-center justify-center rounded-md bg-black px-8 text-sm font-medium text-white shadow transition-colors hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black"
              >
                Get Started Now
              </Link>
              
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <Image src="/svgs/Revenue-bro.svg" alt="Revenue Bro" width={500} height={300} />
          </motion.div>
        </div>
      </div>
    </Container>
  )
}

