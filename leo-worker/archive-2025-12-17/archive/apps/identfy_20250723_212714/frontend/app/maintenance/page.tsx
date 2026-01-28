import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Wrench, Clock, CheckCircle, Bell, Twitter, Globe } from "lucide-react";

export default function MaintenancePage() {
  // Mock maintenance data
  const maintenanceStart = new Date("2024-01-15T02:00:00Z");
  const maintenanceEnd = new Date("2024-01-15T04:00:00Z");
  const currentTime = new Date();
  
  // Calculate progress (mock - in real app this would be dynamic)
  const totalDuration = maintenanceEnd.getTime() - maintenanceStart.getTime();
  const elapsed = Math.min(currentTime.getTime() - maintenanceStart.getTime(), totalDuration);
  const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-orange-100 dark:bg-orange-900/20 rounded-full animate-pulse">
                <Wrench className="h-12 w-12 text-orange-600" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Scheduled Maintenance</h1>
              <p className="text-muted-foreground">
                We're currently performing scheduled maintenance to improve our services.
              </p>
            </div>
          </div>

          {/* Maintenance Details */}
          <div className="bg-muted rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Maintenance Window</span>
              </div>
              <Badge variant="outline" className="animate-pulse">In Progress</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Start Time:</span>
                <span>{formatTime(maintenanceStart)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expected End:</span>
                <span>{formatTime(maintenanceEnd)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>

          {/* What We're Doing */}
          <div className="space-y-3">
            <h2 className="font-semibold">What we're working on:</h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <span className="text-sm">System performance optimizations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <span className="text-sm">Security updates and patches</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 mt-0.5 flex items-center justify-center">
                  <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                </div>
                <span className="text-sm">Database maintenance and optimization</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 mt-0.5 flex items-center justify-center">
                  <div className="h-2 w-2 bg-gray-400 rounded-full" />
                </div>
                <span className="text-sm text-muted-foreground">Infrastructure upgrades</span>
              </li>
            </ul>
          </div>

          {/* Stay Updated */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium mb-1">Stay Updated</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get real-time updates on our maintenance progress
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/system-status">
                        <Globe className="mr-2 h-4 w-4" />
                        System Status
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://twitter.com/identfy" target="_blank" rel="noopener noreferrer">
                        <Twitter className="mr-2 h-4 w-4" />
                        @identfy
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impact Information */}
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-medium mb-2">Service Impact</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• API services are temporarily unavailable</li>
              <li>• Dashboard access is restricted</li>
              <li>• Verification requests are queued and will be processed after maintenance</li>
              <li>• No data will be lost during this maintenance window</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center space-y-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              We apologize for any inconvenience. Thank you for your patience.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/contact-sales">Contact Sales</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:support@identfy.com">Email Support</a>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Note: This import was causing an error, so I'm defining Badge inline
function Badge({ variant, className, children }: { variant: string; className?: string; children: React.ReactNode }) {
  const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors";
  const variantClasses = variant === "outline" 
    ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground" 
    : "";
  
  return (
    <div className={`${baseClasses} ${variantClasses} ${className || ""}`}>
      {children}
    </div>
  );
}