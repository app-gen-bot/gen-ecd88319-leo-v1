'use client';

import { useAuth } from '@/contexts/auth-context';
import { AuthCheck } from '@/components/auth-check';
import { DashboardNav } from '@/components/dashboard-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, AlertCircle, Clock, FileText, Upload } from 'lucide-react';

export default function KYCStatusPage() {
  const { user } = useAuth();
  const router = useRouter();

  const kycStatus = user?.kyc_status || 'pending';
  const kycProgress = kycStatus === 'verified' ? 100 : kycStatus === 'under_review' ? 66 : 33;

  const kycSteps = [
    {
      title: 'Basic Information',
      description: 'Personal details and contact information',
      status: 'completed',
      icon: CheckCircle,
    },
    {
      title: 'Identity Verification',
      description: 'Government ID and selfie verification',
      status: kycStatus === 'verified' ? 'completed' : kycStatus === 'under_review' ? 'completed' : 'pending',
      icon: kycStatus === 'verified' || kycStatus === 'under_review' ? CheckCircle : Clock,
    },
    {
      title: 'Address Verification',
      description: 'Proof of residential address',
      status: kycStatus === 'verified' ? 'completed' : 'pending',
      icon: kycStatus === 'verified' ? CheckCircle : Clock,
    },
  ];

  const getStatusBadge = () => {
    switch (kycStatus) {
      case 'verified':
        return <Badge variant="default" className="text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Verified</Badge>;
      case 'under_review':
        return <Badge variant="default" className="text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Under Review</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-sm">Action Required</Badge>;
      default:
        return <Badge variant="secondary" className="text-sm">Pending Verification</Badge>;
    }
  };

  const rejectionReasons = [
    'ID document is unclear or expired',
    'Address proof is not recent (must be within 3 months)',
  ];

  return (
    <AuthCheck>
      <div className="min-h-screen bg-background">
        <DashboardNav />
        <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.push('/profile')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">KYC Verification Status</h1>
            <p className="text-muted-foreground">Track your identity verification progress</p>
          </div>

          {/* Status Overview */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Verification Progress</CardTitle>
                {getStatusBadge()}
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={kycProgress} className="mb-4" />
              <p className="text-sm text-muted-foreground">
                {kycStatus === 'verified' 
                  ? 'Your account is fully verified. You can use all features.'
                  : kycStatus === 'under_review'
                  ? 'We're reviewing your documents. This usually takes 1-2 business days.'
                  : kycStatus === 'rejected'
                  ? 'Some issues need your attention. Please review and resubmit.'
                  : 'Complete your verification to unlock all features.'
                }
              </p>
            </CardContent>
          </Card>

          {/* Rejection Reasons */}
          {kycStatus === 'rejected' && (
            <Card className="mb-6 border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Action Required</CardTitle>
                <CardDescription>
                  Please address the following issues and resubmit your documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {rejectionReasons.map((reason, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                      <span className="text-sm">{reason}</span>
                    </li>
                  ))}
                </ul>
                <Button className="mt-4" onClick={() => router.push('/profile/kyc/resubmit')}>
                  Resubmit Documents
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Verification Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Steps</CardTitle>
              <CardDescription>
                Complete all steps to verify your identity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {kycSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = step.status === 'completed';
                  const isPending = step.status === 'pending';
                  
                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`p-2 rounded-full ${
                        isCompleted ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          isCompleted ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                        {isPending && kycStatus !== 'under_review' && (
                          <Button 
                            variant="link" 
                            className="p-0 h-auto mt-1"
                            onClick={() => router.push('/profile/kyc/upload')}
                          >
                            Complete this step →
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Benefits of Verification */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Benefits of Verification</CardTitle>
              <CardDescription>
                Unlock these features with a verified account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span>Higher transaction limits (up to $2,999 per transfer)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span>Access to all supported countries</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span>Faster transaction processing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span>Priority customer support</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Document Requirements */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Document Requirements</CardTitle>
              <CardDescription>
                What you'll need for verification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Valid Government ID</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Driver's License</li>
                  <li>• Passport</li>
                  <li>• National ID Card</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Proof of Address</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Utility bill (within 3 months)</li>
                  <li>• Bank statement</li>
                  <li>• Lease agreement</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Selfie Photo</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Clear photo of your face</li>
                  <li>• Good lighting</li>
                  <li>• No filters or edits</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthCheck>
  );
}