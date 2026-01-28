"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  ChevronLeft,
  GitBranch,
  Clock,
  User,
  FileText,
  Download,
  Eye,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Code,
  Copy,
  GitCommit,
  GitMerge,
  Info
} from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";

// Mock version history data
const versions = [
  {
    id: "v2.1",
    version: "v2.1",
    status: "active",
    createdAt: new Date(),
    createdBy: "Alice Chen",
    changes: [
      "Updated biometric threshold from 95% to 98%",
      "Added additional document types support",
      "Improved error handling for failed verifications",
    ],
    stats: {
      totalVerifications: 45231,
      successRate: 94.2,
      avgCompletionTime: 3.4,
    },
    commit: "a1b2c3d",
  },
  {
    id: "v2.0",
    version: "v2.0",
    status: "inactive",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    createdBy: "Bob Wilson",
    changes: [
      "Major update: Added watchlist screening signal",
      "Implemented parallel processing for signals",
      "New UI for verification flow",
    ],
    stats: {
      totalVerifications: 123456,
      successRate: 92.8,
      avgCompletionTime: 4.1,
    },
    commit: "e4f5g6h",
  },
  {
    id: "v1.9",
    version: "v1.9",
    status: "inactive",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    createdBy: "Charlie Davis",
    changes: [
      "Fixed biometric matching issue",
      "Improved document quality checks",
      "Added retry logic for failed signals",
    ],
    stats: {
      totalVerifications: 89012,
      successRate: 91.5,
      avgCompletionTime: 4.5,
    },
    commit: "i7j8k9l",
  },
  {
    id: "v1.8",
    version: "v1.8",
    status: "inactive",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    createdBy: "Alice Chen",
    changes: [
      "Initial biometric verification implementation",
      "Added support for passport documents",
      "Basic error handling",
    ],
    stats: {
      totalVerifications: 67890,
      successRate: 88.3,
      avgCompletionTime: 5.2,
    },
    commit: "m0n1o2p",
  },
];

export default function WorkflowVersionsPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState<[string | null, string | null]>([null, null]);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<typeof versions[0] | null>(null);

  const handleRestore = async () => {
    if (!versionToRestore) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(`Workflow restored to ${versionToRestore.version}`);
    setShowRestoreDialog(false);
    router.push(`/workflows/${params.id}/edit`);
  };

  const handleCompare = () => {
    if (compareVersions[0] && compareVersions[1]) {
      toast.info("Opening comparison view...");
      // In a real app, this would open a diff view
    } else {
      toast.error("Please select two versions to compare");
    }
  };

  const exportVersion = (version: typeof versions[0]) => {
    // Simulate export
    const data = {
      workflow: "Customer Onboarding",
      version: version.version,
      exportDate: new Date().toISOString(),
      configuration: {
        // Mock configuration data
        signals: ["document", "biometric", "watchlist"],
        settings: {},
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${params.id}-${version.version}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Version ${version.version} exported`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/workflows/${params.id}/edit`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Version History</h1>
            <p className="text-muted-foreground mt-1">
              Customer Onboarding Workflow
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={compareMode ? "default" : "outline"}
            onClick={() => {
              setCompareMode(!compareMode);
              setCompareVersions([null, null]);
            }}
          >
            <GitMerge className="mr-2 h-4 w-4" />
            {compareMode ? "Exit Compare" : "Compare Versions"}
          </Button>
        </div>
      </div>

      {/* Compare Mode Alert */}
      {compareMode && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Select two versions to compare their configurations and changes.
          </AlertDescription>
        </Alert>
      )}

      {/* Version Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Version Timeline</CardTitle>
          <CardDescription>
            Track changes and updates to your workflow configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {versions.map((version, index) => (
              <div key={version.id} className="relative">
                {/* Timeline connector */}
                {index < versions.length - 1 && (
                  <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />
                )}

                <div className="flex gap-4">
                  {/* Timeline node */}
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      version.status === 'active' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <GitCommit className="h-5 w-5" />
                    </div>
                    {version.status === 'active' && (
                      <Badge 
                        variant="default" 
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>

                  {/* Version card */}
                  <Card className="flex-1 mb-4">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{version.version}</CardTitle>
                            {version.status === 'active' && (
                              <Badge variant="success">Active</Badge>
                            )}
                            <code className="text-xs bg-muted px-2 py-0.5 rounded">
                              {version.commit}
                            </code>
                          </div>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <User className="h-3 w-3" />
                            {version.createdBy}
                            <span className="text-muted-foreground">•</span>
                            <Clock className="h-3 w-3" />
                            {formatDateTime(version.createdAt)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {compareMode ? (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={compareVersions.includes(version.id)}
                                onClick={() => {
                                  if (!compareVersions[0]) {
                                    setCompareVersions([version.id, compareVersions[1]]);
                                  } else if (!compareVersions[1]) {
                                    setCompareVersions([compareVersions[0], version.id]);
                                  }
                                }}
                              >
                                {compareVersions[0] === version.id && "Version A"}
                                {compareVersions[1] === version.id && "Version B"}
                                {!compareVersions.includes(version.id) && "Select"}
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => exportVersion(version)}>
                                <Download className="h-4 w-4" />
                              </Button>
                              {version.status !== 'active' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setVersionToRestore(version);
                                    setShowRestoreDialog(true);
                                  }}
                                >
                                  <RotateCcw className="mr-2 h-4 w-4" />
                                  Restore
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Changes */}
                      <div>
                        <p className="text-sm font-medium mb-2">Changes</p>
                        <ul className="space-y-1">
                          {version.changes.map((change, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-primary mt-1">•</span>
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Verifications</p>
                          <p className="text-lg font-semibold">
                            {version.stats.totalVerifications.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Success Rate</p>
                          <p className="text-lg font-semibold">{version.stats.successRate}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Avg. Time</p>
                          <p className="text-lg font-semibold">{version.stats.avgCompletionTime}m</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>

          {/* Compare button */}
          {compareMode && compareVersions[0] && compareVersions[1] && (
            <div className="mt-6 flex justify-center">
              <Button onClick={handleCompare}>
                <GitMerge className="mr-2 h-4 w-4" />
                Compare {compareVersions[0]} vs {compareVersions[1]}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Version {versionToRestore?.version}</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore this version? This will create a new version based on {versionToRestore?.version} configuration.
            </DialogDescription>
          </DialogHeader>
          
          {versionToRestore && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The current active version (v2.1) will be preserved in the version history.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p className="text-sm font-medium">This version includes:</p>
                <ul className="space-y-1">
                  {versionToRestore.changes.map((change, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRestore}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}