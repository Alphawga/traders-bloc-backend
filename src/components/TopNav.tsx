import Link from 'next/link'

export default function TopNav() {
  return (
    <header className="w-full py-4 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-xl font-bold">Traders</span>
        </Link>
        {/* <nav className="hidden md:flex space-x-4">
          <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
          <Link href="/services" className="text-gray-600 hover:text-gray-900">Services</Link>
          <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
        </nav> */}
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-gray-600 hover:text-gray-900">Login</Link>
          <Link href="/sign-up" className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800">Sign Up</Link>
        </div>
      </div>
    </header>
  )
}

