'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import {
  MessageSquare,
  Camera,
  FileText,
  AlertCircle,
  Mail,
  Calculator,
  Send,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Clock,
  Info
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { DashboardSkeleton } from '@/components/loading-skeletons';

const features = [
  {
    id: 'ai-chat',
    title: 'AI Legal Advisor',
    description: 'Get instant answers to your tenant rights questions',
    icon: MessageSquare,
    href: '/chat',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    status: 'available'
  },
  {
    id: 'documentation',
    title: 'Smart Documentation',
    description: 'Capture and organize evidence with AI assistance',
    icon: Camera,
    href: '/documentation',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    status: 'available'
  },
  {
    id: 'document-review',
    title: 'Document Review',
    description: 'AI-powered analysis of leases and notices',
    icon: FileText,
    href: '/document-review',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    status: 'available'
  },
  {
    id: 'dispute-wizard',
    title: 'Dispute Wizard',
    description: 'Step-by-step guidance for tenant disputes',
    icon: AlertCircle,
    href: '/dispute-wizard',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    status: 'available'
  },
  {
    id: 'letter-generator',
    title: 'Letter Generator',
    description: 'Create professional letters to your landlord',
    icon: Mail,
    href: '/letter-generator',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    status: 'available'
  },
  {
    id: 'security-deposit',
    title: 'Security Deposit Tracker',
    description: 'Calculate interest and track deductions',
    icon: Calculator,
    href: '/security-deposit',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    status: 'available'
  },
  {
    id: 'communications',
    title: 'Communication Hub',
    description: 'Track all landlord communications in one place',
    icon: Send,
    href: '/communications',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    status: 'available'
  },
  {
    id: 'knowledge',
    title: 'Knowledge Base',
    description: 'California tenant laws and resources',
    icon: BookOpen,
    href: '/knowledge',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    status: 'available'
  }
];

const onboardingSteps = [
  { id: 1, title: 'Upload your lease', completed: false },
  { id: 2, title: 'Set up your profile', completed: false },
  { id: 3, title: 'Explore AI Legal Advisor', completed: false },
  { id: 4, title: 'Learn about your rights', completed: false }
];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [dismissedOnboarding, setDismissedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <DashboardSkeleton />
      </div>
    );
  }
  
  // Mock data for recent activity
  const recentActivity = [
    {
      id: 1,
      type: 'chat',
      title: 'Asked about security deposit laws',
      time: '2 hours ago',
      icon: MessageSquare
    },
    {
      id: 2,
      type: 'document',
      title: 'Uploaded lease agreement',
      time: '1 day ago',
      icon: FileText
    },
    {
      id: 3,
      type: 'letter',
      title: 'Generated repair request letter',
      time: '3 days ago',
      icon: Mail
    }
  ];

  const completedSteps = onboardingSteps.filter(step => step.completed).length;
  const onboardingProgress = (completedSteps / onboardingSteps.length) * 100;

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'there'}!</h1>
        <p className="text-muted-foreground mt-2">
          Your AI-powered tenant rights advisor is here to help
        </p>
      </div>

      {/* Onboarding Checklist */}
      {!dismissedOnboarding && (
        <Alert className="relative">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Get started with AI Tenant Rights Advisor</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDismissedOnboarding(true)}
                  className="absolute top-2 right-2"
                >
                  Dismiss
                </Button>
              </div>
              <Progress value={onboardingProgress} className="h-2" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {onboardingSteps.map((step) => (
                  <div key={step.id} className="flex items-center space-x-2">
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                    )}
                    <span className={step.completed ? 'line-through text-muted-foreground' : ''}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <Card key={activity.id} className="hover:shadow-sm transition-shadow cursor-pointer">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <activity.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Continue
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Feature Tiles */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <Card
              key={feature.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => router.push(feature.href)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  {feature.status === 'in-progress' && (
                    <Badge variant="secondary" className="text-xs">
                      In Progress
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-4">{feature.title}</CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="ghost"
                  className="w-full justify-between group-hover:bg-accent"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(feature.href);
                  }}
                >
                  {feature.status === 'in-progress' ? 'Continue' : 'Start'}
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle>Need immediate help?</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Our AI advisor is available 24/7 to answer your questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="secondary"
            onClick={() => router.push('/chat')}
            className="w-full sm:w-auto"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Start a conversation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}