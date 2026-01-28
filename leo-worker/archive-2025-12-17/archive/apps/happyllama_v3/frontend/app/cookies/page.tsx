export default function CookiesPage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground">Last updated: January 2025</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">What Are Cookies</h2>
          <p>Cookies are small text files stored on your device when you visit our website.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Cookies</h2>
          <p>We use cookies to enhance your experience, analyze site traffic, and for marketing purposes.</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Types of Cookies We Use</h2>
          <ul>
            <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
            <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Managing Cookies</h2>
          <p>You can control cookies through your browser settings. Note that disabling certain cookies may affect website functionality.</p>
        </div>
      </div>
    </div>
  )
}