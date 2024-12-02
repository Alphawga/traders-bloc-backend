import Container from '@/components/container'
import Link from 'next/link'

const services = [
  {
    title: "Vendor Financing",
    description: "Quick access to capital based on your outstanding invoices and purchase orders.",
    features: [
      "48-hour approval process",
      "Competitive rates",
      "Flexible payment terms",
      "No hidden fees"
    ]
  },
  {
    title: "Supply Chain Financing",
    description: "Optimize your supply chain with our comprehensive financing solutions.",
    features: [
      "Early payments to suppliers",
      "Extended payment terms",
      "Supply chain visibility",
      "Risk management"
    ]
  },
  {
    title: "Invoice Factoring",
    description: "Convert your invoices into immediate working capital.",
    features: [
      "Same-day funding available",
      "Non-recourse options",
      "Online invoice management",
      "Professional collections"
    ]
  }
]

export default function Services() {
  return (
    <div className="bg-white">
      <Container>
        <div className="py-16 md:py-24">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
              Our Services
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive financing solutions designed to help your business grow
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {services.map((service, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-2xl font-bold text-black mb-4">{service.title}</h2>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-600">
                      <span className="w-1.5 h-1.5 bg-black rounded-full mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gray-50 p-12 rounded-lg">
            <h2 className="text-2xl font-bold text-black mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-8">
              Contact us today to learn more about our services and how we can help your business.
            </p>
            <Link 
              href="/contact"
              className="inline-flex h-10 items-center justify-center rounded-md bg-black px-8 text-sm font-medium text-white shadow transition-colors hover:bg-gray-900"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
} 