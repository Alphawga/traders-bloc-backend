import Link from "next/link";
import { Button } from "../ui/button";

export default function FinalCTABanner() {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-900 text-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to empower your vendors and keep operations running?
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Contact us today!
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button asChild variant="outline">
                <Link href="#contact-form">Contact Us to Partner Today</Link>
              </Button>
              
            </div>
          </div>
        </div>
      </section>
    )
  }