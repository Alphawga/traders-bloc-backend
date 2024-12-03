import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HeroSection() {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Fast Cash Flow Solutions to Keep Your Supply Chain Moving
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Partner with Traders to provide quick, milestone-based financing for your vendors, ensuring uninterrupted operations and optimized supply chain performance.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild>
                <Link href="#contact-form">Contact Us to Partner Today</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/vendor-registration">Register as a Vendor</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }