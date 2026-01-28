import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  BuildingOfficeIcon,
  ShieldCheckIcon,
  UsersIcon,
  CpuChipIcon,
  DocumentCheckIcon,
  HeartIcon
} from "@heroicons/react/24/outline"

export default function EnterprisePage() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="container">
        <div
          className="text-center mb-12"
        >
          <Badge variant="purple" className="mb-4">Enterprise</Badge>
          <h1 className="text-4xl font-bold mb-4 sm:text-5xl md:text-6xl">
            Enterprise-Ready From Day One
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Happy Llama provides the governance, security, and compliance that enterprises 
            demand, with the speed and innovation that developers love.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
          <Card>
            <CardHeader>
              <BuildingOfficeIcon className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Enterprise Scale</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Handle millions of users and transactions with auto-scaling infrastructure 
                and enterprise-grade performance.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <ShieldCheckIcon className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Security & Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                SOC 2, HIPAA, GDPR compliant with end-to-end encryption and comprehensive 
                audit logging.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <UsersIcon className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Team Collaboration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Role-based access control, version management, and real-time collaboration 
                for distributed teams.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CpuChipIcon className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Custom Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Seamlessly integrate with your existing systems including SAP, Salesforce, 
                and custom APIs.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <DocumentCheckIcon className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Governance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Complete documentation, change management, and approval workflows for 
                regulated industries.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <HeartIcon className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Dedicated Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                24/7 priority support with dedicated success managers and SLA guarantees.
              </p>
            </CardContent>
          </Card>
        </div>

        <div
          className="text-center bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-12"
        >
          <h2 className="text-3xl font-bold mb-4">Ready for Enterprise Innovation?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join leading enterprises who are transforming their development with Happy Llama.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/beta-signup">
              <Button size="lg" variant="gradient">
                Start Enterprise Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Schedule Demo
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}