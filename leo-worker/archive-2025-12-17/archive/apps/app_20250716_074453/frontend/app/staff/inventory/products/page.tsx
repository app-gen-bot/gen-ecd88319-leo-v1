'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Package,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  BarChart3,
  Edit,
  Eye,
  ShoppingCart,
  Barcode,
  ScanLine
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  currentStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  sellingPrice: number;
  expirationDate?: string;
  lastRestocked: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Amoxicillin 250mg',
    sku: 'MED-001',
    category: 'Medications',
    supplier: 'VetMed Supplies',
    currentStock: 45,
    reorderPoint: 20,
    reorderQuantity: 100,
    unitCost: 0.50,
    sellingPrice: 2.00,
    expirationDate: '2024-12-31',
    lastRestocked: '2024-01-15',
    status: 'in_stock',
  },
  {
    id: '2',
    name: 'Rabies Vaccine',
    sku: 'VAC-001',
    category: 'Vaccines',
    supplier: 'BioVet Inc',
    currentStock: 8,
    reorderPoint: 15,
    reorderQuantity: 50,
    unitCost: 15.00,
    sellingPrice: 45.00,
    expirationDate: '2024-06-30',
    lastRestocked: '2024-01-01',
    status: 'low_stock',
  },
  {
    id: '3',
    name: 'Surgical Sutures 3-0',
    sku: 'SUP-001',
    category: 'Supplies',
    supplier: 'MedSupply Co',
    currentStock: 0,
    reorderPoint: 10,
    reorderQuantity: 50,
    unitCost: 5.00,
    sellingPrice: 15.00,
    lastRestocked: '2023-12-01',
    status: 'out_of_stock',
  },
  {
    id: '4',
    name: 'Flea Treatment - Large Dog',
    sku: 'MED-002',
    category: 'Medications',
    supplier: 'PetPharm Direct',
    currentStock: 25,
    reorderPoint: 10,
    reorderQuantity: 30,
    unitCost: 25.00,
    sellingPrice: 65.00,
    expirationDate: '2025-03-31',
    lastRestocked: '2024-01-10',
    status: 'in_stock',
  },
];

const categories = [
  'All Categories',
  'Medications',
  'Vaccines',
  'Supplies',
  'Equipment',
  'Food/Treats',
];

const suppliers = [
  'All Suppliers',
  'VetMed Supplies',
  'BioVet Inc',
  'MedSupply Co',
  'PetPharm Direct',
];

export default function InventoryProductsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [supplierFilter, setSupplierFilter] = useState('All Suppliers');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState({ quantity: '', reason: '' });

  const filteredProducts = products.filter(product => {
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !product.sku.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (categoryFilter !== 'All Categories' && product.category !== categoryFilter) {
      return false;
    }
    if (supplierFilter !== 'All Suppliers' && product.supplier !== supplierFilter) {
      return false;
    }
    if (statusFilter !== 'all' && product.status !== statusFilter) {
      return false;
    }
    return true;
  });

  const stats = {
    totalProducts: products.length,
    lowStock: products.filter(p => p.status === 'low_stock').length,
    outOfStock: products.filter(p => p.status === 'out_of_stock').length,
    totalValue: products.reduce((sum, p) => sum + (p.currentStock * p.unitCost), 0),
  };

  const handleAdjustStock = () => {
    if (!selectedProduct || !stockAdjustment.quantity) return;

    const adjustment = parseInt(stockAdjustment.quantity);
    setProducts(prev => prev.map(p => {
      if (p.id === selectedProduct.id) {
        const newStock = p.currentStock + adjustment;
        return {
          ...p,
          currentStock: newStock,
          status: newStock === 0 ? 'out_of_stock' : 
                  newStock <= p.reorderPoint ? 'low_stock' : 'in_stock',
        };
      }
      return p;
    }));

    toast({
      title: 'Stock adjusted',
      description: `${selectedProduct.name} stock ${adjustment > 0 ? 'increased' : 'decreased'} by ${Math.abs(adjustment)}`,
    });

    setIsAdjustStockOpen(false);
    setStockAdjustment({ quantity: '', reason: '' });
  };

  const handleBulkAction = (action: string) => {
    if (selectedProducts.length === 0) {
      toast({
        title: 'No products selected',
        description: 'Please select products to perform this action',
        variant: 'destructive',
      });
      return;
    }

    // Handle bulk actions
    toast({
      title: `${action} action`,
      description: `Processing ${selectedProducts.length} products`,
    });
  };

  const getStatusBadge = (status: Product['status']) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-green-500">In Stock</Badge>;
      case 'low_stock':
        return <Badge className="bg-yellow-500">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive">Out of Stock</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage clinic inventory</p>
        </div>
        <Button onClick={() => router.push('/staff/inventory/products/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.lowStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.outOfStock}</div>
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
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Filters */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
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
                    {supplier}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="low_stock">Low Stock</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <ScanLine className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div className="flex items-center gap-4 mt-4 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">{selectedProducts.length} selected</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('Update Prices')}
              >
                Update Prices
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('Change Category')}
              >
                Change Category
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleBulkAction('Export')}
              >
                Export Selected
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedProducts(prev => [...prev, product.id]);
                      } else {
                        setSelectedProducts(prev => prev.filter(id => id !== product.id));
                      }
                    }}
                  />
                  <div>
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    <CardDescription className="text-xs">SKU: {product.sku}</CardDescription>
                  </div>
                </div>
                {getStatusBadge(product.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Current Stock</p>
                  <p className="font-semibold text-lg">{product.currentStock}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reorder Point</p>
                  <p className="font-semibold text-lg">{product.reorderPoint}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Unit Cost</p>
                  <p className="font-medium">${product.unitCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Selling Price</p>
                  <p className="font-medium">${product.sellingPrice.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  Category: <span className="text-foreground">{product.category}</span>
                </p>
                <p className="text-muted-foreground">
                  Supplier: <span className="text-foreground">{product.supplier}</span>
                </p>
                {product.expirationDate && (
                  <p className="text-muted-foreground">
                    Expires: <span className="text-foreground">{product.expirationDate}</span>
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/staff/inventory/products/${product.id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    setSelectedProduct(product);
                    setIsAdjustStockOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Adjust
                </Button>
                {product.currentStock <= product.reorderPoint && (
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Order
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustStockOpen} onOpenChange={setIsAdjustStockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              {selectedProduct?.name} - Current stock: {selectedProduct?.currentStock}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Adjustment Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter positive or negative number"
                value={stockAdjustment.quantity}
                onChange={(e) => setStockAdjustment(prev => ({ ...prev, quantity: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Use positive numbers to increase stock, negative to decrease
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                placeholder="e.g., Received shipment, Damaged goods, etc."
                value={stockAdjustment.reason}
                onChange={(e) => setStockAdjustment(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAdjustStockOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdjustStock}>
                Adjust Stock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}