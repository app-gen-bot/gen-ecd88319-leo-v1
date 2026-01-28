"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { 
  ChevronLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Search,
  Filter,
  Globe,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  Calendar,
  ChevronRight,
  Info
} from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

// Mock login history data
const mockLoginHistory = [
  {
    id: "1",
    timestamp: new Date(),
    device: "Chrome on macOS",
    deviceType: "desktop",
    location: "San Francisco, CA, US",
    ipAddress: "192.168.1.100",
    status: "success",
    method: "password",
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    device: "Safari on iPhone",
    deviceType: "mobile",
    location: "San Francisco, CA, US",
    ipAddress: "192.168.1.101",
    status: "success",
    method: "biometric",
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
    device: "Chrome on Windows",
    deviceType: "desktop",
    location: "New York, NY, US",
    ipAddress: "172.16.0.50",
    status: "failed",
    method: "password",
    failureReason: "Invalid password",
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    device: "Firefox on Linux",
    deviceType: "desktop",
    location: "London, UK",
    ipAddress: "10.0.0.25",
    status: "success",
    method: "2fa",
  },
  {
    id: "5",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    device: "Unknown Browser",
    deviceType: "unknown",
    location: "Moscow, Russia",
    ipAddress: "185.220.101.45",
    status: "blocked",
    method: "password",
    failureReason: "Suspicious location",
  },
  {
    id: "6",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72),
    device: "Safari on iPad",
    deviceType: "tablet",
    location: "San Francisco, CA, US",
    ipAddress: "192.168.1.102",
    status: "success",
    method: "password",
  },
  {
    id: "7",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96),
    device: "Chrome on Android",
    deviceType: "mobile",
    location: "Los Angeles, CA, US",
    ipAddress: "192.168.1.103",
    status: "success",
    method: "fingerprint",
  },
  {
    id: "8",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120),
    device: "Edge on Windows",
    deviceType: "desktop",
    location: "Chicago, IL, US",
    ipAddress: "172.16.0.75",
    status: "failed",
    method: "password",
    failureReason: "Account locked",
  },
];

export default function LoginHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter login history
  const filteredHistory = mockLoginHistory.filter((item) => {
    const matchesSearch = 
      item.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ipAddress.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesDevice = deviceFilter === "all" || item.deviceType === deviceFilter;

    return matchesSearch && matchesStatus && matchesDevice;
  });

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "blocked":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge variant="success">Success</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "blocked":
        return <Badge variant="warning">Blocked</Badge>;
      default:
        return null;
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "desktop":
        return <Monitor className="h-4 w-4" />;
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      case "tablet":
        return <Tablet className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const exportHistory = () => {
    const csv = [
      ["Timestamp", "Device", "Location", "IP Address", "Status", "Method", "Failure Reason"],
      ...filteredHistory.map(item => [
        item.timestamp.toISOString(),
        item.device,
        item.location,
        item.ipAddress,
        item.status,
        item.method,
        item.failureReason || ""
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "login-history.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Login history exported");
  };

  const suspiciousAttempts = mockLoginHistory.filter(
    item => item.status === "blocked" || (item.status === "failed" && item.timestamp > new Date(Date.now() - 1000 * 60 * 60 * 24 * 7))
  ).length;

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/profile">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Login History</h1>
          <p className="text-muted-foreground">
            Review all login attempts to your account
          </p>
        </div>
        <Button variant="outline" onClick={exportHistory}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Security Alert */}
      {suspiciousAttempts > 0 && (
        <Card className="border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <CardTitle className="text-base">Suspicious Activity Detected</CardTitle>
                <CardDescription className="text-yellow-800 dark:text-yellow-200">
                  {suspiciousAttempts} suspicious login {suspiciousAttempts === 1 ? 'attempt' : 'attempts'} in the last 7 days. Review your security settings.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile/security">Review Security Settings</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by device, location, or IP"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="device">Device Type</Label>
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger id="device">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="tablet">Tablet</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Login History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Login Attempts</CardTitle>
          <CardDescription>
            Showing {paginatedHistory.length} of {filteredHistory.length} login attempts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDateTime(item.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(item.deviceType)}
                        <span className="text-sm">{item.device}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{item.location}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.ipAddress}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {item.method}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      {item.failureReason && (
                        <div className="flex items-center gap-1">
                          <Info className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {item.failureReason}
                          </span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {paginatedHistory.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No login attempts found matching your filters</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle>What to Look For</CardTitle>
          <CardDescription>
            Signs of suspicious activity in your login history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Unfamiliar Locations</p>
              <p className="text-xs text-muted-foreground">
                Login attempts from countries or cities you haven't visited
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Unknown Devices</p>
              <p className="text-xs text-muted-foreground">
                Browsers or devices you don't recognize or use
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Failed Attempts</p>
              <p className="text-xs text-muted-foreground">
                Multiple failed login attempts, especially from the same IP
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Unusual Times</p>
              <p className="text-xs text-muted-foreground">
                Login attempts at times when you're usually not active
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}