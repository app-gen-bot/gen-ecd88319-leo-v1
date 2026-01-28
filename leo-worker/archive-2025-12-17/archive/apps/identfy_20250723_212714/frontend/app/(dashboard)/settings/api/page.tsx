"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { 
  Plus, 
  Key,
  Copy,
  Eye,
  EyeOff,
  MoreVertical,
  Calendar,
  Activity,
  Globe,
  AlertTriangle,
  Download
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

// Mock API keys data
const mockApiKeys = [
  {
    id: "1",
    name: "Production API Key",
    key: "id_live_aK9j2mN5pQ8rT1uW3xY6zB",
    lastFour: "Y6zB",
    permissions: ["read", "write"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90),
    lastUsed: new Date(Date.now() - 1000 * 60 * 15),
    usageCount: 15234,
    expiresAt: null,
    ipWhitelist: [],
  },
  {
    id: "2",
    name: "Development API Key",
    key: "id_test_cL3eF7gH9jK2mN4pQ6sT8v",
    lastFour: "T8v",
    permissions: ["read"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2),
    usageCount: 3456,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
    ipWhitelist: ["192.168.1.0/24"],
  },
];

const permissions = [
  { id: "read", label: "Read", description: "Read access to verifications and cases" },
  { id: "write", label: "Write", description: "Create and update verifications" },
  { id: "delete", label: "Delete", description: "Delete verifications and cases" },
  { id: "admin", label: "Admin", description: "Full administrative access" },
];

export default function ApiSettingsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<typeof mockApiKeys[0] | null>(null);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form state
  const [keyName, setKeyName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["read"]);
  const [expirationDays, setExpirationDays] = useState("");
  const [ipWhitelist, setIpWhitelist] = useState("");

  const handleCreateKey = async () => {
    if (!keyName || selectedPermissions.length === 0) {
      toast.error("Please provide a name and select permissions");
      return;
    }

    setIsCreating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate a mock key
    const newKey = `id_live_${Math.random().toString(36).substring(2, 15)}`;
    setShowKey(newKey);
    setIsCreating(false);
    
    toast.success("API key created successfully");
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const handleRevokeKey = async () => {
    if (!selectedKey) return;
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(`API key "${selectedKey.name}" has been revoked`);
    setRevokeDialogOpen(false);
    setSelectedKey(null);
  };

  const resetForm = () => {
    setKeyName("");
    setSelectedPermissions(["read"]);
    setExpirationDays("");
    setIpWhitelist("");
    setShowKey(null);
  };

  return (
    <div className="space-y-6">
      {/* API Keys List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage your API keys for programmatic access
              </CardDescription>
            </div>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockApiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">{apiKey.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        •••• {apiKey.lastFour}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyKey(apiKey.key)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {apiKey.permissions.map((permission) => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatDateTime(apiKey.lastUsed)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {apiKey.usageCount.toLocaleString()} calls
                    </div>
                  </TableCell>
                  <TableCell>
                    {apiKey.expiresAt ? (
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(apiKey.expiresAt)}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Activity className="mr-2 h-4 w-4" />
                          View Usage
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedKey(apiKey);
                            setRevokeDialogOpen(true);
                          }}
                          className="text-destructive"
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Revoke Key
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

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Learn how to integrate with our API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Base URL</h4>
              <code className="text-sm bg-muted px-3 py-2 rounded block">
                https://api.identfy.com/v1
              </code>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Authentication</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Include your API key in the Authorization header:
              </p>
              <code className="text-sm bg-muted px-3 py-2 rounded block">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Globe className="mr-2 h-4 w-4" />
                View Full Documentation
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download SDK
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create API Key Modal */}
      <Dialog open={createModalOpen} onOpenChange={(open) => {
        setCreateModalOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Generate a new API key for programmatic access
            </DialogDescription>
          </DialogHeader>

          {showKey ? (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      Save this API key now
                    </p>
                    <p className="text-amber-700 dark:text-amber-300 mt-1">
                      You won't be able to see it again after closing this dialog.
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <Label>Your API Key</Label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 text-sm bg-muted px-3 py-2 rounded">
                    {showKey}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyKey(showKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const blob = new Blob([`IDENTFY_API_KEY=${showKey}`], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = ".env";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Download as .env file
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="key-name">Key Name</Label>
                <Input
                  id="key-name"
                  placeholder="e.g., Production API Key"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                />
              </div>

              <div>
                <Label>Permissions</Label>
                <div className="space-y-3 mt-2">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={permission.id}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPermissions([...selectedPermissions, permission.id]);
                          } else {
                            setSelectedPermissions(selectedPermissions.filter(p => p !== permission.id));
                          }
                        }}
                      />
                      <div className="grid gap-1.5 leading-none">
                        <Label
                          htmlFor={permission.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {permission.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="expiration">Expiration (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="expiration"
                    type="number"
                    placeholder="90"
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty for no expiration
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ip-whitelist">IP Whitelist (Optional)</Label>
                <Input
                  id="ip-whitelist"
                  placeholder="e.g., 192.168.1.0/24"
                  value={ipWhitelist}
                  onChange={(e) => setIpWhitelist(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated IP addresses or CIDR ranges
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            {showKey ? (
              <Button onClick={() => setCreateModalOpen(false)} className="w-full">
                Done
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateKey} disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Key"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <AlertDialog open={revokeDialogOpen} onOpenChange={setRevokeDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke the API key "{selectedKey?.name}"? 
              This action cannot be undone and will immediately invalidate the key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevokeKey}
              className="bg-destructive hover:bg-destructive/90"
            >
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}