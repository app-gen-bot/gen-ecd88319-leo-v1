"use client";

import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  Play,
  Upload,
  User,
  FileText,
  Fingerprint,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
  Download,
  RefreshCw,
  ChevronRight,
  Eye,
  Code,
  Terminal
} from "lucide-react";

interface TestWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowName: string;
  workflowId: string;
  signals: Array<{
    id: string;
    name: string;
    type: string;
    required: boolean;
    provider: string;
  }>;
}

interface TestResult {
  signalId: string;
  signalName: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  duration?: number;
  score?: number;
  details?: any;
  error?: string;
}

export function TestWorkflowModal({ 
  isOpen, 
  onClose, 
  workflowName, 
  workflowId,
  signals 
}: TestWorkflowModalProps) {
  const [testMode, setTestMode] = useState<'quick' | 'manual' | 'api'>('quick');
  const [isRunning, setIsRunning] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);
  
  // Test data
  const [testData, setTestData] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    documentType: "passport",
    documentNumber: "US123456789",
  });

  const runTest = async () => {
    setIsRunning(true);
    setTestProgress(0);
    setTestResults([]);

    // Initialize results
    const results: TestResult[] = signals.map(signal => ({
      signalId: signal.id,
      signalName: signal.name,
      status: 'pending',
    }));
    setTestResults(results);

    // Simulate running each signal
    for (let i = 0; i < signals.length; i++) {
      const signal = signals[i];
      
      // Update status to running
      setTestResults(prev => prev.map(r => 
        r.signalId === signal.id ? { ...r, status: 'running' } : r
      ));

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      // Generate mock result
      const success = Math.random() > 0.2;
      const result: TestResult = {
        signalId: signal.id,
        signalName: signal.name,
        status: success ? 'passed' : Math.random() > 0.5 ? 'failed' : 'warning',
        duration: 1500 + Math.floor(Math.random() * 1000),
        score: success ? 85 + Math.floor(Math.random() * 15) : 30 + Math.floor(Math.random() * 30),
        details: generateMockDetails(signal.type, success),
        error: !success && Math.random() > 0.5 ? "Verification threshold not met" : undefined,
      };

      setTestResults(prev => prev.map(r => 
        r.signalId === signal.id ? result : r
      ));

      setTestProgress(((i + 1) / signals.length) * 100);
    }

    setIsRunning(false);
    toast.success("Test completed successfully");
  };

  const generateMockDetails = (signalType: string, success: boolean) => {
    switch (signalType) {
      case 'document':
        return {
          documentAuthenticity: success ? 'verified' : 'suspicious',
          dataExtraction: success ? 'complete' : 'partial',
          expiryCheck: 'valid',
          tampering: success ? 'none' : 'detected',
        };
      case 'biometric':
        return {
          faceMatch: success ? 94 : 65,
          livenessCheck: success ? 'passed' : 'failed',
          quality: success ? 'high' : 'low',
          attempts: 1,
        };
      case 'watchlist':
        return {
          sanctions: false,
          pep: !success,
          adverseMedia: false,
          riskScore: success ? 15 : 85,
        };
      default:
        return {};
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-amber-600 bg-amber-50';
      case 'running':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const exportResults = () => {
    const data = {
      workflow: workflowName,
      testDate: new Date().toISOString(),
      testMode,
      results: testResults,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-test-${workflowId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Test results exported");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Test Workflow: {workflowName}</DialogTitle>
          <DialogDescription>
            Run a test verification through your workflow to ensure everything is configured correctly
          </DialogDescription>
        </DialogHeader>

        <Tabs value={testMode} onValueChange={(v) => setTestMode(v as any)} className="flex-1">
          <TabsList>
            <TabsTrigger value="quick">Quick Test</TabsTrigger>
            <TabsTrigger value="manual">Manual Input</TabsTrigger>
            <TabsTrigger value="api">API Test</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden flex">
            <div className="flex-1 overflow-auto">
              <TabsContent value="quick" className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Quick test uses pre-configured test data to rapidly validate your workflow configuration.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle>Test Data</CardTitle>
                    <CardDescription>
                      Using standard test profile for verification
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Name</Label>
                        <p className="font-medium">{testData.name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Email</Label>
                        <p className="font-medium">{testData.email}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Document Type</Label>
                        <p className="font-medium capitalize">{testData.documentType}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Document Number</Label>
                        <p className="font-medium">{testData.documentNumber}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Test Results */}
                {testResults.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Test Results</CardTitle>
                        {!isRunning && testResults.some(r => r.status !== 'pending') && (
                          <Button variant="outline" size="sm" onClick={exportResults}>
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isRunning && (
                        <div className="mb-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Running tests...</span>
                            <span>{Math.round(testProgress)}%</span>
                          </div>
                          <Progress value={testProgress} />
                        </div>
                      )}

                      <div className="space-y-2">
                        {testResults.map((result) => (
                          <div
                            key={result.signalId}
                            className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                              selectedResult?.signalId === result.signalId ? 'border-primary' : ''
                            }`}
                            onClick={() => setSelectedResult(result)}
                          >
                            <div className="flex items-center gap-3">
                              {getStatusIcon(result.status)}
                              <div>
                                <p className="font-medium">{result.signalName}</p>
                                {result.duration && (
                                  <p className="text-xs text-muted-foreground">
                                    {(result.duration / 1000).toFixed(1)}s
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {result.score !== undefined && (
                                <Badge variant="outline">{result.score}%</Badge>
                              )}
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Manually input test data to test specific scenarios or edge cases.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle>Custom Test Data</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="test-name">Full Name</Label>
                        <Input
                          id="test-name"
                          value={testData.name}
                          onChange={(e) => setTestData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="test-email">Email</Label>
                        <Input
                          id="test-email"
                          type="email"
                          value={testData.email}
                          onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="test-doc-type">Document Type</Label>
                        <Input
                          id="test-doc-type"
                          value={testData.documentType}
                          onChange={(e) => setTestData(prev => ({ ...prev, documentType: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="test-doc-number">Document Number</Label>
                        <Input
                          id="test-doc-number"
                          value={testData.documentNumber}
                          onChange={(e) => setTestData(prev => ({ ...prev, documentNumber: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Test Documents
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api" className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Test your workflow using API calls to simulate real integration scenarios.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle>API Endpoint</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                      POST https://api.identfy.com/v1/workflows/{workflowId}/test
                    </div>
                    
                    <div>
                      <Label>Sample Request</Label>
                      <div className="bg-muted rounded-lg p-4 font-mono text-xs overflow-x-auto">
                        <pre>{`{
  "test_mode": true,
  "data": {
    "name": "${testData.name}",
    "email": "${testData.email}",
    "document": {
      "type": "${testData.documentType}",
      "number": "${testData.documentNumber}"
    }
  }
}`}</pre>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Code className="mr-2 h-4 w-4" />
                        Copy cURL
                      </Button>
                      <Button variant="outline" size="sm">
                        <Terminal className="mr-2 h-4 w-4" />
                        Open in Postman
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>

            {/* Result Details Panel */}
            {selectedResult && selectedResult.status !== 'pending' && (
              <div className="w-80 border-l pl-4 ml-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{selectedResult.signalName}</CardTitle>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium ${getStatusColor(selectedResult.status)}`}>
                      {getStatusIcon(selectedResult.status)}
                      {selectedResult.status}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedResult.score !== undefined && (
                      <div>
                        <Label className="text-muted-foreground">Score</Label>
                        <p className="text-2xl font-bold">{selectedResult.score}%</p>
                      </div>
                    )}
                    
                    {selectedResult.duration && (
                      <div>
                        <Label className="text-muted-foreground">Duration</Label>
                        <p className="font-medium">{(selectedResult.duration / 1000).toFixed(1)} seconds</p>
                      </div>
                    )}

                    {selectedResult.error && (
                      <Alert variant="destructive">
                        <AlertDescription>{selectedResult.error}</AlertDescription>
                      </Alert>
                    )}

                    {selectedResult.details && (
                      <div>
                        <Label className="text-muted-foreground mb-2 block">Details</Label>
                        <div className="space-y-2 text-sm">
                          {Object.entries(selectedResult.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-muted-foreground capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <span className="font-medium">
                                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      View Raw Response
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {testResults.length > 0 && !isRunning ? (
            <Button onClick={() => {
              setTestResults([]);
              runTest();
            }}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Run Again
            </Button>
          ) : (
            <Button onClick={runTest} disabled={isRunning}>
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Test
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}