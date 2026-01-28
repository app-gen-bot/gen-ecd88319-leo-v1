'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  CalculatorIcon,
  PrinterIcon,
  EnvelopeIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/components/ui/use-toast';

// This would normally fetch the invoice data
const mockInvoice = {
  id: '1',
  invoiceNumber: 'INV-2024-001',
  petName: 'Max',
  petId: '1',
  ownerName: 'John Smith',
  ownerEmail: 'john@example.com',
  date: '2024-01-15',
  dueDate: '2024-01-30',
  status: 'unpaid',
  notes: 'Regular checkup and vaccinations',
  paymentTerms: '15',
  items: [
    { id: '1', description: 'Wellness Exam', quantity: 1, price: 65.00, total: 65.00 },
    { id: '2', description: 'Rabies Vaccine', quantity: 1, price: 35.00, total: 35.00 },
    { id: '3', description: 'DHPP Vaccine', quantity: 1, price: 45.00, total: 45.00 },
    { id: '4', description: 'Heartworm Test', quantity: 1, price: 55.00, total: 55.00 },
    { id: '5', description: 'Flea Prevention (6 months)', quantity: 1, price: 85.50, total: 85.50 },
  ]
};


export default function EditInvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [invoiceItems, setInvoiceItems] = useState(mockInvoice.items);
  const [formData, setFormData] = useState({
    notes: mockInvoice.notes,
    paymentTerms: mockInvoice.paymentTerms,
    dueDate: mockInvoice.dueDate,
  });

  const handleAddItem = () => {
    const newItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      price: 0,
      total: 0,
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const handleUpdateItem = (id: string, field: string, value: any) => {
    setInvoiceItems(items =>
      items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          
          // Recalculate total
          if (field === 'quantity' || field === 'price') {
            updated.total = updated.quantity * updated.price;
          }
          
          return updated;
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (invoiceItems.length === 1) {
      toast({
        title: "Cannot remove",
        description: "Invoice must have at least one item",
        variant: "destructive",
      });
      return;
    }
    setInvoiceItems(items => items.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Invoice updated",
        description: "Invoice has been updated successfully",
      });
      router.push('/staff/billing/invoices');
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    toast({
      title: "Invoice sent",
      description: `Invoice sent to ${mockInvoice.ownerEmail}`,
    });
  };

  const handleDuplicate = () => {
    router.push('/staff/billing/invoices/new?duplicate=' + params.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/staff/billing/invoices">
              <Button variant="ghost" size="icon">
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">Edit Invoice</h1>
                <Badge variant={mockInvoice.status === 'paid' ? 'secondary' : 'destructive'}>
                  {mockInvoice.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">{mockInvoice.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <PrinterIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleEmail}>
              <EnvelopeIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <DocumentDuplicateIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-lg">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">{mockInvoice.petName}</p>
                    <p className="text-sm text-muted-foreground">Patient</p>
                  </div>
                  <div>
                    <p className="font-semibold">{mockInvoice.ownerName}</p>
                    <p className="text-sm text-muted-foreground">{mockInvoice.ownerEmail}</p>
                  </div>
                  <div>
                    <p className="font-semibold">{new Date(mockInvoice.date).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">Invoice Date</p>
                  </div>
                  <div>
                    <p className="font-semibold">{new Date(mockInvoice.dueDate).toLocaleDateString()}</p>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoice Items</CardTitle>
                  <CardDescription>Modify items on this invoice</CardDescription>
                </div>
                <Button type="button" size="sm" onClick={handleAddItem}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {invoiceItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-5">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                        placeholder="Service or product"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleUpdateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Total</Label>
                      <Input
                        type="text"
                        value={`$${item.total.toFixed(2)}`}
                        disabled
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <TrashIcon className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (8%)</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment-terms">Payment Terms</Label>
                  <Select
                    value={formData.paymentTerms}
                    onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}
                  >
                    <SelectTrigger id="payment-terms">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Due on Receipt</SelectItem>
                      <SelectItem value="15">Net 15</SelectItem>
                      <SelectItem value="30">Net 30</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes or special instructions..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href="/staff/billing/invoices">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting || mockInvoice.status === 'paid'}>
              {isSubmitting ? (
                <>Updating Invoice...</>
              ) : (
                <>
                  <CalculatorIcon className="h-4 w-4 mr-2" />
                  Update Invoice
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}