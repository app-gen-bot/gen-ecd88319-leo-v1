'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { getMockPrescriptionsByOwner } from '@/lib/mock-data';
import { Prescription } from '@/types';
import { format } from 'date-fns';
import { ArrowLeft, Pill, AlertCircle } from 'lucide-react';
import { toast } from '@/lib/use-toast';

export default function RefillRequestPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [pharmacy, setPharmacy] = useState('current');
  const [quantity, setQuantity] = useState('same');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user) {
      // Simulate API call
      setTimeout(() => {
        const prescriptions = getMockPrescriptionsByOwner(user.id);
        const found = prescriptions.find(rx => rx.id === params.id);
        if (found) {
          setPrescription(found);
        }
        setIsLoading(false);
      }, 1000);
    }
  }, [user, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Refill request submitted!',
        description: 'Your pharmacy will process this request within 24 hours.',
      });
      
      router.push('/client/prescriptions/active');
    } catch (error) {
      toast({
        title: 'Request failed',
        description: 'Unable to submit refill request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Prescription not found</p>
          <Link href="/client/prescriptions/active">
            <Button>Back to Prescriptions</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/client/prescriptions/active">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Prescriptions
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Request Prescription Refill</h1>
        <p className="text-muted-foreground">Submit a refill request for your pet's medication</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Prescription Details */}
        <Card>
          <CardHeader>
            <CardTitle>Prescription Details</CardTitle>
            <CardDescription>Requesting refill for the following medication</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Pill className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-semibold">{prescription.medication}</h4>
                  <p className="text-sm text-muted-foreground">
                    {prescription.dosage} • {prescription.frequency} • {prescription.duration}
                  </p>
                  <div className="flex items-center space-x-2 pt-1">
                    <Badge variant="outline">{prescription.pet?.name}</Badge>
                    <Badge variant="secondary">{prescription.refills} refills remaining</Badge>
                  </div>
                </div>
              </div>
              <div className="pt-2 space-y-1 text-sm">
                <p><span className="font-medium">Prescribed by:</span> Dr. Smith</p>
                <p><span className="font-medium">Prescribed on:</span> {format(new Date(prescription.prescribedDate), 'MMM d, yyyy')}</p>
                <p><span className="font-medium">Last filled:</span> {format(new Date(prescription.prescribedDate), 'MMM d, yyyy')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refill Options */}
        <Card>
          <CardHeader>
            <CardTitle>Refill Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pharmacy Selection */}
            <div className="space-y-3">
              <Label>Select Pharmacy</Label>
              <RadioGroup value={pharmacy} onValueChange={setPharmacy}>
                <div className="space-y-2">
                  <label
                    htmlFor="current-pharmacy"
                    className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent"
                  >
                    <RadioGroupItem value="current" id="current-pharmacy" />
                    <div className="flex-1">
                      <p className="font-medium">Current Pharmacy</p>
                      <p className="text-sm text-muted-foreground">PawsFlow Pharmacy - 123 Main St</p>
                    </div>
                  </label>
                  <label
                    htmlFor="new-pharmacy"
                    className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent"
                  >
                    <RadioGroupItem value="new" id="new-pharmacy" />
                    <div>
                      <p className="font-medium">Transfer to New Pharmacy</p>
                      <p className="text-sm text-muted-foreground">Select a different pharmacy</p>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <Label>Quantity</Label>
              <RadioGroup value={quantity} onValueChange={setQuantity}>
                <div className="space-y-2">
                  <label
                    htmlFor="same-quantity"
                    className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent"
                  >
                    <RadioGroupItem value="same" id="same-quantity" />
                    <div>
                      <p className="font-medium">Same as last time</p>
                      <p className="text-sm text-muted-foreground">{prescription.quantity} {prescription.medication}</p>
                    </div>
                  </label>
                  <label
                    htmlFor="different-quantity"
                    className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-accent"
                  >
                    <RadioGroupItem value="different" id="different-quantity" />
                    <div>
                      <p className="font-medium">Different quantity</p>
                      <p className="text-sm text-muted-foreground">Request a different amount</p>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions or questions for the pharmacy?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="bg-muted">
          <CardContent className="flex items-start space-x-3 p-4">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium">Important Information</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Refill requests are typically processed within 24 hours</li>
                <li>• You'll receive a notification when your prescription is ready</li>
                <li>• Some medications may require veterinarian approval</li>
                <li>• Contact us if you need this medication urgently</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link href="/client/prescriptions/active" className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Refill Request'}
          </Button>
        </div>
      </form>
    </div>
  );
}