'use client'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Container from './container'

export default function VendorFinancingOverview() {
  return (
    <div className="bg-gray-100">
      <Container>
        <div className="py-12 md:py-24 lg:py-32">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-center space-y-4"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter text-black sm:text-4xl md:text-5xl">
                  Simplify Vendor Financing in Just 3 Steps
                </h2>
                <ul className="space-y-4 text-gray-600">
                  <motion.li 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-black"/>
                    <span>Apply for financing.</span>
                  </motion.li>
                  <motion.li 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex items-center space-x-3"
                  >
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-black"/>
                    <span>Set milestones.</span>
                  </motion.li>
                  <motion.li 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex items-center space-x-3"
                  >
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-black"/>
                    <span>48-hour approval.</span>
                  </motion.li>
                </ul>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link
                  className="inline-flex h-10 items-center justify-center rounded-md bg-black px-8 text-sm font-medium text-white shadow transition-colors hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black"
                  href="/vendor-onboarding"
                >
                  Get Started Now
                </Link>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center justify-center"
            >
              <Image src="/svgs/To-do-list-rafiki.svg" alt="Checklist Bro" width={500} height={300} />
            </motion.div>
          </div>
        </div>
      </Container>
    </div>
  )
}

