'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { 
  AlertTriangle, 
  TrendingDown, 
  Calendar,
  Package,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { format, addDays, isPast } from 'date-fns';

interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'expiring' | 'expired';
  productId: string;
  productName: string;
  sku: string;
  currentStock: number;
  reorderPoint: number;
  expirationDate?: string;
  priority: 'high' | 'medium' | 'low';
  acknowledged: boolean;
  createdAt: string;
}

const mockAlerts: InventoryAlert[] = [
  {
    id: '1',
    type: 'out_of_stock',
    productId: '3',
    productName: 'Surgical Sutures 3-0',
    sku: 'SUP-001',
    currentStock: 0,
    reorderPoint: 10,
    priority: 'high',
    acknowledged: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'low_stock',
    productId: '2',
    productName: 'Rabies Vaccine',
    sku: 'VAC-001',
    currentStock: 8,
    reorderPoint: 15,
    priority: 'high',
    acknowledged: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '3',
    type: 'expiring',
    productId: '5',
    productName: 'Prednisolone 5mg',
    sku: 'MED-005',
    currentStock: 30,
    reorderPoint: 20,
    expirationDate: addDays(new Date(), 15).toISOString(),
    priority: 'medium',
    acknowledged: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: '4',
    type: 'expired',
    productId: '6',
    productName: 'Eye Drops',
    sku: 'MED-006',
    currentStock: 5,
    reorderPoint: 10,
    expirationDate: addDays(new Date(), -5).toISOString(),
    priority: 'high',
    acknowledged: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
  },
];

export default function InventoryAlertsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<InventoryAlert[]>(mockAlerts);
  const [activeTab, setActiveTab] = useState<'all' | 'stock' | 'expiration'>('all');

  const getAlertIcon = (type: InventoryAlert['type']) => {
    switch (type) {
      case 'out_of_stock':
        return <Package className="h-5 w-5 text-red-500" />;
      case 'low_stock':
        return <TrendingDown className="h-5 w-5 text-yellow-500" />;
      case 'expiring':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getAlertTitle = (alert: InventoryAlert) => {
    switch (alert.type) {
      case 'out_of_stock':
        return 'Out of Stock';
      case 'low_stock':
        return `Low Stock (${alert.currentStock} remaining)`;
      case 'expiring':
        return `Expiring Soon`;
      case 'expired':
        return 'Expired';
    }
  };

  const getPriorityBadge = (priority: InventoryAlert['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Priority</Badge>;
      case 'low':
        return <Badge>Low Priority</Badge>;
    }
  };

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
    toast({
      title: 'Alert acknowledged',
      description: 'The alert has been marked as acknowledged.',
    });
  };

  const handleCreateOrder = (alert: InventoryAlert) => {
    router.push(`/staff/inventory/orders/new?product=${alert.productId}`);
  };

  const filteredAlerts = alerts.filter(alert => {
    if (activeTab === 'stock') {
      return alert.type === 'low_stock' || alert.type === 'out_of_stock';
    }
    if (activeTab === 'expiration') {
      return alert.type === 'expiring' || alert.type === 'expired';
    }
    return true;
  });

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;
  const stockAlertCount = alerts.filter(a => 
    (a.type === 'low_stock' || a.type === 'out_of_stock') && !a.acknowledged
  ).length;
  const expirationAlertCount = alerts.filter(a => 
    (a.type === 'expiring' || a.type === 'expired') && !a.acknowledged
  ).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Inventory Alerts</h1>
        <p className="text-muted-foreground">Monitor stock levels and expiration dates</p>
      </div>

      {/* Summary Alert */}
      {unacknowledgedCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have <strong>{unacknowledgedCount}</strong> unacknowledged alerts requiring attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">
            All Alerts
            {unacknowledgedCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unacknowledgedCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="stock">
            Stock Alerts
            {stockAlertCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {stockAlertCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="expiration">
            Expiration Alerts
            {expirationAlertCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {expirationAlertCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredAlerts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No active alerts</h3>
                <p className="text-muted-foreground">
                  All inventory levels are within normal ranges
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert) => (
              <Card key={alert.id} className={alert.acknowledged ? 'opacity-60' : ''}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {getAlertIcon(alert.type)}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{alert.productName}</h3>
                          <span className="text-sm text-muted-foreground">SKU: {alert.sku}</span>
                          {getPriorityBadge(alert.priority)}
                        </div>
                        
                        <p className="text-sm font-medium text-muted-foreground">
                          {getAlertTitle(alert)}
                        </p>
                        
                        {alert.expirationDate && (
                          <p className="text-sm">
                            {alert.type === 'expired' ? 'Expired on' : 'Expires on'}: {' '}
                            <span className="font-medium">
                              {format(new Date(alert.expirationDate), 'MMM d, yyyy')}
                            </span>
                          </p>
                        )}
                        
                        {(alert.type === 'low_stock' || alert.type === 'out_of_stock') && (
                          <p className="text-sm">
                            Reorder point: <span className="font-medium">{alert.reorderPoint}</span>
                          </p>
                        )}
                        
                        <p className="text-xs text-muted-foreground">
                          Created {format(new Date(alert.createdAt), 'MMM d, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {!alert.acknowledged && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Acknowledge
                        </Button>
                      )}
                      
                      {(alert.type === 'low_stock' || alert.type === 'out_of_stock') && (
                        <Button
                          size="sm"
                          onClick={() => handleCreateOrder(alert)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Create Order
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/staff/inventory/products/${alert.productId}`)}
                      >
                        View Product
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}