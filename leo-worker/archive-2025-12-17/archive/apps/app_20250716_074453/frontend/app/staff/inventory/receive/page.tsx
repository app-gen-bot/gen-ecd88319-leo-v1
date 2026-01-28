'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { 
  Package, 
  Barcode,
  CheckCircle2,
  AlertTriangle,
  CalendarIcon,
  Plus,
  Minus,
  Save
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReceiveItem {
  id: string;
  productName: string;
  sku: string;
  orderedQuantity: number;
  receivedQuantity: number;
  damaged: number;
  expirationDate?: Date;
  batchNumber?: string;
  verified: boolean;
}

const mockOrderItems: ReceiveItem[] = [
  {
    id: '1',
    productName: 'Amoxicillin 250mg',
    sku: 'MED-001',
    orderedQuantity: 100,
    receivedQuantity: 0,
    damaged: 0,
    verified: false,
  },
  {
    id: '2',
    productName: 'Surgical Sutures 3-0',
    sku: 'SUP-001',
    orderedQuantity: 50,
    receivedQuantity: 0,
    damaged: 0,
    verified: false,
  },
  {
    id: '3',
    productName: 'Gauze Pads',
    sku: 'SUP-002',
    orderedQuantity: 200,
    receivedQuantity: 0,
    damaged: 0,
    verified: false,
  },
];

export default function ReceiveInventoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState('PO-2024-001');
  const [items, setItems] = useState<ReceiveItem[]>(mockOrderItems);
  const [scanMode, setScanMode] = useState(false);
  const [barcode, setBarcode] = useState('');

  const totalOrdered = items.reduce((sum, item) => sum + item.orderedQuantity, 0);
  const totalReceived = items.reduce((sum, item) => sum + item.receivedQuantity, 0);
  const totalDamaged = items.reduce((sum, item) => sum + item.damaged, 0);
  const allVerified = items.every(item => item.verified);

  const handleQuantityChange = (itemId: string, field: 'receivedQuantity' | 'damaged', value: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newValue = Math.max(0, value);
        if (field === 'receivedQuantity') {
          return { ...item, [field]: Math.min(newValue, item.orderedQuantity) };
        }
        if (field === 'damaged') {
          return { ...item, [field]: Math.min(newValue, item.receivedQuantity) };
        }
      }
      return item;
    }));
  };

  const handleExpirationDate = (itemId: string, date: Date | undefined) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, expirationDate: date } : item
    ));
  };

  const handleBatchNumber = (itemId: string, batchNumber: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, batchNumber } : item
    ));
  };

  const handleVerify = (itemId: string, verified: boolean) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, verified } : item
    ));
  };

  const handleQuickReceive = (itemId: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, receivedQuantity: item.orderedQuantity, verified: true }
        : item
    ));
  };

  const handleScanBarcode = () => {
    // Simulate barcode scanning
    toast({
      title: 'Barcode scanned',
      description: `Product identified: ${barcode}`,
    });
    setBarcode('');
  };

  const handleSaveReceipt = () => {
    if (!allVerified) {
      toast({
        title: 'Verification required',
        description: 'Please verify all items before saving.',
        variant: 'destructive',
      });
      return;
    }

    // Simulate saving
    toast({
      title: 'Receipt saved',
      description: 'Inventory has been updated successfully.',
    });
    
    // Navigate back to orders
    router.push('/staff/inventory/orders');
  };

  const hasDiscrepancies = items.some(item => 
    item.receivedQuantity !== item.orderedQuantity || item.damaged > 0
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Receive Inventory</h1>
        <p className="text-muted-foreground">Record received items from purchase order</p>
      </div>

      {/* Order Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="font-semibold">{orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Supplier</p>
              <p className="font-semibold">VetMed Supplies</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expected Delivery</p>
              <p className="font-semibold">{format(new Date(), 'MMM d, yyyy')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scanning Mode */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Barcode className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Scan or enter barcode..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScanBarcode()}
                  className="w-64"
                />
                <Button onClick={handleScanBarcode} disabled={!barcode}>
                  Add Item
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Scan Mode</span>
              <input
                type="checkbox"
                checked={scanMode}
                onChange={(e) => setScanMode(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items to Receive */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Items to Receive</CardTitle>
          <CardDescription>
            Verify quantities and record any damaged items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-center">Ordered</TableHead>
                <TableHead className="text-center">Received</TableHead>
                <TableHead className="text-center">Damaged</TableHead>
                <TableHead>Batch/Lot</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead className="text-center">Verified</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell className="text-center">{item.orderedQuantity}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleQuantityChange(item.id, 'receivedQuantity', item.receivedQuantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.receivedQuantity}
                        onChange={(e) => handleQuantityChange(item.id, 'receivedQuantity', parseInt(e.target.value) || 0)}
                        className="w-16 text-center h-7"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleQuantityChange(item.id, 'receivedQuantity', item.receivedQuantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.damaged}
                      onChange={(e) => handleQuantityChange(item.id, 'damaged', parseInt(e.target.value) || 0)}
                      className="w-16 text-center h-7"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Batch #"
                      value={item.batchNumber || ''}
                      onChange={(e) => handleBatchNumber(item.id, e.target.value)}
                      className="w-24 h-7"
                    />
                  </TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-7 text-xs",
                            !item.expirationDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {item.expirationDate ? format(item.expirationDate, "MM/dd/yy") : "Set date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={item.expirationDate}
                          onSelect={(date) => handleExpirationDate(item.id, date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={item.verified}
                      onCheckedChange={(checked) => handleVerify(item.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleQuickReceive(item.id)}
                    >
                      Quick Fill
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Receipt Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Ordered</span>
                <span className="font-medium">{totalOrdered}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Received</span>
                <span className="font-medium">{totalReceived}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Damaged</span>
                <span className="font-medium text-red-500">{totalDamaged}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-medium">Good Stock</span>
                  <span className="font-semibold">{totalReceived - totalDamaged}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            {allVerified ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">All items verified</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Verification incomplete</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Please verify all items before saving
                </p>
              </div>
            )}

            {hasDiscrepancies && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Discrepancies detected. Please review quantities and add notes.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={handleSaveReceipt} disabled={!allVerified}>
          <Save className="mr-2 h-4 w-4" />
          Save Receipt
        </Button>
      </div>
    </div>
  );
}