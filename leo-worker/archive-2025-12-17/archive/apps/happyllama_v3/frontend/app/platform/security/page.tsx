import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShieldCheckIcon, LockClosedIcon, KeyIcon, FingerPrintIcon } from "@heroicons/react/24/outline"

export default function SecurityPage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container">
        <div
          className="text-center mb-12"
        >
          <Badge variant="purple" className="mb-4">Security</Badge>
          <h1 className="text-4xl font-bold mb-4 sm:text-5xl md:text-6xl">
            Enterprise-Grade Security
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Bank-level security and compliance built into every application from day one.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <ShieldCheckIcon className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Compliance & Certifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>✓ HIPAA Compliant</li>
                <li>✓ GDPR Ready</li>
                <li>✓ SOC 2 Type II</li>
                <li>✓ ISO 27001</li>
                <li>✓ PCI DSS</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <LockClosedIcon className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Data Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>✓ End-to-end encryption</li>
                <li>✓ AES-256 encryption at rest</li>
                <li>✓ TLS 1.3 in transit</li>
                <li>✓ Zero-knowledge architecture</li>
                <li>✓ Regular security audits</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <KeyIcon className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Access Control</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>✓ Multi-factor authentication</li>
                <li>✓ Role-based permissions</li>
                <li>✓ SSO integration</li>
                <li>✓ API key management</li>
                <li>✓ Audit logging</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FingerPrintIcon className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Identity Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>✓ OAuth 2.0 / OIDC</li>
                <li>✓ SAML 2.0 support</li>
                <li>✓ Active Directory integration</li>
                <li>✓ Biometric authentication</li>
                <li>✓ Session management</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div
          className="mt-16 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Security First, Always</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Every application built with Happy Llama includes enterprise security features by default.
          </p>
          <Link href="/beta-signup">
            <Button size="lg" variant="gradient">
              Start Building Securely
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}