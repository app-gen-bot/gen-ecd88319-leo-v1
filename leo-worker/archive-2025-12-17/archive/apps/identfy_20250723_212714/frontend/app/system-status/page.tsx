"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Activity,
  RefreshCw,
  Calendar,
  Clock,
  Globe,
  Server,
  Database,
  Shield,
  Zap,
  WifiOff,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from "lucide-react";

// Mock service status data
const services = [
  {
    name: "Identity Verification API",
    status: "operational",
    uptime: 99.98,
    responseTime: 124,
    region: "Global",
    icon: Shield,
  },
  {
    name: "Document Processing",
    status: "operational",
    uptime: 99.95,
    responseTime: 285,
    region: "Global",
    icon: Activity,
  },
  {
    name: "Biometric Services",
    status: "operational",
    uptime: 99.99,
    responseTime: 198,
    region: "Global",
    icon: Zap,
  },
  {
    name: "Risk Assessment Engine",
    status: "operational",
    uptime: 100,
    responseTime: 89,
    region: "Global",
    icon: AlertTriangle,
  },
  {
    name: "Database Services",
    status: "operational",
    uptime: 99.97,
    responseTime: 42,
    region: "US East",
    icon: Database,
  },
  {
    name: "CDN & Static Assets",
    status: "operational",
    uptime: 100,
    responseTime: 18,
    region: "Global",
    icon: Globe,
  },
];

const incidents = [
  {
    id: "INC-2024-001",
    title: "Elevated API Response Times",
    status: "resolved",
    severity: "minor",
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 48),
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 47),
    affectedServices: ["Identity Verification API"],
    description: "API response times were elevated due to increased traffic. Auto-scaling resolved the issue.",
  },
  {
    id: "INC-2024-002",
    title: "Document Processing Delays",
    status: "resolved",
    severity: "major",
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 72),
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 70),
    affectedServices: ["Document Processing"],
    description: "OCR service experienced delays. Issue was resolved by deploying additional processing nodes.",
  },
];

const maintenanceSchedule = [
  {
    id: "MAINT-2024-001",
    title: "Database Maintenance Window",
    scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    duration: "2 hours",
    affectedServices: ["Database Services"],
    impact: "minimal",
  },
  {
    id: "MAINT-2024-002",
    title: "Security Updates",
    scheduledTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    duration: "30 minutes",
    affectedServices: ["All Services"],
    impact: "none",
  },
];

export default function SystemStatusPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdated(new Date());
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "outage":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge variant="success">Operational</Badge>;
      case "degraded":
        return <Badge variant="warning">Degraded</Badge>;
      case "outage":
        return <Badge variant="destructive">Outage</Badge>;
      case "resolved":
        return <Badge variant="secondary">Resolved</Badge>;
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "minor":
        return <Badge variant="outline">Minor</Badge>;
      case "major":
        return <Badge variant="warning">Major</Badge>;
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      default:
        return null;
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "none":
        return <Badge variant="success">No Impact</Badge>;
      case "minimal":
        return <Badge variant="outline">Minimal Impact</Badge>;
      case "moderate":
        return <Badge variant="warning">Moderate Impact</Badge>;
      case "severe":
        return <Badge variant="destructive">Severe Impact</Badge>;
      default:
        return null;
    }
  };

  const formatDuration = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const overallStatus = services.every(s => s.status === "operational") ? "operational" : "degraded";
  const averageUptime = services.reduce((acc, s) => acc + s.uptime, 0) / services.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold">
                I
              </div>
              <span className="font-bold text-xl">Identfy</span>
            </Link>
            <Button variant="ghost" asChild>
              <Link href="/sign-in">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Title Section */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">System Status</h1>
            <p className="text-muted-foreground">
              Real-time status of Identfy services and infrastructure
            </p>
          </div>

          {/* Overall Status */}
          <Card className={overallStatus === "operational" ? "border-green-200 dark:border-green-900" : "border-yellow-200 dark:border-yellow-900"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(overallStatus)}
                  <div>
                    <CardTitle>
                      {overallStatus === "operational" ? "All Systems Operational" : "Some Systems Experiencing Issues"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3" />
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />
                    {autoRefresh ? "Auto-refresh On" : "Auto-refresh Off"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{averageUptime.toFixed(2)}%</p>
                  <p className="text-sm text-muted-foreground">Average Uptime</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{services.filter(s => s.status === "operational").length}/{services.length}</p>
                  <p className="text-sm text-muted-foreground">Services Operational</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{incidents.filter(i => i.status === "resolved" && i.endTime && i.endTime > new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)).length}</p>
                  <p className="text-sm text-muted-foreground">Incidents This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Status Grid */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Service Status</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <Card key={service.name}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <CardTitle className="text-base">{service.name}</CardTitle>
                        </div>
                        {getStatusBadge(service.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Uptime</span>
                          <span className="font-medium">{service.uptime}%</span>
                        </div>
                        <Progress value={service.uptime} className="h-2" />
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Response Time</span>
                            <p className="font-medium">{service.responseTime}ms</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Region</span>
                            <p className="font-medium">{service.region}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Recent Incidents */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Incidents</h2>
            {incidents.length > 0 ? (
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <Card key={incident.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{incident.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3" />
                            {incident.startTime.toLocaleDateString()} at {incident.startTime.toLocaleTimeString()}
                            {incident.endTime && ` - Duration: ${formatDuration(incident.startTime, incident.endTime)}`}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(incident.severity)}
                          {getStatusBadge(incident.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Affected:</span>
                        {incident.affectedServices.map((service) => (
                          <Badge key={service} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent incidents reported</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Scheduled Maintenance */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Scheduled Maintenance</h2>
            {maintenanceSchedule.length > 0 ? (
              <div className="space-y-4">
                {maintenanceSchedule.map((maintenance) => (
                  <Card key={maintenance.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{maintenance.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3" />
                            {maintenance.scheduledTime.toLocaleDateString()} at {maintenance.scheduledTime.toLocaleTimeString()}
                          </CardDescription>
                        </div>
                        {getImpactBadge(maintenance.impact)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Duration: {maintenance.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4 text-muted-foreground" />
                          <span>Affected: {maintenance.affectedServices.join(", ")}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <Activity className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <p className="text-muted-foreground">No scheduled maintenance</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Historical Uptime */}
          <Card>
            <CardHeader>
              <CardTitle>90-Day Uptime History</CardTitle>
              <CardDescription>
                Service availability over the past 90 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{service.name}</span>
                      <span className="text-sm text-muted-foreground">{service.uptime}%</span>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 90 }).map((_, i) => {
                        // Mock data: random uptime for demonstration
                        const dayStatus = Math.random() > 0.02 ? "operational" : "degraded";
                        return (
                          <div
                            key={i}
                            className={`w-1 h-4 rounded-sm ${
                              dayStatus === "operational" ? "bg-green-600" : "bg-yellow-600"
                            }`}
                            title={`Day ${90 - i}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                <span>90 days ago</span>
                <span>Today</span>
              </div>
            </CardContent>
          </Card>

          {/* Subscribe Section */}
          <Card>
            <CardHeader>
              <CardTitle>Stay Informed</CardTitle>
              <CardDescription>
                Get notified about system status updates and scheduled maintenance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4">
                    Subscribe to receive email notifications for:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Major service disruptions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Scheduled maintenance windows
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Service performance updates
                    </li>
                  </ul>
                </div>
                <div className="flex items-center">
                  <Button>Subscribe to Updates</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center space-y-4 pb-8">
            <p className="text-sm text-muted-foreground">
              For technical support, please contact our team at support@identfy.com
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/terms">Terms of Service</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/privacy">Privacy Policy</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}