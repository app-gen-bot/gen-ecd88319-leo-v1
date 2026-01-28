"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  FileText,
  Download,
  Calendar,
  Clock,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Send,
  Search,
  Filter,
  BarChart3,
  LineChart,
  PieChart,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Mock report data
const savedReports = [
  {
    id: "1",
    name: "Monthly Executive Summary",
    type: "executive",
    schedule: "Monthly",
    lastRun: "2024-06-01",
    nextRun: "2024-07-01",
    recipients: ["ceo@identfy.com", "cto@identfy.com"],
    status: "scheduled",
  },
  {
    id: "2",
    name: "Weekly Risk Analysis",
    type: "risk",
    schedule: "Weekly",
    lastRun: "2024-06-24",
    nextRun: "2024-07-01",
    recipients: ["risk@identfy.com"],
    status: "scheduled",
  },
  {
    id: "3",
    name: "Q2 Performance Report",
    type: "performance",
    schedule: "One-time",
    lastRun: "2024-06-30",
    nextRun: null,
    recipients: ["board@identfy.com"],
    status: "completed",
  },
  {
    id: "4",
    name: "Daily Operations Dashboard",
    type: "operations",
    schedule: "Daily",
    lastRun: "2024-06-30",
    nextRun: "2024-07-01",
    recipients: ["ops@identfy.com", "support@identfy.com"],
    status: "scheduled",
  },
  {
    id: "5",
    name: "Compliance Audit Report",
    type: "compliance",
    schedule: "Quarterly",
    lastRun: "2024-04-01",
    nextRun: "2024-07-01",
    recipients: ["compliance@identfy.com", "legal@identfy.com"],
    status: "scheduled",
  },
];

const reportTemplates = [
  {
    id: "exec-summary",
    name: "Executive Summary",
    description: "High-level overview of key metrics and trends",
    icon: BarChart3,
    color: "bg-blue-500",
  },
  {
    id: "risk-analysis",
    name: "Risk Analysis",
    description: "Detailed fraud patterns and risk assessment",
    icon: LineChart,
    color: "bg-red-500",
  },
  {
    id: "performance",
    name: "Performance Report",
    description: "Verification metrics and conversion analysis",
    icon: PieChart,
    color: "bg-green-500",
  },
  {
    id: "operations",
    name: "Operations Dashboard",
    description: "Daily operational metrics and system health",
    icon: FileSpreadsheet,
    color: "bg-purple-500",
  },
  {
    id: "compliance",
    name: "Compliance Report",
    description: "Regulatory compliance and audit trails",
    icon: FileText,
    color: "bg-orange-500",
  },
];

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedTab, setSelectedTab] = useState("saved");

  const filteredReports = savedReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || report.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="default">Scheduled</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "executive":
        return <BarChart3 className="h-4 w-4" />;
      case "risk":
        return <LineChart className="h-4 w-4" />;
      case "performance":
        return <PieChart className="h-4 w-4" />;
      case "operations":
        return <FileSpreadsheet className="h-4 w-4" />;
      case "compliance":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Custom Reports</h1>
          <p className="text-muted-foreground mt-1">
            Create, schedule, and manage custom reports for your team
          </p>
        </div>
        <Button asChild>
          <Link href="/analytics/reports/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Report
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className="relative h-48">
          <Image
            src="/images/stock/dall-e-3_Professional_business_analyst_850b0ecf_20250724_013646.png"
            alt="Business analyst reviewing reports"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background to-transparent" />
          <div className="absolute inset-0 flex items-center p-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Data-Driven Insights</h2>
              <p className="text-muted-foreground max-w-lg">
                Create custom reports tailored to your business needs. Schedule automated
                delivery to keep stakeholders informed.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="saved">Saved Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="saved" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="risk">Risk Analysis</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>

          {/* Reports Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(report.type)}
                          <Link
                            href={`/analytics/reports/${report.id}`}
                            className="font-medium hover:underline"
                          >
                            {report.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{report.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {report.schedule}
                        </div>
                      </TableCell>
                      <TableCell>{report.lastRun}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/analytics/reports/${report.id}`}>
                                <FileText className="mr-2 h-4 w-4" />
                                View Report
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/analytics/reports/${report.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="mr-2 h-4 w-4" />
                              Send Now
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reportTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <Card
                  key={template.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${template.color} text-white`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm">
                        Preview
                      </Button>
                      <Button size="sm" asChild>
                        <Link href={`/analytics/reports/new?template=${template.id}`}>
                          Use Template
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Custom Template Creation */}
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Template</CardTitle>
              <CardDescription>
                Build your own report template from scratch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link href="/analytics/reports/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Custom Report
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Reports that will be automatically generated and sent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {savedReports
                  .filter(report => report.status === "scheduled")
                  .map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded ${
                          report.type === "executive" ? "bg-blue-100" :
                          report.type === "risk" ? "bg-red-100" :
                          report.type === "performance" ? "bg-green-100" :
                          report.type === "operations" ? "bg-purple-100" :
                          "bg-orange-100"
                        }`}>
                          {getTypeIcon(report.type)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{report.name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Next: {report.nextRun}
                            </span>
                            <span>{report.recipients.length} recipients</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Edit Schedule
                        </Button>
                        <Button variant="ghost" size="sm">
                          Pause
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Schedule</CardTitle>
              <CardDescription>
                Reports scheduled for the next 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2">
                  <span className="text-sm font-medium">Today (July 1)</span>
                  <Badge>3 reports</Badge>
                </div>
                <div className="flex justify-between items-center p-2">
                  <span className="text-sm">July 2</span>
                  <Badge variant="secondary">1 report</Badge>
                </div>
                <div className="flex justify-between items-center p-2">
                  <span className="text-sm">July 3</span>
                  <Badge variant="secondary">1 report</Badge>
                </div>
                <div className="flex justify-between items-center p-2">
                  <span className="text-sm">July 7</span>
                  <Badge variant="secondary">2 reports</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>
                Previously generated reports and their delivery status
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Delivery Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">June Executive Summary</span>
                      </div>
                    </TableCell>
                    <TableCell>2024-06-01 09:00 AM</TableCell>
                    <TableCell>2 recipients</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Delivered</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <LineChart className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Weekly Risk Analysis - W25</span>
                      </div>
                    </TableCell>
                    <TableCell>2024-06-24 08:00 AM</TableCell>
                    <TableCell>1 recipient</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Delivered</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Daily Operations - June 30</span>
                      </div>
                    </TableCell>
                    <TableCell>2024-06-30 06:00 AM</TableCell>
                    <TableCell>2 recipients</TableCell>
                    <TableCell>
                      <Badge variant="destructive">Failed</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          Retry
                        </Button>
                        <Button variant="ghost" size="sm">
                          View Error
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}