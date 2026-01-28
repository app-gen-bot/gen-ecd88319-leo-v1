"use client";

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  TrendingDown,
  GitBranch,
  Briefcase,
  BarChart3,
  Users,
  RefreshCw,
  Clock,
  FileText
} from "lucide-react";
import Link from "next/link";
import { formatDateTime, getInitials } from "@/lib/utils";
import { useRealTimeMetrics } from "@/hooks/use-real-time-metrics";
import { useActivityFeed } from "@/hooks/use-activity-feed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
  icon: React.ElementType;
  link?: string;
  loading?: boolean;
}

function MetricCard({ title, value, trend, icon: Icon, link, loading }: MetricCardProps) {
  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {trend && (
              <div className={`flex items-center text-xs ${trend.positive ? 'text-green-600' : 'text-red-600'} mt-1`}>
                {trend.positive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {Math.abs(trend.value)}% vs last period
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return link ? <Link href={link}>{content}</Link> : content;
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case 'case':
      return <FileText className="h-4 w-4" />;
    case 'workflow':
      return <GitBranch className="h-4 w-4" />;
    case 'team':
      return <Users className="h-4 w-4" />;
    case 'system':
      return <Activity className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

function ActivityColor({ action }: { action: string }) {
  switch (action) {
    case 'approved':
    case 'joined':
    case 'published':
      return 'text-green-600';
    case 'flagged':
    case 'rejected':
      return 'text-red-600';
    case 'updated':
    case 'modified':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { metrics, loading: metricsLoading, refresh } = useRealTimeMetrics();
  const { activities, loading: activityLoading } = useActivityFeed(5);

  const firstName = session?.user?.name?.split(' ')[0] || "User";

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6 mobile-padding">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your identity verification platform
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Today's Verifications"
          value={metrics.todayVerifications}
          trend={metrics.trends.verifications}
          icon={Activity}
          link="/analytics"
          loading={metricsLoading}
        />
        <MetricCard
          title="Pass Rate"
          value={`${metrics.passRate.toFixed(1)}%`}
          trend={metrics.trends.passRate}
          icon={CheckCircle2}
          link="/analytics"
          loading={metricsLoading}
        />
        <MetricCard
          title="Avg Risk Score"
          value={metrics.avgRiskScore.toFixed(1)}
          trend={metrics.trends.riskScore}
          icon={AlertTriangle}
          link="/analytics"
          loading={metricsLoading}
        />
        <MetricCard
          title="Pending Cases"
          value={metrics.pendingCases}
          icon={Briefcase}
          link="/cases"
          loading={metricsLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and workflows
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Link href="/workflows/new">
              <Button className="w-full" variant="outline">
                <GitBranch className="mr-2 h-4 w-4" />
                Create Workflow
              </Button>
            </Link>
            <Link href="/cases">
              <Button className="w-full" variant="outline">
                <Briefcase className="mr-2 h-4 w-4" />
                Review Cases
              </Button>
            </Link>
            <Link href="/analytics">
              <Button className="w-full" variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
            <Link href="/settings/team">
              <Button className="w-full" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Manage Team
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest events and updates
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={refresh} disabled={activityLoading}>
                <RefreshCw className={`h-4 w-4 ${activityLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback>{getInitials(activity.user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm">
                            <span className="font-medium">{activity.user.name}</span>{" "}
                            <span className={ActivityColor({ action: activity.action })}>
                              {activity.action}
                            </span>{" "}
                            {activity.details}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <ActivityIcon type={activity.type} />
                            <span className="text-xs text-muted-foreground">
                              {formatDateTime(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>
            Real-time system performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">API Response Time</span>
                <Badge variant="success">Good</Badge>
              </div>
              <Progress value={85} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">123ms avg</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">System Load</span>
                <Badge variant="warning">Medium</Badge>
              </div>
              <Progress value={65} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">65% CPU</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Error Rate</span>
                <Badge variant="success">Low</Badge>
              </div>
              <Progress value={5} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">0.5% errors</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}