'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Building, Users, Briefcase } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function CreateWorkspacePage() {
  const router = useRouter();
  const [workspaceName, setWorkspaceName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // In a real app, this would create a new workspace
    toast({
      title: 'Feature coming soon',
      description: 'Creating new workspaces will be available in a future update.',
    });

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create a new workspace</h1>
            <p className="text-sm text-muted-foreground">
              Set up a workspace for your team to collaborate
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Details</CardTitle>
              <CardDescription>
                Give your new workspace a name and tell us a bit about your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="workspace-name">
                    <Building className="h-4 w-4 inline mr-2" />
                    Workspace Name
                  </Label>
                  <Input
                    id="workspace-name"
                    placeholder="e.g., Acme Corp"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    This is the name of your workspace that everyone will see
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-name">
                    <Briefcase className="h-4 w-4 inline mr-2" />
                    Company or Organization Name
                  </Label>
                  <Input
                    id="company-name"
                    placeholder="e.g., Acme Corporation"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional: The name of your company or organization
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="team-size">
                    <Users className="h-4 w-4 inline mr-2" />
                    Team Size
                  </Label>
                  <select
                    id="team-size"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Select team size</option>
                    <option value="1-10">1-10 people</option>
                    <option value="11-50">11-50 people</option>
                    <option value="51-200">51-200 people</option>
                    <option value="201-500">201-500 people</option>
                    <option value="500+">500+ people</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    This helps us customize your experience
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={!workspaceName || isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Workspace'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium mb-2">What happens next?</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• You&apos;ll be the workspace owner with full admin privileges</li>
              <li>• You can invite team members to join your workspace</li>
              <li>• Default channels #general and #random will be created</li>
              <li>• You can customize workspace settings anytime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}