import Link from 'next/link'

export default function PartnerWithTraders() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-900 text-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl md:text-4xl lg:text-5xl">Empower Your Vendors. Streamline Your Supply Chain.</h2>
            <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Build trust with vendors by offering financing. Eliminate supply chain delays. Powered by BlocHQ&apos;s robust fintech
              infrastructure.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Link
              className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-md bg-gray-50 px-8 text-sm font-medium text-gray-900 shadow transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-300 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
              href="/partner-enquiry"
            >
              Learn More About Partnering
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

