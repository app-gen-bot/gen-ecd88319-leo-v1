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
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  CalculatorIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { useToast } from '@/components/ui/use-toast';
import { mockPatients, getMockOwnerById } from '@/lib/mock-data';
import { Pet, User } from '@/types';

// Mock service catalog
const servicesCatalog = [
  { id: '1', name: 'Wellness Exam', category: 'Examination', price: 65.00 },
  { id: '2', name: 'Sick Visit Exam', category: 'Examination', price: 85.00 },
  { id: '3', name: 'Follow-up Exam', category: 'Examination', price: 45.00 },
  { id: '4', name: 'Emergency Exam', category: 'Examination', price: 150.00 },
  { id: '5', name: 'Rabies Vaccine', category: 'Vaccination', price: 35.00 },
  { id: '6', name: 'DHPP Vaccine', category: 'Vaccination', price: 45.00 },
  { id: '7', name: 'Bordetella Vaccine', category: 'Vaccination', price: 38.00 },
  { id: '8', name: 'Dental Cleaning', category: 'Dental', price: 350.00 },
  { id: '9', name: 'Tooth Extraction', category: 'Dental', price: 150.00 },
  { id: '10', name: 'Spay (Cat)', category: 'Surgery', price: 250.00 },
  { id: '11', name: 'Spay (Dog)', category: 'Surgery', price: 450.00 },
  { id: '12', name: 'Neuter (Cat)', category: 'Surgery', price: 150.00 },
  { id: '13', name: 'Neuter (Dog)', category: 'Surgery', price: 350.00 },
  { id: '14', name: 'Blood Work - Basic', category: 'Laboratory', price: 85.00 },
  { id: '15', name: 'Blood Work - Comprehensive', category: 'Laboratory', price: 150.00 },
  { id: '16', name: 'Urinalysis', category: 'Laboratory', price: 55.00 },
  { id: '17', name: 'X-Ray (2 views)', category: 'Imaging', price: 185.00 },
  { id: '18', name: 'Ultrasound', category: 'Imaging', price: 350.00 },
];

export default function NewInvoicePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Pet | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientResults, setShowPatientResults] = useState(false);
  
  const [invoiceItems, setInvoiceItems] = useState<Array<{
    id: string;
    service: string;
    description: string;
    quantity: number;
    price: number;
    total: number;
  }>>([]);

  const [formData, setFormData] = useState({
    notes: '',
    paymentTerms: '15',
  });

  // Filter patients based on search
  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const handleSelectPatient = (patient: Pet) => {
    setSelectedPatient(patient);
    setPatientSearch('');
    setShowPatientResults(false);
  };

  const handleAddItem = () => {
    const newItem = {
      id: Date.now().toString(),
      service: '',
      description: '',
      quantity: 1,
      price: 0,
      total: 0,
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const handleUpdateItem = (id: string, field: string, value: string | number) => {
    setInvoiceItems(items =>
      items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          
          // Auto-fill price when service is selected
          if (field === 'service') {
            const service = servicesCatalog.find(s => s.id === value);
            if (service) {
              updated.description = service.name;
              updated.price = service.price;
            }
          }
          
          // Recalculate total
          updated.total = updated.quantity * updated.price;
          
          return updated;
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
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
    
    if (!selectedPatient || invoiceItems.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select a patient and add at least one item",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Invoice created",
        description: "Invoice has been created successfully",
      });
      router.push('/staff/billing/invoices');
    }, 1500);
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
              <h1 className="text-3xl font-bold">New Invoice</h1>
              <p className="text-muted-foreground">Create a new invoice for services rendered</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>Select the patient for this invoice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedPatient ? (
                <div className="relative">
                  <Label htmlFor="patient-search">Search Patient</Label>
                  <div className="relative mt-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="patient-search"
                      placeholder="Search by pet or owner name..."
                      value={patientSearch}
                      onChange={(e) => {
                        setPatientSearch(e.target.value);
                        setShowPatientResults(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowPatientResults(patientSearch.length > 0)}
                      className="pl-9"
                    />
                  </div>
                  
                  {showPatientResults && filteredPatients.length > 0 && (
                    <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-auto">
                      <CardContent className="p-0">
                        {filteredPatients.map(patient => (
                          <button
                            key={patient.id}
                            type="button"
                            className="w-full text-left p-3 hover:bg-muted transition-colors"
                            onClick={() => handleSelectPatient(patient)}
                          >
                            <div>
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {patient.species} • {patient.breed}
                              </p>
                            </div>
                          </button>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{selectedPatient.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPatient.species} • {selectedPatient.breed}
                      </p>
                      {(() => {
                        const owner = getMockOwnerById(selectedPatient.ownerId);
                        if (owner) {
                          return (
                            <>
                              <p className="text-sm text-muted-foreground mt-1">
                                Owner: {owner.firstName} {owner.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {owner.email} • {owner.phone}
                              </p>
                            </>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPatient(null)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Invoice Items</CardTitle>
                  <CardDescription>Add services and products to the invoice</CardDescription>
                </div>
                <Button type="button" size="sm" onClick={handleAddItem}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoiceItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No items added yet. Click "Add Item" to get started.
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {invoiceItems.map((item, _index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                        <div className="col-span-5">
                          <Label>Service/Product</Label>
                          <Select
                            value={item.service}
                            onValueChange={(value) => handleUpdateItem(item.id, 'service', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                            <SelectContent>
                              {servicesCatalog.map(service => (
                                <SelectItem key={service.id} value={service.id}>
                                  {service.name} - ${service.price}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                </>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Creating Invoice...</>
              ) : (
                <>
                  <CalculatorIcon className="h-4 w-4 mr-2" />
                  Create Invoice
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}