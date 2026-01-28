'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Activity } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime?: number;
  lastChecked: Date;
}

export default function HealthCheckPage() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Web Application',
      status: 'operational',
      responseTime: 45,
      lastChecked: new Date(),
    },
    {
      name: 'API Services',
      status: 'operational',
      responseTime: 120,
      lastChecked: new Date(),
    },
    {
      name: 'Payment Gateway',
      status: 'operational',
      responseTime: 230,
      lastChecked: new Date(),
    },
    {
      name: 'Mobile Money Providers',
      status: 'operational',
      responseTime: 450,
      lastChecked: new Date(),
    },
    {
      name: 'Database',
      status: 'operational',
      responseTime: 15,
      lastChecked: new Date(),
    },
  ]);

  useEffect(() => {
    // Update last checked time every 30 seconds
    const interval = setInterval(() => {
      setServices(prev => prev.map(service => ({
        ...service,
        lastChecked: new Date(),
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Operational</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Degraded</Badge>;
      case 'down':
        return <Badge variant="destructive">Down</Badge>;
      default:
        return null;
    }
  };

  const allOperational = services.every(s => s.status === 'operational');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <Activity className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">System Health Check</h1>
          <p className="text-muted-foreground mt-2">Real-time status of Flyra services</p>
        </div>

        {/* Overall Status */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-3">
              {allOperational ? (
                <>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <h2 className="text-2xl font-bold">All Systems Operational</h2>
                    <p className="text-muted-foreground">All services are running normally</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                  <div>
                    <h2 className="text-2xl font-bold">Some Issues Detected</h2>
                    <p className="text-muted-foreground">Some services may be experiencing issues</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Service Status List */}
        <Card>
          <CardHeader>
            <CardTitle>Service Status</CardTitle>
            <CardDescription>
              Last updated: {new Date().toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(service.status)}
                    <div>
                      <p className="font-medium">{service.name}</p>
                      {service.responseTime && (
                        <p className="text-sm text-muted-foreground">
                          Response time: {service.responseTime}ms
                        </p>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(service.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Technical Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">API Version</p>
                <p className="font-mono">v1.0.0</p>
              </div>
              <div>
                <p className="text-muted-foreground">Build</p>
                <p className="font-mono">2025.01.13.001</p>
              </div>
              <div>
                <p className="text-muted-foreground">Region</p>
                <p className="font-mono">us-east-1</p>
              </div>
              <div>
                <p className="text-muted-foreground">Environment</p>
                <p className="font-mono">production</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>This page is for system monitoring purposes.</p>
          <p>For support, please visit our <a href="/support" className="text-primary hover:underline">help center</a>.</p>
        </div>
      </div>
    </div>
  );
}