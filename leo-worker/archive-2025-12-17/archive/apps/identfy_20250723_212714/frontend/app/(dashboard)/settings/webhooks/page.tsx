"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  Plus, 
  MoreVertical,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  Zap
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

// Mock webhook data
const mockWebhooks = [
  {
    id: "1",
    url: "https://api.example.com/webhooks/identfy",
    events: ["verification.completed", "case.updated"],
    enabled: true,
    secret: "whsec_aK9j2mN5pQ8rT1uW3xY6zB",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    lastTriggered: new Date(Date.now() - 1000 * 60 * 15),
    successRate: 98.5,
    totalRequests: 1523,
    failedRequests: 23,
  },
  {
    id: "2",
    url: "https://webhook.site/test-endpoint",
    events: ["workflow.published", "user.flagged"],
    enabled: false,
    secret: "whsec_cL3eF7gH9jK2mN4pQ6sT8v",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    lastTriggered: new Date(Date.now() - 1000 * 60 * 60 * 24),
    successRate: 85.2,
    totalRequests: 234,
    failedRequests: 35,
  },
];

const webhookEvents = [
  { id: "verification.completed", label: "Verification Completed", description: "When a verification is completed" },
  { id: "verification.failed", label: "Verification Failed", description: "When a verification fails" },
  { id: "case.created", label: "Case Created", description: "When a new case is created" },
  { id: "case.updated", label: "Case Updated", description: "When a case is updated" },
  { id: "case.approved", label: "Case Approved", description: "When a case is approved" },
  { id: "case.rejected", label: "Case Rejected", description: "When a case is rejected" },
  { id: "workflow.published", label: "Workflow Published", description: "When a workflow is published" },
  { id: "user.flagged", label: "User Flagged", description: "When a user is flagged for review" },
];

export default function WebhooksSettingsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<typeof mockWebhooks[0] | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  
  // Form state
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [retryEnabled, setRetryEnabled] = useState(true);
  const [maxRetries, setMaxRetries] = useState("3");

  const handleCreateWebhook = async () => {
    if (!webhookUrl || selectedEvents.length === 0) {
      toast.error("Please provide a URL and select at least one event");
      return;
    }

    setIsCreating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsCreating(false);
    
    toast.success("Webhook created successfully");
    setCreateModalOpen(false);
    resetForm();
  };

  const handleTestWebhook = async () => {
    if (!selectedWebhook) return;
    
    setIsTesting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsTesting(false);
    
    toast.success("Test payload sent successfully");
    setTestModalOpen(false);
  };

  const handleToggleWebhook = async (webhook: typeof mockWebhooks[0]) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast.success(
      webhook.enabled 
        ? `Webhook disabled` 
        : `Webhook enabled`
    );
  };

  const handleDeleteWebhook = async (webhook: typeof mockWebhooks[0]) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Webhook deleted successfully");
  };

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    toast.success("Secret copied to clipboard");
  };

  const resetForm = () => {
    setWebhookUrl("");
    setSelectedEvents([]);
    setRetryEnabled(true);
    setMaxRetries("3");
  };

  const getStatusBadge = (successRate: number) => {
    if (successRate >= 95) {
      return <Badge variant="success">Healthy</Badge>;
    } else if (successRate >= 80) {
      return <Badge variant="warning">Degraded</Badge>;
    } else {
      return <Badge variant="destructive">Failing</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Webhooks List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Receive real-time notifications when events occur
              </CardDescription>
            </div>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Last Triggered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockWebhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{webhook.url}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4"
                          onClick={() => window.open(webhook.url, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-muted-foreground">
                          Secret: •••• {webhook.secret.slice(-4)}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4"
                          onClick={() => copySecret(webhook.secret)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="secondary" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={webhook.enabled}
                        onCheckedChange={() => handleToggleWebhook(webhook)}
                      />
                      {getStatusBadge(webhook.successRate)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{webhook.successRate}%</p>
                      <p className="text-xs text-muted-foreground">
                        {webhook.failedRequests} / {webhook.totalRequests} failed
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(webhook.lastTriggered)}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedWebhook(webhook);
                            setTestModalOpen(true);
                          }}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Test Webhook
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Regenerate Secret
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteWebhook(webhook)}
                          className="text-destructive"
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Delete Webhook
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

      {/* Webhook Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Security</CardTitle>
          <CardDescription>
            Verify webhook signatures to ensure requests are from Identfy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Signature Verification</h4>
              <p className="text-sm text-muted-foreground mb-2">
                All webhook requests include a signature in the `X-Identfy-Signature` header.
              </p>
              <code className="text-xs bg-muted px-3 py-2 rounded block">
                {`const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}`}
              </code>
            </div>
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Webhook Documentation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Webhook Modal */}
      <Dialog open={createModalOpen} onOpenChange={(open) => {
        setCreateModalOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Webhook</DialogTitle>
            <DialogDescription>
              Configure a new webhook endpoint to receive events
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="https://api.example.com/webhooks/identfy"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>

            <div>
              <Label>Events to Subscribe</Label>
              <div className="space-y-3 mt-2 max-h-64 overflow-y-auto">
                {webhookEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={event.id}
                      checked={selectedEvents.includes(event.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedEvents([...selectedEvents, event.id]);
                        } else {
                          setSelectedEvents(selectedEvents.filter(e => e !== event.id));
                        }
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={event.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {event.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="retry">Enable Retries</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically retry failed webhook deliveries
                  </p>
                </div>
                <Switch
                  id="retry"
                  checked={retryEnabled}
                  onCheckedChange={setRetryEnabled}
                />
              </div>
              
              {retryEnabled && (
                <div className="grid gap-2 ml-6">
                  <Label htmlFor="max-retries">Maximum Retries</Label>
                  <Input
                    id="max-retries"
                    type="number"
                    value={maxRetries}
                    onChange={(e) => setMaxRetries(e.target.value)}
                    min="1"
                    max="10"
                    className="w-24"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateWebhook} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Webhook"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Webhook Modal */}
      <Dialog open={testModalOpen} onOpenChange={setTestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Webhook</DialogTitle>
            <DialogDescription>
              Send a test payload to {selectedWebhook?.url}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Test Event</Label>
              <Select defaultValue="verification.completed">
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {webhookEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sample Payload</Label>
              <div className="mt-2 max-h-64 overflow-y-auto">
                <pre className="text-xs bg-muted px-3 py-2 rounded">
{`{
  "event": "verification.completed",
  "timestamp": "${new Date().toISOString()}",
  "data": {
    "id": "ver_test_123",
    "status": "completed",
    "risk_score": 25,
    "user": {
      "id": "usr_test_456",
      "email": "test@example.com"
    }
  }
}`}
                </pre>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTestModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTestWebhook} disabled={isTesting}>
              {isTesting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Send Test
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Add missing Select import
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";