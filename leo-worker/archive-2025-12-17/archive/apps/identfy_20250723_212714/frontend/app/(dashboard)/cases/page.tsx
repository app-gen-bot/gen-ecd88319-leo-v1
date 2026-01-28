"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Filter,
  Download,
  UserCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Users,
  X
} from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { ProgressDialog, useProgressOperation } from "@/components/progress-dialog";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock case data with profile images
const mockCases = [
  {
    id: "CASE-001",
    name: "John Smith",
    email: "john.smith@example.com",
    profileImage: "/images/cases/john-smith.png",
    riskScore: 85,
    status: "pending",
    assignedTo: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    region: "US",
    workflow: "Customer Onboarding",
  },
  {
    id: "CASE-002",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    profileImage: "/images/cases/sarah-johnson.png",
    riskScore: 42,
    status: "approved",
    assignedTo: "Alice Chen",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    region: "UK",
    workflow: "Quick Check",
  },
  {
    id: "CASE-003",
    name: "Michael Brown",
    email: "m.brown@example.com",
    profileImage: "/images/cases/michael-brown.png",
    riskScore: 68,
    status: "flagged",
    assignedTo: "Bob Wilson",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    region: "EU",
    workflow: "High-Risk Verification",
  },
  {
    id: "CASE-004",
    name: "Emma Davis",
    email: "emma.d@example.com",
    profileImage: "/images/cases/emma-davis.png",
    riskScore: 23,
    status: "approved",
    assignedTo: "Alice Chen",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    region: "US",
    workflow: "Customer Onboarding",
  },
  {
    id: "CASE-005",
    name: "David Wilson",
    email: "d.wilson@example.com",
    profileImage: "/images/cases/david-wilson.png",
    riskScore: 91,
    status: "rejected",
    assignedTo: "Charlie Davis",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    region: "US",
    workflow: "High-Risk Verification",
  },
  {
    id: "CASE-006",
    name: "Lisa Anderson",
    email: "lisa.a@example.com",
    profileImage: "/images/cases/sarah-johnson.png",
    riskScore: 56,
    status: "pending",
    assignedTo: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    region: "CA",
    workflow: "Business Verification",
  },
];

const teamMembers = [
  { id: "1", name: "Alice Chen", role: "Senior Analyst" },
  { id: "2", name: "Bob Wilson", role: "Analyst" },
  { id: "3", name: "Charlie Davis", role: "Analyst" },
];

export default function CasesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filters
  const [filters, setFilters] = useState({
    dateRange: "all",
    riskScore: [0, 100] as [number, number],
    status: [] as string[],
    assignedTo: [] as string[],
    region: [] as string[],
  });

  // Filter cases based on criteria
  const filteredCases = useMemo(() => {
    return mockCases.filter((case_) => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !case_.id.toLowerCase().includes(query) &&
          !case_.name.toLowerCase().includes(query) &&
          !case_.email.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Risk score
      if (case_.riskScore < filters.riskScore[0] || case_.riskScore > filters.riskScore[1]) {
        return false;
      }

      // Status
      if (filters.status.length > 0 && !filters.status.includes(case_.status)) {
        return false;
      }

      // Assigned to
      if (filters.assignedTo.length > 0 && !filters.assignedTo.includes(case_.assignedTo || "unassigned")) {
        return false;
      }

      // Region
      if (filters.region.length > 0 && !filters.region.includes(case_.region)) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Selection
  const isAllSelected = paginatedCases.length > 0 && paginatedCases.every(c => selectedCases.includes(c.id));
  const isSomeSelected = paginatedCases.some(c => selectedCases.includes(c.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCases(selectedCases.filter(id => !paginatedCases.find(c => c.id === id)));
    } else {
      setSelectedCases([...selectedCases, ...paginatedCases.map(c => c.id)]);
    }
  };

  const toggleSelectCase = (caseId: string) => {
    if (selectedCases.includes(caseId)) {
      setSelectedCases(selectedCases.filter(id => id !== caseId));
    } else {
      setSelectedCases([...selectedCases, caseId]);
    }
  };

  // Bulk actions
  const handleBulkAssign = (assigneeId: string) => {
    const assignee = teamMembers.find(m => m.id === assigneeId);
    toast.success(`${selectedCases.length} cases assigned to ${assignee?.name}`);
    setSelectedCases([]);
  };

  const handleBulkStatus = (status: string) => {
    toast.success(`${selectedCases.length} cases marked as ${status}`);
    setSelectedCases([]);
  };

  const exportProgress = useProgressOperation();

  const handleBulkExport = async () => {
    exportProgress.start();
    
    // Simulate export process
    const totalItems = selectedCases.length || filteredCases.length;
    const itemsPerSecond = 50;
    const totalTime = Math.ceil(totalItems / itemsPerSecond);
    
    let processed = 0;
    const interval = setInterval(() => {
      processed += itemsPerSecond;
      const progress = Math.min(100, (processed / totalItems) * 100);
      exportProgress.updateProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        // Create mock CSV data
        const csvData = "data:text/csv;charset=utf-8,ID,Name,Risk Score,Status,Created\n" +
          filteredCases.slice(0, totalItems).map(c => 
            `${c.id},${c.name},${c.riskScore},${c.status},${c.createdAt}`
          ).join("\n");
        exportProgress.complete(csvData);
        toast.success("Export completed successfully!");
      }
    }, 1000);
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return "text-red-600 bg-red-50";
    if (score >= 60) return "text-amber-600 bg-amber-50";
    if (score >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Clock;
      case "approved":
        return CheckCircle;
      case "rejected":
        return XCircle;
      case "flagged":
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "rejected":
        return "destructive";
      case "flagged":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Filter Sidebar */}
      {filterOpen && (
        <div className="w-64 border-r bg-muted/20 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filters</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFilterOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Date Range */}
            <div>
              <Label>Date Range</Label>
              <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Risk Score */}
            <div>
              <Label>Risk Score Range</Label>
              <div className="mt-3 space-y-2">
                <Slider
                  value={filters.riskScore}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, riskScore: value as [number, number] }))}
                  min={0}
                  max={100}
                  step={1}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{filters.riskScore[0]}</span>
                  <span>{filters.riskScore[1]}</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <Label>Status</Label>
              <div className="mt-2 space-y-2">
                {["pending", "approved", "rejected", "flagged"].map((status) => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={status}
                      checked={filters.status.includes(status)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters(prev => ({ ...prev, status: [...prev.status, status] }));
                        } else {
                          setFilters(prev => ({ ...prev, status: prev.status.filter(s => s !== status) }));
                        }
                      }}
                    />
                    <Label htmlFor={status} className="text-sm font-normal capitalize">
                      {status}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned To */}
            <div>
              <Label>Assigned To</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="unassigned"
                    checked={filters.assignedTo.includes("unassigned")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilters(prev => ({ ...prev, assignedTo: [...prev.assignedTo, "unassigned"] }));
                      } else {
                        setFilters(prev => ({ ...prev, assignedTo: prev.assignedTo.filter(a => a !== "unassigned") }));
                      }
                    }}
                  />
                  <Label htmlFor="unassigned" className="text-sm font-normal">
                    Unassigned
                  </Label>
                </div>
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={member.id}
                      checked={filters.assignedTo.includes(member.name)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters(prev => ({ ...prev, assignedTo: [...prev.assignedTo, member.name] }));
                        } else {
                          setFilters(prev => ({ ...prev, assignedTo: prev.assignedTo.filter(a => a !== member.name) }));
                        }
                      }}
                    />
                    <Label htmlFor={member.id} className="text-sm font-normal">
                      {member.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Region */}
            <div>
              <Label>Region</Label>
              <div className="mt-2 space-y-2">
                {["US", "UK", "EU", "CA"].map((region) => (
                  <div key={region} className="flex items-center space-x-2">
                    <Checkbox
                      id={region}
                      checked={filters.region.includes(region)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFilters(prev => ({ ...prev, region: [...prev.region, region] }));
                        } else {
                          setFilters(prev => ({ ...prev, region: prev.region.filter(r => r !== region) }));
                        }
                      }}
                    />
                    <Label htmlFor={region} className="text-sm font-normal">
                      {region}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setFilters({
                  dateRange: "all",
                  riskScore: [0, 100],
                  status: [],
                  assignedTo: [],
                  region: [],
                });
              }}
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Cases</h1>
              <p className="text-muted-foreground">
                {filteredCases.length} cases found
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!filterOpen && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setFilterOpen(true)}
                >
                  <Filter className="h-4 w-4" />
                </Button>
              )}
              <Button variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by ID, name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCases.length > 0 && (
          <div className="border-b bg-muted/50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {selectedCases.length} cases selected
              </p>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Users className="mr-2 h-4 w-4" />
                      Assign
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Assign to</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {teamMembers.map((member) => (
                      <DropdownMenuItem
                        key={member.id}
                        onClick={() => handleBulkAssign(member.id)}
                      >
                        {member.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Change Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkStatus("approved")}>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                      Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatus("rejected")}>
                      <XCircle className="mr-2 h-4 w-4 text-red-600" />
                      Reject
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkStatus("flagged")}>
                      <AlertTriangle className="mr-2 h-4 w-4 text-amber-600" />
                      Flag for Review
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="sm" onClick={handleBulkExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const caseIds = selectedCases.join(",");
                    router.push(`/cases/bulk?cases=${caseIds}`);
                  }}
                >
                  Bulk Operations
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCases([])}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto table-wrapper">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Case ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCases.map((case_) => {
                const StatusIcon = getStatusIcon(case_.status);
                return (
                  <TableRow
                    key={case_.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/cases/${case_.id}`)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedCases.includes(case_.id)}
                        onCheckedChange={() => toggleSelectCase(case_.id)}
                        aria-label={`Select ${case_.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{case_.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={case_.profileImage} alt={case_.name} />
                          <AvatarFallback>{case_.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{case_.name}</p>
                          <p className="text-xs text-muted-foreground">{case_.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskScoreColor(case_.riskScore)}`}>
                        {case_.riskScore}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(case_.status)} className="flex items-center gap-1 w-fit">
                        <StatusIcon className="h-3 w-3" />
                        {case_.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {case_.assignedTo || (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDateTime(case_.createdAt)}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/cases/${case_.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          {case_.status === "pending" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <AlertTriangle className="mr-2 h-4 w-4 text-amber-600" />
                                Flag for Review
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" />
                            Assign
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {paginatedCases.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-1">No cases found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredCases.length)} of{" "}
                {filteredCases.length} cases
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((page, index, array) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="mx-1">...</span>
                        )}
                        <Button
                          variant={page === currentPage ? "default" : "outline"}
                          size="icon"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <ProgressDialog
        open={exportProgress.isOpen}
        onOpenChange={exportProgress.setIsOpen}
        title="Exporting Cases"
        description={`Exporting ${selectedCases.length || filteredCases.length} cases to CSV`}
        progress={exportProgress.progress}
        status={exportProgress.status}
        error={exportProgress.error}
        canCancel={true}
        onCancel={exportProgress.cancel}
        estimatedTime={Math.ceil((selectedCases.length || filteredCases.length) / 50)}
        processedItems={Math.floor(exportProgress.progress * (selectedCases.length || filteredCases.length) / 100)}
        totalItems={selectedCases.length || filteredCases.length}
        downloadUrl={exportProgress.downloadUrl}
        fileName="cases-export.csv"
      />
    </div>
  );
}