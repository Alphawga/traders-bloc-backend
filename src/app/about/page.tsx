import Container from '@/components/container'


export default function About() {
  return (
    <div className="bg-white">
      <Container>
        <div className="py-16 md:py-24">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
              About Traders
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We&apos;re revolutionizing vendor financing with technology-driven solutions 
              that help businesses thrive in today&apos;s dynamic market.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div className="bg-gray-50 p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-black mb-4">Our Mission</h2>
              <p className="text-gray-600">
                To empower businesses with flexible financing solutions that accelerate 
                growth and foster sustainable partnerships.
              </p>
            </div>
            <div className="bg-gray-50 p-8 rounded-lg">
              <h2 className="text-2xl font-bold text-black mb-4">Our Vision</h2>
              <p className="text-gray-600">
                To become the leading platform for vendor financing, making business 
                growth accessible to companies of all sizes.
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-black text-center mb-12">
              Our Leadership Team
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((member) => (
                <div key={member} className="text-center">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4" />
                  <h3 className="font-semibold text-black">John Doe</h3>
                  <p className="text-gray-600">CEO & Founder</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
} 