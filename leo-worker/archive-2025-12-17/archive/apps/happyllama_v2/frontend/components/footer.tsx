"use client"

import Link from 'next/link'

const productLinks = [
  { name: 'How It Works', href: '/how-it-works' },
  { name: "Why It's Different", href: '/why-different' },
  { name: 'Documentation', href: '/resources/documentation' },
  { name: 'API Reference', href: '/resources/api-reference' },
  { name: 'Pricing', href: '#', comingSoon: true },
]

const resourceLinks = [
  { name: 'Blog', href: '#', comingSoon: true },
  { name: 'Case Studies', href: '/resources/case-studies' },
  { name: 'Whitepapers', href: '/resources/whitepapers' },
  { name: 'Webinars', href: '/resources/webinars' },
]

const companyLinks = [
  { name: 'About', href: '/about' },
  { name: 'Team', href: '/about/team' },
  { name: 'Careers', href: '/about/careers' },
  { name: 'Contact', href: '/contact' },
  { name: 'Press Kit', href: '#', comingSoon: true },
]

const legalLinks = [
  { name: 'Privacy Policy', href: '/legal/privacy' },
  { name: 'Terms of Service', href: '/legal/terms' },
  { name: 'Cookie Policy', href: '/legal/cookies' },
  { name: 'Security', href: '#', comingSoon: true },
]

const socialLinks = [
  { name: 'Twitter', href: 'https://twitter.com/happyllama', icon: '🐦' },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/happyllama', icon: '💼' },
  { name: 'GitHub', href: 'https://github.com/happyllama', icon: '💻' },
  { name: 'YouTube', href: 'https://youtube.com/@happyllama', icon: '📺' },
]

export default function Footer() {
  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault()
    alert('Coming Soon! We\'re working on this feature.')
  }

  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🦙</span>
              </div>
              <span className="text-xl font-bold text-white">Happy Llama</span>
            </Link>
            <p className="text-sm leading-6 text-gray-300">
              Democratizing application development with production-grade AI. Transform your ideas into enterprise-ready apps without coding.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <span className="text-xl">{item.icon}</span>
                </a>
              ))}
            </div>
            
            {/* PlanetScale Attribution */}
            <div className="pt-4 border-t border-gray-800">
              <p className="text-xs text-gray-400">
                Powered by{' '}
                <a
                  href="https://planetscale.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  PlanetScale
                </a>
              </p>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Product</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {productLinks.map((item) => (
                    <li key={item.name}>
                      {item.comingSoon ? (
                        <button
                          onClick={handleComingSoon}
                          className="text-sm leading-6 text-gray-300 hover:text-white transition-colors text-left"
                        >
                          {item.name}
                        </button>
                      ) : (
                        <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white transition-colors">
                          {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Resources</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {resourceLinks.map((item) => (
                    <li key={item.name}>
                      {item.comingSoon ? (
                        <button
                          onClick={handleComingSoon}
                          className="text-sm leading-6 text-gray-300 hover:text-white transition-colors text-left"
                        >
                          {item.name}
                        </button>
                      ) : (
                        <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white transition-colors">
                          {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {companyLinks.map((item) => (
                    <li key={item.name}>
                      {item.comingSoon ? (
                        <button
                          onClick={handleComingSoon}
                          className="text-sm leading-6 text-gray-300 hover:text-white transition-colors text-left"
                        >
                          {item.name}
                        </button>
                      ) : (
                        <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white transition-colors">
                          {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {legalLinks.map((item) => (
                    <li key={item.name}>
                      {item.comingSoon ? (
                        <button
                          onClick={handleComingSoon}
                          className="text-sm leading-6 text-gray-300 hover:text-white transition-colors text-left"
                        >
                          {item.name}
                        </button>
                      ) : (
                        <Link href={item.href} className="text-sm leading-6 text-gray-300 hover:text-white transition-colors">
                          {item.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-gray-400">
            &copy; 2025 Happy Llama. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}