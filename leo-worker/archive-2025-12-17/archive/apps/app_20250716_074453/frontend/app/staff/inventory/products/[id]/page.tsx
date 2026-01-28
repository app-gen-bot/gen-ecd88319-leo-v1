'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Truck,
  Edit,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

interface StockMovement {
  id: string;
  date: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  user: string;
  balanceAfter: number;
}

const mockMovements: StockMovement[] = [
  {
    id: '1',
    date: new Date().toISOString(),
    type: 'out',
    quantity: -2,
    reason: 'Sold to client',
    user: 'Sarah Tech',
    balanceAfter: 43,
  },
  {
    id: '2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    type: 'in',
    quantity: 50,
    reason: 'Purchase order #PO-123',
    user: 'Mike Manager',
    balanceAfter: 45,
  },
  {
    id: '3',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    type: 'adjustment',
    quantity: -5,
    reason: 'Expired - disposed',
    user: 'Sarah Tech',
    balanceAfter: -5,
  },
];

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // In a real app, this would fetch product data
  const product = {
    id: params.id,
    name: 'Amoxicillin 250mg',
    sku: 'MED-001',
    category: 'Medications',
    supplier: 'VetMed Supplies',
    supplierCode: 'VM-AMX-250',
    currentStock: 45,
    reorderPoint: 20,
    reorderQuantity: 100,
    unitCost: 0.50,
    sellingPrice: 2.00,
    markup: 300,
    expirationDate: '2024-12-31',
    lastRestocked: '2024-01-15',
    status: 'in_stock',
    description: 'Broad-spectrum antibiotic for treatment of bacterial infections',
    dosageForm: 'Capsule',
    storageConditions: 'Store at room temperature, away from moisture',
    minimumStock: 10,
    maximumStock: 200,
  };

  const handleEdit = () => {
    toast({
      title: 'Edit mode',
      description: 'Product editing interface would open here',
    });
  };

  const handleReorder = () => {
    router.push(`/staff/inventory/orders/new?product=${product.id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-green-500">In Stock</Badge>;
      case 'low_stock':
        return <Badge className="bg-yellow-500">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive">Out of Stock</Badge>;
      default:
        return null;
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'adjustment':
        return <Package className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">SKU: {product.sku}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button onClick={handleReorder}>
            <Truck className="mr-2 h-4 w-4" />
            Reorder
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {product.currentStock <= product.reorderPoint && (
        <div className="mb-6 p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mr-2" />
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Stock level is below reorder point. Consider placing an order.
            </p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stock">Stock Movement</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{product.currentStock}</div>
                {getStatusBadge(product.status)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Reorder Point</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{product.reorderPoint}</div>
                <p className="text-xs text-muted-foreground">Min: {product.minimumStock}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Unit Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${product.unitCost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Markup: {product.markup}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(product.currentStock * product.unitCost).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">In inventory</p>
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{product.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Supplier</p>
                    <p className="font-medium">{product.supplier}</p>
                    <p className="text-xs text-muted-foreground">Code: {product.supplierCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dosage Form</p>
                    <p className="font-medium">{product.dosageForm}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Expiration Date</p>
                    <p className="font-medium">{product.expirationDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Restocked</p>
                    <p className="font-medium">{format(new Date(product.lastRestocked), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Storage Conditions</p>
                    <p className="font-medium">{product.storageConditions}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{product.description}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stock Movement History</CardTitle>
              <CardDescription>Track all inventory changes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell>{format(new Date(movement.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMovementIcon(movement.type)}
                          <span className="capitalize">{movement.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{movement.reason}</TableCell>
                      <TableCell>{movement.user}</TableCell>
                      <TableCell className="text-right font-medium">{movement.balanceAfter}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Details</CardTitle>
              <CardDescription>Cost and pricing information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Unit Cost</p>
                    <p className="text-2xl font-bold">${product.unitCost.toFixed(2)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Selling Price</p>
                    <p className="text-2xl font-bold">${product.sellingPrice.toFixed(2)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Profit Margin</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${(product.sellingPrice - product.unitCost).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.markup}% markup
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Price History</h4>
                  <p className="text-sm text-muted-foreground">
                    Price history tracking would be displayed here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Analytics</CardTitle>
              <CardDescription>Usage patterns and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Analytics charts would be displayed here</p>
                  <p className="text-sm">Showing usage trends, seasonal patterns, etc.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}