'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CubeIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BeakerIcon,
  HeartIcon,
  SparklesIcon,
  ClockIcon,
  TruckIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  DocumentDuplicateIcon,
  ShoppingCartIcon,
  BellAlertIcon,
  CheckCircleIcon,
  XCircleIcon,
  QrCodeIcon,
  CameraIcon,
  TagIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
} from '@heroicons/react/24/solid';

// Type definitions
interface InventoryItem {
  id: string;
  name: string;
  category: 'medication' | 'vaccine' | 'supply' | 'equipment' | 'food' | 'other';
  sku: string;
  barcode?: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  location: string;
  expirationDate?: string;
  batchNumber?: string;
  cost: number;
  price: number;
  supplier: string;
  lastOrdered?: string;
  lastRestocked?: string;
  description?: string;
  prescriptionRequired?: boolean;
  controlledSubstance?: boolean;
  storageTemp?: string;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  categories: string[];
  accountNumber?: string;
  paymentTerms: string;
  leadTime: string;
  rating: number;
  notes?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  supplier: string;
  orderDate: string;
  expectedDate?: string;
  receivedDate?: string;
  status: 'pending' | 'ordered' | 'shipped' | 'received' | 'cancelled';
  items: {
    itemId: string;
    itemName: string;
    quantity: number;
    unitCost: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  notes?: string;
}

// Mock data
const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Rabies Vaccine',
    category: 'vaccine',
    sku: 'VAC-RAB-001',
    barcode: '123456789012',
    currentStock: 15,
    minStock: 20,
    maxStock: 100,
    unit: 'vials',
    location: 'Fridge A - Shelf 2',
    expirationDate: '2024-08-15',
    batchNumber: 'RV2024-042',
    cost: 12.50,
    price: 35.00,
    supplier: 'MediVet Supplies',
    lastOrdered: '2024-01-15',
    lastRestocked: '2024-01-20',
    storageTemp: '2-8°C',
  },
  {
    id: '2',
    name: 'Amoxicillin 250mg',
    category: 'medication',
    sku: 'MED-AMX-250',
    currentStock: 250,
    minStock: 100,
    maxStock: 500,
    unit: 'tablets',
    location: 'Cabinet B - Drawer 3',
    expirationDate: '2025-03-20',
    batchNumber: 'AM2023-187',
    cost: 0.15,
    price: 0.50,
    supplier: 'PharmaCare Veterinary',
    lastOrdered: '2024-01-10',
    lastRestocked: '2024-01-12',
    prescriptionRequired: true,
  },
  {
    id: '3',
    name: 'Surgical Gloves (M)',
    category: 'supply',
    sku: 'SUP-GLV-M',
    currentStock: 45,
    minStock: 50,
    maxStock: 200,
    unit: 'boxes',
    location: 'Storage Room - Shelf 1',
    cost: 8.00,
    price: 15.00,
    supplier: 'VetSupply Pro',
    lastOrdered: '2024-01-08',
    lastRestocked: '2024-01-10',
  },
  {
    id: '4',
    name: 'Ketamine 100mg/ml',
    category: 'medication',
    sku: 'MED-KET-100',
    barcode: '987654321098',
    currentStock: 8,
    minStock: 10,
    maxStock: 30,
    unit: 'vials',
    location: 'Controlled Substances Safe',
    expirationDate: '2024-06-30',
    batchNumber: 'KT2023-095',
    cost: 25.00,
    price: 60.00,
    supplier: 'PharmaCare Veterinary',
    lastOrdered: '2023-12-15',
    lastRestocked: '2023-12-20',
    prescriptionRequired: true,
    controlledSubstance: true,
    storageTemp: 'Room temperature',
  },
  {
    id: '5',
    name: 'IV Catheter 22G',
    category: 'supply',
    sku: 'SUP-IVC-22',
    currentStock: 120,
    minStock: 50,
    maxStock: 200,
    unit: 'units',
    location: 'Procedure Room - Cabinet A',
    cost: 1.50,
    price: 5.00,
    supplier: 'MediVet Supplies',
    lastOrdered: '2024-01-05',
    lastRestocked: '2024-01-07',
  },
];

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'MediVet Supplies',
    contactPerson: 'John Smith',
    phone: '(555) 123-4567',
    email: 'orders@medivetsupplies.com',
    address: '123 Medical Drive, Vetville, VS 12345',
    categories: ['vaccines', 'supplies', 'equipment'],
    accountNumber: 'MVS-2024-001',
    paymentTerms: 'Net 30',
    leadTime: '2-3 business days',
    rating: 4.5,
    notes: 'Preferred supplier for vaccines. Good customer service.',
  },
  {
    id: '2',
    name: 'PharmaCare Veterinary',
    contactPerson: 'Sarah Johnson',
    phone: '(555) 987-6543',
    email: 'vet@pharmacare.com',
    address: '456 Pharma Street, Medtown, MT 67890',
    categories: ['medications', 'controlled substances'],
    accountNumber: 'PCV-2024-015',
    paymentTerms: 'Net 15',
    leadTime: '1-2 business days',
    rating: 5,
    notes: 'Fast delivery. Excellent for urgent orders.',
  },
  {
    id: '3',
    name: 'VetSupply Pro',
    contactPerson: 'Mike Davis',
    phone: '(555) 555-5555',
    email: 'sales@vetsupplypro.com',
    address: '789 Supply Road, Vetburg, VB 11111',
    categories: ['supplies', 'food', 'other'],
    accountNumber: 'VSP-2024-042',
    paymentTerms: 'Net 45',
    leadTime: '3-5 business days',
    rating: 4,
    notes: 'Good bulk pricing. Slower delivery times.',
  },
];

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    supplier: 'MediVet Supplies',
    orderDate: '2024-01-20',
    expectedDate: '2024-01-23',
    status: 'shipped',
    items: [
      { itemId: '1', itemName: 'Rabies Vaccine', quantity: 50, unitCost: 12.50, total: 625.00 },
      { itemId: '5', itemName: 'IV Catheter 22G', quantity: 100, unitCost: 1.50, total: 150.00 },
    ],
    subtotal: 775.00,
    tax: 62.00,
    shipping: 15.00,
    total: 852.00,
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    supplier: 'PharmaCare Veterinary',
    orderDate: '2024-01-18',
    expectedDate: '2024-01-20',
    receivedDate: '2024-01-19',
    status: 'received',
    items: [
      { itemId: '2', itemName: 'Amoxicillin 250mg', quantity: 500, unitCost: 0.15, total: 75.00 },
      { itemId: '4', itemName: 'Ketamine 100mg/ml', quantity: 20, unitCost: 25.00, total: 500.00 },
    ],
    subtotal: 575.00,
    tax: 46.00,
    shipping: 0,
    total: 621.00,
    notes: 'Express delivery - urgent order',
  },
];

// Utility functions
const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'medication':
      return BeakerIcon;
    case 'vaccine':
      return HeartIcon;
    case 'supply':
      return CubeIcon;
    case 'equipment':
      return SparklesIcon;
    case 'food':
      return ArchiveBoxIcon;
    default:
      return TagIcon;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'medication':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'vaccine':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'supply':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'equipment':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'food':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const getStockStatus = (current: number, min: number) => {
  if (current === 0) return { status: 'out', color: 'text-red-400', icon: XCircleIcon };
  if (current < min) return { status: 'low', color: 'text-yellow-400', icon: ExclamationTriangleIcon };
  return { status: 'ok', color: 'text-green-400', icon: CheckCircleIcon };
};

const getOrderStatusBadge = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    case 'ordered':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'shipped':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'received':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'cancelled':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export default function InventoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isEditItemOpen, setIsEditItemOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isBarcodeOpen, setIsBarcodeOpen] = useState(false);

  // Filter inventory items
  const filteredInventory = mockInventory.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.barcode && item.barcode.includes(searchTerm));
    const matchesLowStock = !showLowStockOnly || item.currentStock < item.minStock;
    const matchesExpiring = !showExpiringSoon || (item.expirationDate && 
                           new Date(item.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    
    return matchesCategory && matchesSearch && matchesLowStock && matchesExpiring;
  });

  // Calculate statistics
  const lowStockItems = mockInventory.filter(item => item.currentStock < item.minStock);
  const expiringItems = mockInventory.filter(item => 
    item.expirationDate && new Date(item.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const totalValue = mockInventory.reduce((sum, item) => sum + (item.currentStock * item.cost), 0);
  const totalItems = mockInventory.reduce((sum, item) => sum + item.currentStock, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Inventory Management</h1>
          <p className="text-gray-400 mt-1">Manage stock levels, track expiration dates, and order supplies</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
            onClick={() => setIsBarcodeOpen(true)}
          >
            <QrCodeIcon className="h-4 w-4 mr-2" />
            Scan Barcode
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsAddItemOpen(true)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        {lowStockItems.length > 0 && (
          <Alert className="bg-yellow-500/10 border-yellow-500/30">
            <ExclamationTriangleIconSolid className="h-4 w-4 text-yellow-400" />
            <AlertTitle className="text-yellow-400">Low Stock Alert</AlertTitle>
            <AlertDescription className="text-gray-300">
              {lowStockItems.length} items are below minimum stock levels. 
              <Button
                variant="link"
                className="text-yellow-400 hover:text-yellow-300 p-0 h-auto ml-1"
                onClick={() => setShowLowStockOnly(true)}
              >
                View items
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {expiringItems.length > 0 && (
          <Alert className="bg-red-500/10 border-red-500/30">
            <ClockIcon className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-red-400">Expiring Soon</AlertTitle>
            <AlertDescription className="text-gray-300">
              {expiringItems.length} items will expire in the next 30 days.
              <Button
                variant="link"
                className="text-red-400 hover:text-red-300 p-0 h-auto ml-1"
                onClick={() => setShowExpiringSoon(true)}
              >
                View items
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-gray-100">{totalItems}</p>
              <CubeIcon className="h-5 w-5 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-gray-100">${totalValue.toFixed(2)}</p>
              <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-yellow-400">{lowStockItems.length}</p>
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-gray-100">
                {mockOrders.filter(o => ['pending', 'ordered', 'shipped'].includes(o.status)).length}
              </p>
              <TruckIcon className="h-5 w-5 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="inventory" className="data-[state=active]:bg-gray-700">
            <CubeIcon className="h-4 w-4 mr-2" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-gray-700">
            <ShoppingCartIcon className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="data-[state=active]:bg-gray-700">
            <BuildingOfficeIcon className="h-4 w-4 mr-2" />
            Suppliers
          </TabsTrigger>
        </TabsList>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          {/* Filters */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search by name, SKU, or barcode..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-500"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[200px] bg-gray-900 border-gray-600 text-gray-100">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="medication">Medications</SelectItem>
                    <SelectItem value="vaccine">Vaccines</SelectItem>
                    <SelectItem value="supply">Supplies</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Button
                    variant={showLowStockOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                    className={showLowStockOnly 
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white" 
                      : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-gray-100"
                    }
                  >
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                    Low Stock
                  </Button>
                  <Button
                    variant={showExpiringSoon ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowExpiringSoon(!showExpiringSoon)}
                    className={showExpiringSoon 
                      ? "bg-red-600 hover:bg-red-700 text-white" 
                      : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-gray-100"
                    }
                  >
                    <ClockIcon className="h-4 w-4 mr-1" />
                    Expiring
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-700/50">
                      <TableHead className="text-gray-400">Item</TableHead>
                      <TableHead className="text-gray-400">SKU</TableHead>
                      <TableHead className="text-gray-400">Category</TableHead>
                      <TableHead className="text-gray-400">Stock</TableHead>
                      <TableHead className="text-gray-400">Location</TableHead>
                      <TableHead className="text-gray-400">Expiration</TableHead>
                      <TableHead className="text-gray-400">Cost/Price</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.map((item) => {
                      const stockStatus = getStockStatus(item.currentStock, item.minStock);
                      const CategoryIcon = getCategoryIcon(item.category);
                      const isExpiring = item.expirationDate && 
                        new Date(item.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                      
                      return (
                        <TableRow key={item.id} className="border-gray-700 hover:bg-gray-700/30">
                          <TableCell>
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${getCategoryColor(item.category)}`}>
                                <CategoryIcon className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-100">{item.name}</p>
                                {item.barcode && (
                                  <p className="text-xs text-gray-500">Barcode: {item.barcode}</p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  {item.prescriptionRequired && (
                                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                      Rx Required
                                    </Badge>
                                  )}
                                  {item.controlledSubstance && (
                                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                                      Controlled
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">{item.sku}</TableCell>
                          <TableCell>
                            <Badge className={`${getCategoryColor(item.category)} border`}>
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <stockStatus.icon className={`h-4 w-4 ${stockStatus.color}`} />
                              <div>
                                <p className={`font-medium ${stockStatus.color}`}>
                                  {item.currentStock} {item.unit}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Min: {item.minStock} | Max: {item.maxStock}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            <p className="text-sm">{item.location}</p>
                            {item.storageTemp && (
                              <p className="text-xs text-gray-500">{item.storageTemp}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.expirationDate ? (
                              <div>
                                <p className={`text-sm ${isExpiring ? 'text-red-400' : 'text-gray-300'}`}>
                                  {new Date(item.expirationDate).toLocaleDateString()}
                                </p>
                                {item.batchNumber && (
                                  <p className="text-xs text-gray-500">Batch: {item.batchNumber}</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm text-gray-300">
                                Cost: ${item.cost.toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-100 font-medium">
                                Price: ${item.price.toFixed(2)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-gray-100"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setIsEditItemOpen(true);
                                }}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-400 hover:text-red-400"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-gray-800 border-gray-700 text-gray-100">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Item</AlertDialogTitle>
                                    <AlertDialogDescription className="text-gray-400">
                                      Are you sure you want to delete "{item.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-gray-100">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-100">Order History</CardTitle>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Order
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-gray-700/50">
                    <TableHead className="text-gray-400">Order #</TableHead>
                    <TableHead className="text-gray-400">Supplier</TableHead>
                    <TableHead className="text-gray-400">Date</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Items</TableHead>
                    <TableHead className="text-gray-400">Total</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOrders.map((order) => (
                    <TableRow key={order.id} className="border-gray-700 hover:bg-gray-700/30">
                      <TableCell className="font-medium text-gray-100">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell className="text-gray-300">{order.supplier}</TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getOrderStatusBadge(order.status)} border`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {order.items.length} items
                      </TableCell>
                      <TableCell className="font-medium text-gray-100">
                        ${order.total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-gray-100"
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-100">Supplier Management</CardTitle>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setIsAddSupplierOpen(true)}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockSuppliers.map((supplier) => (
                  <Card key={supplier.id} className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-gray-100">{supplier.name}</CardTitle>
                          <CardDescription className="text-gray-400">
                            Account: {supplier.accountNumber}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-gray-100"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <PhoneIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-300">{supplier.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-300">{supplier.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPinIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-300">{supplier.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TruckIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-300">Lead time: {supplier.leadTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-300">Terms: {supplier.paymentTerms}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {supplier.categories.map((category) => (
                          <Badge
                            key={category}
                            className="bg-gray-700 text-gray-300 border-gray-600 text-xs"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Item Dialog */}
      <Dialog open={isAddItemOpen || isEditItemOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddItemOpen(false);
          setIsEditItemOpen(false);
          setSelectedItem(null);
        }
      }}>
        <DialogContent className="bg-gray-800 border-gray-700 text-gray-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditItemOpen ? 'Edit Item' : 'Add New Item'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {isEditItemOpen ? 'Update item details' : 'Enter the details for the new inventory item'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Item Name</Label>
                <Input
                  id="name"
                  defaultValue={selectedItem?.name}
                  className="bg-gray-900 border-gray-600 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-gray-300">SKU</Label>
                <Input
                  id="sku"
                  defaultValue={selectedItem?.sku}
                  className="bg-gray-900 border-gray-600 text-gray-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-300">Category</Label>
                <Select defaultValue={selectedItem?.category || 'supply'}>
                  <SelectTrigger className="bg-gray-900 border-gray-600 text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="vaccine">Vaccine</SelectItem>
                    <SelectItem value="supply">Supply</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode" className="text-gray-300">Barcode (Optional)</Label>
                <Input
                  id="barcode"
                  defaultValue={selectedItem?.barcode}
                  className="bg-gray-900 border-gray-600 text-gray-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentStock" className="text-gray-300">Current Stock</Label>
                <Input
                  id="currentStock"
                  type="number"
                  defaultValue={selectedItem?.currentStock || 0}
                  className="bg-gray-900 border-gray-600 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock" className="text-gray-300">Min Stock</Label>
                <Input
                  id="minStock"
                  type="number"
                  defaultValue={selectedItem?.minStock || 10}
                  className="bg-gray-900 border-gray-600 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStock" className="text-gray-300">Max Stock</Label>
                <Input
                  id="maxStock"
                  type="number"
                  defaultValue={selectedItem?.maxStock || 100}
                  className="bg-gray-900 border-gray-600 text-gray-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost" className="text-gray-300">Cost Price</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  defaultValue={selectedItem?.cost || 0}
                  className="bg-gray-900 border-gray-600 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-gray-300">Selling Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  defaultValue={selectedItem?.price || 0}
                  className="bg-gray-900 border-gray-600 text-gray-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-300">Storage Location</Label>
                <Input
                  id="location"
                  defaultValue={selectedItem?.location}
                  className="bg-gray-900 border-gray-600 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier" className="text-gray-300">Supplier</Label>
                <Select defaultValue={selectedItem?.supplier}>
                  <SelectTrigger className="bg-gray-900 border-gray-600 text-gray-100">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                    {mockSuppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expirationDate" className="text-gray-300">Expiration Date</Label>
                <Input
                  id="expirationDate"
                  type="date"
                  defaultValue={selectedItem?.expirationDate}
                  className="bg-gray-900 border-gray-600 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batchNumber" className="text-gray-300">Batch Number</Label>
                <Input
                  id="batchNumber"
                  defaultValue={selectedItem?.batchNumber}
                  className="bg-gray-900 border-gray-600 text-gray-100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-gray-300">Description</Label>
              <Textarea
                id="description"
                defaultValue={selectedItem?.description}
                className="bg-gray-900 border-gray-600 text-gray-100"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddItemOpen(false);
                setIsEditItemOpen(false);
                setSelectedItem(null);
              }}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-gray-100"
            >
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              {isEditItemOpen ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Supplier Dialog */}
      <Dialog open={isAddSupplierOpen} onOpenChange={setIsAddSupplierOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-gray-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter the details for the new supplier
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName" className="text-gray-300">Company Name</Label>
                <Input
                  id="supplierName"
                  className="bg-gray-900 border-gray-600 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson" className="text-gray-300">Contact Person</Label>
                <Input
                  id="contactPerson"
                  className="bg-gray-900 border-gray-600 text-gray-100"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  className="bg-gray-900 border-gray-600 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className="bg-gray-900 border-gray-600 text-gray-100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-gray-300">Address</Label>
              <Input
                id="address"
                className="bg-gray-900 border-gray-600 text-gray-100"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-gray-300">Account Number</Label>
                <Input
                  id="accountNumber"
                  className="bg-gray-900 border-gray-600 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms" className="text-gray-300">Payment Terms</Label>
                <Select>
                  <SelectTrigger className="bg-gray-900 border-gray-600 text-gray-100">
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                    <SelectItem value="net15">Net 15</SelectItem>
                    <SelectItem value="net30">Net 30</SelectItem>
                    <SelectItem value="net45">Net 45</SelectItem>
                    <SelectItem value="net60">Net 60</SelectItem>
                    <SelectItem value="cod">COD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadTime" className="text-gray-300">Lead Time</Label>
              <Input
                id="leadTime"
                placeholder="e.g., 2-3 business days"
                className="bg-gray-900 border-gray-600 text-gray-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Product Categories</Label>
              <div className="flex flex-wrap gap-2">
                {['medications', 'vaccines', 'supplies', 'equipment', 'food', 'other'].map((cat) => (
                  <label key={cat} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded bg-gray-900 border-gray-600" />
                    <span className="text-sm text-gray-300 capitalize">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-300">Notes</Label>
              <Textarea
                id="notes"
                className="bg-gray-900 border-gray-600 text-gray-100"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddSupplierOpen(false)}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-gray-100"
            >
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Add Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barcode Scanner Dialog */}
      <Dialog open={isBarcodeOpen} onOpenChange={setIsBarcodeOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-gray-100">
          <DialogHeader>
            <DialogTitle>Barcode Scanner</DialogTitle>
            <DialogDescription className="text-gray-400">
              Scan a product barcode to quickly find items
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gray-900 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <CameraIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">Camera access required for barcode scanning</p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Enable Camera
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-gray-500 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manualBarcode" className="text-gray-300">Enter barcode manually</Label>
              <div className="flex gap-2">
                <Input
                  id="manualBarcode"
                  placeholder="Enter barcode number"
                  className="bg-gray-900 border-gray-600 text-gray-100"
                />
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Search
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBarcodeOpen(false)}
              className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-gray-100"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}