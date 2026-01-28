'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Search,
  FileText,
  Calendar,
  DollarSign,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  status: 'pending' | 'approved' | 'shipped' | 'received' | 'cancelled';
  createdDate: string;
  expectedDate?: string;
  receivedDate?: string;
  totalItems: number;
  totalCost: number;
  items: {
    productName: string;
    quantity: number;
    unitCost: number;
  }[];
}

const mockOrders: PurchaseOrder[] = [
  {
    id: '1',
    orderNumber: 'PO-2024-001',
    supplier: 'VetMed Supplies',
    status: 'shipped',
    createdDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    expectedDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    totalItems: 3,
    totalCost: 245.50,
    items: [
      { productName: 'Amoxicillin 250mg', quantity: 100, unitCost: 0.50 },
      { productName: 'Surgical Sutures 3-0', quantity: 50, unitCost: 3.50 },
      { productName: 'Gauze Pads', quantity: 200, unitCost: 0.10 },
    ],
  },
  {
    id: '2',
    orderNumber: 'PO-2024-002',
    supplier: 'BioVet Inc',
    status: 'pending',
    createdDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    expectedDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    totalItems: 2,
    totalCost: 850.00,
    items: [
      { productName: 'Rabies Vaccine', quantity: 50, unitCost: 15.00 },
      { productName: 'DHPP Vaccine', quantity: 20, unitCost: 5.00 },
    ],
  },
  {
    id: '3',
    orderNumber: 'PO-2024-003',
    supplier: 'MedSupply Co',
    status: 'received',
    createdDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    expectedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    receivedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    totalItems: 5,
    totalCost: 420.00,
    items: [
      { productName: 'Exam Gloves (Box)', quantity: 20, unitCost: 12.00 },
      { productName: 'Syringes 3ml', quantity: 100, unitCost: 0.15 },
      { productName: 'Alcohol Swabs', quantity: 500, unitCost: 0.02 },
      { productName: 'Bandages', quantity: 50, unitCost: 0.50 },
      { productName: 'Thermometers', quantity: 5, unitCost: 25.00 },
    ],
  },
];

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-500' },
  approved: { label: 'Approved', icon: CheckCircle2, color: 'text-blue-500' },
  shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-500' },
  received: { label: 'Received', icon: CheckCircle2, color: 'text-green-500' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-500' },
};

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<PurchaseOrder[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');

  const filteredOrders = orders.filter(order => {
    if (searchTerm && !order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !order.supplier.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    if (supplierFilter !== 'all' && order.supplier !== supplierFilter) {
      return false;
    }
    return true;
  });

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalValue: orders.reduce((sum, o) => sum + o.totalCost, 0),
    averageValue: orders.length > 0 ? orders.reduce((sum, o) => sum + o.totalCost, 0) / orders.length : 0,
  };

  const handleReceiveOrder = (orderId: string) => {
    toast({
      title: 'Receive order',
      description: 'This would open the receive inventory interface.',
    });
    router.push('/staff/inventory/receive');
  };

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge variant="outline" className="gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
  };

  const suppliers = ['all', ...Array.from(new Set(orders.map(o => o.supplier)))];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage supplier orders and deliveries</p>
        </div>
        <Button onClick={() => router.push('/staff/inventory/orders/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Order
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.averageValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={supplierFilter} onValueChange={setSupplierFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier} value={supplier}>
                    {supplier === 'all' ? 'All Suppliers' : supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{format(new Date(order.createdDate), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    {order.expectedDate ? format(new Date(order.expectedDate), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>{order.totalItems}</TableCell>
                  <TableCell className="text-right font-medium">${order.totalCost.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push(`/staff/inventory/orders/${order.id}`)}
                      >
                        View
                      </Button>
                      {order.status === 'shipped' && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleReceiveOrder(order.id)}
                        >
                          Receive
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}