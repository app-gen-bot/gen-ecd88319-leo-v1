"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  ChevronLeft,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Download,
  UserCheck,
  Send,
  Clock
} from "lucide-react";
import Link from "next/link";

// Mock team members for assignment
const teamMembers = [
  { id: "1", name: "Alice Chen", role: "Senior Analyst", capacity: 45 },
  { id: "2", name: "Bob Wilson", role: "Analyst", capacity: 67 },
  { id: "3", name: "Charlie Davis", role: "Analyst", capacity: 23 },
  { id: "4", name: "Diana Evans", role: "Junior Analyst", capacity: 89 },
];

const statusOptions = [
  { value: "approved", label: "Approved", icon: CheckCircle, color: "text-green-600" },
  { value: "rejected", label: "Rejected", icon: XCircle, color: "text-red-600" },
  { value: "flagged", label: "Flag for Review", icon: AlertTriangle, color: "text-amber-600" },
  { value: "pending", label: "Pending", icon: Clock, color: "text-blue-600" },
];

const reasonCodes = [
  { id: "doc_invalid", label: "Invalid documentation" },
  { id: "biometric_fail", label: "Biometric verification failed" },
  { id: "watchlist_hit", label: "Watchlist match" },
  { id: "fraud_suspected", label: "Suspected fraud" },
  { id: "info_mismatch", label: "Information mismatch" },
  { id: "expired_docs", label: "Expired documents" },
  { id: "poor_quality", label: "Poor image quality" },
  { id: "other", label: "Other (specify in notes)" },
];

export default function BulkOperationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedCaseIds = searchParams.get("cases")?.split(",") || [];
  
  const [operation, setOperation] = useState<"assign" | "status" | "export">("status");
  const [assignee, setAssignee] = useState("");
  const [status, setStatus] = useState("");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [notifyUsers, setNotifyUsers] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleProcess = async () => {
    if (operation === "assign" && !assignee) {
      toast.error("Please select an assignee");
      return;
    }
    
    if (operation === "status") {
      if (!status) {
        toast.error("Please select a status");
        return;
      }
      if (status === "rejected" && selectedReasons.length === 0) {
        toast.error("Please select at least one reason for rejection");
        return;
      }
    }

    setIsProcessing(true);
    setProgress(0);

    // Simulate processing
    const total = selectedCaseIds.length;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / total);
      });
    }, 200);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, total * 200 + 500));

    setIsProcessing(false);
    
    if (operation === "assign") {
      const member = teamMembers.find(m => m.id === assignee);
      toast.success(`${total} cases assigned to ${member?.name}`);
    } else if (operation === "status") {
      toast.success(`${total} cases updated to ${status}`);
    } else if (operation === "export") {
      // Create mock CSV
      const csv = "Case ID,Name,Risk Score,Status\n" + 
        selectedCaseIds.map(id => `${id},John Doe,75,pending`).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cases-export-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${total} cases exported`);
    }

    // Redirect back to cases
    setTimeout(() => {
      router.push("/cases");
    }, 1500);
  };

  if (selectedCaseIds.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Cases Selected</h2>
            <p className="text-muted-foreground mb-4">
              Please select cases from the case queue to perform bulk operations.
            </p>
            <Button asChild>
              <Link href="/cases">Back to Cases</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/cases">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Bulk Operations</h1>
          <p className="text-muted-foreground">
            Processing {selectedCaseIds.length} selected cases
          </p>
        </div>
      </div>

      {/* Operation Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Operation</CardTitle>
          <CardDescription>
            Choose what action to perform on the selected cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={operation} onValueChange={(value: any) => setOperation(value)}>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="status" id="status" />
                <Label htmlFor="status" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Change Status</p>
                      <p className="text-sm text-muted-foreground">
                        Update the verification status for all selected cases
                      </p>
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="assign" id="assign" />
                <Label htmlFor="assign" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Assign Cases</p>
                      <p className="text-sm text-muted-foreground">
                        Assign all selected cases to a team member
                      </p>
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="export" id="export" />
                <Label htmlFor="export" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Export Cases</p>
                      <p className="text-sm text-muted-foreground">
                        Export selected cases to CSV format
                      </p>
                    </div>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Operation Details */}
      {operation === "assign" && (
        <Card>
          <CardHeader>
            <CardTitle>Assign to Team Member</CardTitle>
            <CardDescription>
              Select a team member to handle these cases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Select Assignee</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a team member" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                        </div>
                        <div className="ml-4">
                          <Progress value={member.capacity} className="w-20 h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {member.capacity}% capacity
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="assignment-note">Assignment Note (Optional)</Label>
              <Textarea
                id="assignment-note"
                placeholder="Add a note about this assignment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {operation === "status" && (
        <Card>
          <CardHeader>
            <CardTitle>Change Status</CardTitle>
            <CardDescription>
              Update the verification status for selected cases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>New Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${option.color}`} />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {status === "rejected" && (
              <>
                <Separator />
                <div>
                  <Label>Reason Codes</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select all reasons that apply
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {reasonCodes.map((reason) => (
                      <div key={reason.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={reason.id}
                          checked={selectedReasons.includes(reason.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedReasons([...selectedReasons, reason.id]);
                            } else {
                              setSelectedReasons(selectedReasons.filter(r => r !== reason.id));
                            }
                          }}
                        />
                        <Label htmlFor={reason.id} className="text-sm font-normal">
                          {reason.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="status-note">Additional Notes (Optional)</Label>
              <Textarea
                id="status-note"
                placeholder="Add notes about this status change..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <Label htmlFor="notify" className="font-normal">
                Send notification email to affected users
              </Label>
              <Checkbox
                id="notify"
                checked={notifyUsers}
                onCheckedChange={(checked) => setNotifyUsers(checked as boolean)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {operation === "export" && (
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
            <CardDescription>
              Configure how you want to export the selected cases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">CSV Export</p>
                  <p className="text-sm text-muted-foreground">
                    Export will include case details, risk scores, and current status
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Export will include:</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Case ID and timestamp</li>
                <li>• Personal information</li>
                <li>• Risk scores and status</li>
                <li>• Verification results</li>
                <li>• Assignment details</li>
                <li>• Recent notes</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>
            Review before processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Selected Cases</span>
              <span className="font-medium">{selectedCaseIds.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Operation</span>
              <span className="font-medium capitalize">{operation}</span>
            </div>
            {operation === "assign" && assignee && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assign To</span>
                <span className="font-medium">
                  {teamMembers.find(m => m.id === assignee)?.name}
                </span>
              </div>
            )}
            {operation === "status" && status && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">New Status</span>
                <Badge variant={status === "approved" ? "success" : status === "rejected" ? "destructive" : "warning"}>
                  {status}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" asChild className="flex-1">
          <Link href="/cases">Cancel</Link>
        </Button>
        <Button 
          onClick={handleProcess} 
          disabled={isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              Processing... {Math.round(progress)}%
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Process {selectedCaseIds.length} Cases
            </>
          )}
        </Button>
      </div>

      {/* Progress */}
      {isProcessing && (
        <Progress value={progress} className="w-full" />
      )}
    </div>
  );
}