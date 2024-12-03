import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

export default function ContactFormSection() {
    return (
      <section id="contact-form" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Let&apos;s Build the Future of Supply Chains Together</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Get in touch today to explore how Traders can transform your vendor financing.
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-[500px] mt-8">
            <form className="space-y-4">
              <Input placeholder="Name" required />
              <Input placeholder="Organization Name" required />
              <Input type="email" placeholder="Email" required />
              <Input type="tel" placeholder="Phone (Optional)" />
              <Textarea placeholder="Message" required />
              <Button type="submit" className="w-full">Submit Inquiry</Button>
            </form>
          </div>
        </div>
      </section>
    )
  }