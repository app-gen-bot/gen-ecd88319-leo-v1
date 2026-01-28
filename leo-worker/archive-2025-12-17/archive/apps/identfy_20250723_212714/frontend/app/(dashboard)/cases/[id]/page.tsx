"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { 
  ChevronLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  User,
  FileText,
  Fingerprint,
  Globe,
  Shield,
  MessageSquare,
  History,
  ExternalLink,
  Copy,
  ZoomIn,
  Check,
  X,
  Upload,
  Send
} from "lucide-react";
import Link from "next/link";
import { formatDateTime, getInitials } from "@/lib/utils";

// Mock case data
const mockCase = {
  id: "CASE-001",
  status: "pending",
  riskScore: 85,
  workflow: "Customer Onboarding",
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  personalInfo: {
    name: "John Smith",
    profileImage: "/images/cases/john-smith.png",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1985-03-15",
    nationality: "United States",
    address: {
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "United States",
    },
  },
  documents: {
    type: "passport",
    number: "US123456789",
    issuedDate: "2020-01-15",
    expiryDate: "2030-01-14",
    issuingCountry: "United States",
    frontImage: "/images/documents/passport-sample.png",
    backImage: "/images/documents/driver-license-sample.png",
    extractedData: {
      firstName: "JOHN",
      lastName: "SMITH",
      documentNumber: "US123456789",
      dateOfBirth: "15 MAR 1985",
      placeOfBirth: "NEW YORK",
      nationality: "USA",
    },
    verificationStatus: "verified",
    verificationDetails: {
      documentAuthenticity: { status: "passed", confidence: 98 },
      dataExtraction: { status: "passed", confidence: 99 },
      expiryCheck: { status: "passed", confidence: 100 },
      tampering: { status: "passed", confidence: 97 },
    },
  },
  biometrics: {
    selfieImage: "/images/cases/john-smith.png",
    faceMatchScore: 94,
    livenessScore: 98,
    verificationStatus: "verified",
    attempts: 1,
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  signals: [
    {
      type: "document",
      provider: "Jumio",
      status: "passed",
      score: 98,
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      details: {
        documentType: "passport",
        authenticity: "verified",
        dataMatches: true,
      },
    },
    {
      type: "biometric",
      provider: "iProov",
      status: "passed",
      score: 96,
      timestamp: new Date(Date.now() - 1000 * 60 * 85),
      details: {
        livenessCheck: "passed",
        faceMatch: 94,
        quality: "high",
      },
    },
    {
      type: "watchlist",
      provider: "ComplyAdvantage",
      status: "flagged",
      score: 85,
      timestamp: new Date(Date.now() - 1000 * 60 * 80),
      details: {
        sanctions: false,
        pep: true,
        adverseMedia: false,
        pepDetails: "Family member of government official",
      },
    },
    {
      type: "device",
      provider: "Fingerprint.js",
      status: "passed",
      score: 92,
      timestamp: new Date(Date.now() - 1000 * 60 * 75),
      details: {
        vpnDetected: false,
        proxyDetected: false,
        location: "New York, US",
        deviceId: "dev_abc123",
      },
    },
  ],
  notes: [
    {
      id: "1",
      author: "Alice Chen",
      content: "PEP flag detected - family member of government official. Requires enhanced due diligence.",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      mentions: ["@Bob Wilson"],
    },
    {
      id: "2",
      author: "Bob Wilson",
      content: "Reviewed the PEP connection. The individual is a distant relative with no direct business dealings. Recommend proceeding with standard verification.",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      mentions: ["@Alice Chen"],
    },
  ],
  auditLog: [
    {
      id: "1",
      action: "case_created",
      user: "System",
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      details: "Case created via API",
      ipAddress: "api.identfy.com",
    },
    {
      id: "2",
      action: "signal_completed",
      user: "System",
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      details: "Document verification completed",
      ipAddress: "api.identfy.com",
    },
    {
      id: "3",
      action: "signal_completed",
      user: "System",
      timestamp: new Date(Date.now() - 1000 * 60 * 85),
      details: "Biometric verification completed",
      ipAddress: "api.identfy.com",
    },
    {
      id: "4",
      action: "signal_flagged",
      user: "System",
      timestamp: new Date(Date.now() - 1000 * 60 * 80),
      details: "Watchlist screening flagged - PEP match",
      ipAddress: "api.identfy.com",
    },
    {
      id: "5",
      action: "note_added",
      user: "Alice Chen",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      details: "Added note about PEP flag",
      ipAddress: "192.168.1.100",
    },
    {
      id: "6",
      action: "note_added",
      user: "Bob Wilson",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      details: "Added review note",
      ipAddress: "192.168.1.101",
    },
  ],
};

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

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionType, setDecisionType] = useState<"approve" | "reject" | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [notifyUser, setNotifyUser] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageZoom, setImageZoom] = useState<string | null>(null);

  const handleDecision = async () => {
    if (decisionType === "reject" && selectedReasons.length === 0) {
      toast.error("Please select at least one reason for rejection");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success(
      decisionType === "approve" 
        ? "Case approved successfully" 
        : "Case rejected successfully"
    );
    
    setShowDecisionModal(false);
    setIsSubmitting(false);
    router.push("/cases");
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast.success("Note added successfully");
    setNewNote("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return "text-red-600 bg-red-50";
    if (score >= 60) return "text-amber-600 bg-amber-50";
    if (score >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return CheckCircle;
      case "failed":
        return XCircle;
      case "flagged":
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "text-green-600 bg-green-50";
      case "failed":
        return "text-red-600 bg-red-50";
      case "flagged":
        return "text-amber-600 bg-amber-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cases">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{mockCase.id}</h1>
                <Badge variant="warning">
                  {mockCase.status}
                </Badge>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskScoreColor(mockCase.riskScore)}`}>
                  Risk Score: {mockCase.riskScore}
                </div>
              </div>
              <p className="text-muted-foreground mt-1">
                Created {formatDateTime(mockCase.createdAt)} • {mockCase.workflow}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDecisionType("reject");
                setShowDecisionModal(true);
              }}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={() => {
                setDecisionType("approve");
                setShowDecisionModal(true);
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Flag for Review
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Assign
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="biometrics">Biometrics</TabsTrigger>
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 mb-6 flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={mockCase.personalInfo.profileImage} alt={mockCase.personalInfo.name} />
                      <AvatarFallback>{getInitials(mockCase.personalInfo.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{mockCase.personalInfo.name}</h3>
                      <p className="text-muted-foreground">{mockCase.personalInfo.email}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Full Name</Label>
                      <p className="font-medium">{mockCase.personalInfo.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{mockCase.personalInfo.email}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(mockCase.personalInfo.email)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="font-medium">{mockCase.personalInfo.phone}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Date of Birth</Label>
                      <p className="font-medium">{mockCase.personalInfo.dateOfBirth}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Nationality</Label>
                      <p className="font-medium">{mockCase.personalInfo.nationality}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Address</Label>
                      <div className="font-medium">
                        <p>{mockCase.personalInfo.address.street}</p>
                        <p>{mockCase.personalInfo.address.city}, {mockCase.personalInfo.address.state} {mockCase.personalInfo.address.postalCode}</p>
                        <p>{mockCase.personalInfo.address.country}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Verification Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCase.signals.map((signal, index) => {
                    const StatusIcon = getStatusIcon(signal.status);
                    return (
                      <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded ${getStatusColor(signal.status)}`}>
                            <StatusIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{signal.type} Verification</p>
                            <p className="text-sm text-muted-foreground">
                              Provider: {signal.provider} • Score: {signal.score}%
                            </p>
                            {signal.status === "flagged" && signal.details.pepDetails && (
                              <p className="text-sm text-amber-600 mt-1">
                                {signal.details.pepDetails}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge variant={signal.status === "passed" ? "success" : signal.status === "flagged" ? "warning" : "destructive"}>
                          {signal.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Factors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Document Verification</span>
                    <Progress value={98} className="w-32" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Biometric Match</span>
                    <Progress value={94} className="w-32" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Watchlist Screening</span>
                    <Progress value={85} className="w-32" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Device Analysis</span>
                    <Progress value={92} className="w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Document Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Document Type</Label>
                      <p className="font-medium capitalize">{mockCase.documents.type}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Document Number</Label>
                      <p className="font-medium">{mockCase.documents.number}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Issued Date</Label>
                      <p className="font-medium">{mockCase.documents.issuedDate}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Expiry Date</Label>
                      <p className="font-medium">{mockCase.documents.expiryDate}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Issuing Country</Label>
                      <p className="font-medium">{mockCase.documents.issuingCountry}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Verification Status</Label>
                      <Badge variant="success" className="mt-1">
                        {mockCase.documents.verificationStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground mb-4 block">Document Images</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Front</p>
                      <div 
                        className="relative border rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setImageZoom(mockCase.documents.frontImage)}
                      >
                        <img 
                          src={mockCase.documents.frontImage} 
                          alt="Document front" 
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                          <ZoomIn className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Back</p>
                      <div 
                        className="relative border rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setImageZoom(mockCase.documents.backImage)}
                      >
                        <img 
                          src={mockCase.documents.backImage} 
                          alt="Document back" 
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                          <ZoomIn className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground mb-4 block">Extracted Data</Label>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {Object.entries(mockCase.documents.extractedData).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground mb-4 block">Verification Details</Label>
                  <div className="space-y-3">
                    {Object.entries(mockCase.documents.verificationDetails).map(([check, result]) => (
                      <div key={check} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {result.status === "passed" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span className="capitalize">
                            {check.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Confidence: {result.confidence}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="biometrics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Biometric Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-muted-foreground mb-4 block">Selfie Image</Label>
                    <div 
                      className="relative border rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setImageZoom(mockCase.biometrics.selfieImage)}
                    >
                      <img 
                        src={mockCase.biometrics.selfieImage} 
                        alt="Selfie" 
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                        <ZoomIn className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Face Match Score</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <Progress value={mockCase.biometrics.faceMatchScore} className="flex-1" />
                        <span className="text-lg font-semibold">{mockCase.biometrics.faceMatchScore}%</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Liveness Score</Label>
                      <div className="flex items-center gap-3 mt-2">
                        <Progress value={mockCase.biometrics.livenessScore} className="flex-1" />
                        <span className="text-lg font-semibold">{mockCase.biometrics.livenessScore}%</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Verification Status</Label>
                      <Badge variant="success" className="mt-2">
                        {mockCase.biometrics.verificationStatus}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Attempts</Label>
                      <p className="font-medium mt-1">{mockCase.biometrics.attempts}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Timestamp</Label>
                      <p className="font-medium mt-1">{formatDateTime(mockCase.biometrics.timestamp)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground mb-4 block">Face Comparison</Label>
                  <div className="bg-muted/50 rounded-lg p-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium mb-2">Document Photo</p>
                        <div className="border rounded-lg overflow-hidden">
                          <img 
                            src={mockCase.documents.frontImage} 
                            alt="Document photo" 
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium mb-2">Selfie Photo</p>
                        <div className="border rounded-lg overflow-hidden">
                          <img 
                            src={mockCase.biometrics.selfieImage} 
                            alt="Selfie photo" 
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-muted-foreground">Match Confidence</p>
                      <p className="text-2xl font-bold text-green-600">{mockCase.biometrics.faceMatchScore}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signals" className="space-y-6">
            {mockCase.signals.map((signal, index) => {
              const StatusIcon = getStatusIcon(signal.status);
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">{signal.type} Verification</CardTitle>
                      <Badge variant={signal.status === "passed" ? "success" : signal.status === "flagged" ? "warning" : "destructive"}>
                        {signal.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-muted-foreground">Provider</Label>
                          <p className="font-medium">{signal.provider}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Score</Label>
                          <p className="font-medium">{signal.score}%</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Timestamp</Label>
                          <p className="font-medium">{formatDateTime(signal.timestamp)}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground">Status</Label>
                          <div className={`inline-flex items-center gap-1 mt-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(signal.status)}`}>
                            <StatusIcon className="h-3 w-3" />
                            {signal.status}
                          </div>
                        </div>
                      </div>

                      {signal.details && (
                        <div>
                          <Label className="text-muted-foreground mb-2 block">Details</Label>
                          <div className="bg-muted/50 rounded-lg p-4">
                            <div className="space-y-2 text-sm">
                              {Object.entries(signal.details).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-muted-foreground capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                                  </span>
                                  <span className="font-medium">
                                    {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      <Button variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Raw Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add Note</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type your note here... Use @username to mention team members"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={4}
                  />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                      <Send className="mr-2 h-4 w-4" />
                      Add Note
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {mockCase.notes.map((note) => (
                <Card key={note.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(note.author)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{note.author}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(note.timestamp)}
                          </p>
                        </div>
                        <p className="text-sm">{note.content}</p>
                        {note.mentions.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <MessageSquare className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              Mentioned: {note.mentions.join(", ")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
                <CardDescription>
                  Complete history of all actions taken on this case
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCase.auditLog.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 pb-4 border-b last:border-0">
                      <div className="p-2 bg-muted rounded">
                        <History className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{entry.action.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(entry.timestamp)}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">{entry.details}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          By {entry.user} • IP: {entry.ipAddress}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Decision Modal */}
      <AlertDialog open={showDecisionModal} onOpenChange={setShowDecisionModal}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {decisionType === "approve" ? "Approve Case" : "Reject Case"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {decisionType === "approve" 
                ? "Are you sure you want to approve this case?"
                : "Please select the reasons for rejection and provide additional notes."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 my-4">
            {decisionType === "reject" && (
              <div>
                <Label>Reason Codes (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
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
            )}

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional comments..."
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notify" className="font-normal">
                Send notification email to user
              </Label>
              <Switch
                id="notify"
                checked={notifyUser}
                onCheckedChange={setNotifyUser}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDecision}
              disabled={isSubmitting}
              className={decisionType === "reject" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {isSubmitting ? "Processing..." : decisionType === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Zoom Modal */}
      {imageZoom && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8"
          onClick={() => setImageZoom(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={imageZoom}
              alt="Zoomed"
              className="max-w-full max-h-full object-contain"
            />
            <Button
              variant="outline"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => setImageZoom(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

// Import missing DropdownMenu components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";