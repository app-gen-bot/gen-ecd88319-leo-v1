"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { 
  ChevronLeft,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  AlertTriangle,
  LogOut,
  Shield,
  Chrome,
  Laptop,
  MonitorSmartphone
} from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

// Mock session data
const mockSessions = [
  {
    id: "1",
    device: "Chrome on macOS",
    deviceType: "desktop",
    icon: Monitor,
    location: "San Francisco, CA",
    ipAddress: "192.168.1.100",
    lastActive: new Date(),
    isCurrent: true,
    browser: "Chrome 120",
    os: "macOS Sonoma",
  },
  {
    id: "2",
    device: "Safari on iPhone",
    deviceType: "mobile",
    icon: Smartphone,
    location: "San Francisco, CA",
    ipAddress: "192.168.1.101",
    lastActive: new Date(Date.now() - 1000 * 60 * 30),
    isCurrent: false,
    browser: "Safari 17",
    os: "iOS 17.2",
  },
  {
    id: "3",
    device: "Chrome on Windows",
    deviceType: "desktop",
    icon: Laptop,
    location: "New York, NY",
    ipAddress: "172.16.0.50",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isCurrent: false,
    browser: "Chrome 119",
    os: "Windows 11",
  },
  {
    id: "4",
    device: "Firefox on Linux",
    deviceType: "desktop",
    icon: Monitor,
    location: "London, UK",
    ipAddress: "10.0.0.25",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isCurrent: false,
    browser: "Firefox 121",
    os: "Ubuntu 22.04",
  },
  {
    id: "5",
    device: "Safari on iPad",
    deviceType: "tablet",
    icon: Tablet,
    location: "San Francisco, CA",
    ipAddress: "192.168.1.102",
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 48),
    isCurrent: false,
    browser: "Safari 17",
    os: "iPadOS 17.2",
  },
];

export default function ProfileSessionsPage() {
  const [sessions, setSessions] = useState(mockSessions);
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);
  const [showRevokeAllModal, setShowRevokeAllModal] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevokeSession = async (sessionId: string) => {
    setIsRevoking(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    setSessionToRevoke(null);
    setIsRevoking(false);
    toast.success("Session revoked successfully");
  };

  const handleRevokeAllSessions = async () => {
    setIsRevoking(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSessions(prev => prev.filter(s => s.isCurrent));
    setShowRevokeAllModal(false);
    setIsRevoking(false);
    toast.success("All other sessions revoked successfully");
  };

  const getDeviceIcon = (session: typeof mockSessions[0]) => {
    const Icon = session.icon;
    return <Icon className="h-5 w-5" />;
  };

  const getActivityStatus = (lastActive: Date) => {
    const now = new Date();
    const diff = now.getTime() - lastActive.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return { text: "Active now", color: "success" };
    if (minutes < 60) return { text: `${minutes}m ago`, color: "success" };
    if (hours < 24) return { text: `${hours}h ago`, color: "secondary" };
    return { text: `${days}d ago`, color: "secondary" };
  };

  const activeSessions = sessions.filter(s => !s.isCurrent);

  return (
    <>
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/profile">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Active Sessions</h1>
            <p className="text-muted-foreground">
              Manage devices and browsers that are signed in to your account
            </p>
          </div>
        </div>

        {/* Security Alert */}
        {sessions.length > 3 && (
          <Card className="border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/20">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <CardTitle className="text-base">Multiple Sessions Detected</CardTitle>
                  <CardDescription className="text-yellow-800 dark:text-yellow-200">
                    You have {sessions.length} active sessions. Review them to ensure they're all yours.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Current Session */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Session</CardTitle>
              <Badge variant="success">This Device</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {sessions.filter(s => s.isCurrent).map((session) => {
              const status = getActivityStatus(session.lastActive);
              return (
                <div key={session.id} className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded">
                      {getDeviceIcon(session)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="font-medium">{session.device}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.browser} • {session.os}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {session.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {session.ipAddress}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {status.text}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-600">Secure</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Other Sessions */}
        {activeSessions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Other Sessions</CardTitle>
                  <CardDescription>
                    These sessions are signed in to your account on other devices
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowRevokeAllModal(true)}
                >
                  Revoke All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeSessions.map((session, index) => {
                const status = getActivityStatus(session.lastActive);
                return (
                  <div key={session.id}>
                    {index > 0 && <div className="border-t my-4" />}
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-muted rounded">
                        {getDeviceIcon(session)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{session.device}</p>
                            <p className="text-sm text-muted-foreground">
                              {session.browser} • {session.os}
                            </p>
                          </div>
                          <Badge variant={status.color as any}>
                            {status.text}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            {session.ipAddress}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last active: {formatDateTime(session.lastActive)}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSessionToRevoke(session.id)}
                          className="mt-2"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Revoke Session
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Security Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Security Tips</CardTitle>
            <CardDescription>
              Keep your account secure by following these best practices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="mt-0.5">•</div>
              <p className="text-sm">
                Regularly review your active sessions and revoke any you don't recognize
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">•</div>
              <p className="text-sm">
                Sign out when using shared or public computers
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">•</div>
              <p className="text-sm">
                Enable two-factor authentication for additional security
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">•</div>
              <p className="text-sm">
                Use a unique, strong password for your account
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revoke Session Modal */}
      <AlertDialog open={!!sessionToRevoke} onOpenChange={() => setSessionToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign out the device from your account. The user of this device will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sessionToRevoke && handleRevokeSession(sessionToRevoke)}
              disabled={isRevoking}
            >
              {isRevoking ? "Revoking..." : "Revoke Session"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke All Sessions Modal */}
      <AlertDialog open={showRevokeAllModal} onOpenChange={setShowRevokeAllModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke All Other Sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign out all devices except the one you're currently using. You'll remain signed in on this device.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeAllSessions}
              disabled={isRevoking}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isRevoking ? "Revoking..." : "Revoke All Sessions"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}