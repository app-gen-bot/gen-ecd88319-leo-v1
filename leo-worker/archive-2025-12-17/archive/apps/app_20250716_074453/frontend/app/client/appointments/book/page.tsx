'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/contexts/auth-context';
import { getMockPetsByOwner, mockUsers } from '@/lib/mock-data';
import { Pet, User } from '@/types';
import { format, addDays, setHours, setMinutes, isBefore, isAfter, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User as UserIcon, Stethoscope, Plus } from 'lucide-react';
import { toast } from '@/lib/use-toast';
import { cn } from '@/lib/utils';

const services = {
  'Wellness Exams': [
    { id: 'annual-checkup', name: 'Annual Checkup', duration: 30, price: '$75-95' },
    { id: 'puppy-kitten', name: 'Puppy/Kitten Exam', duration: 45, price: '$65-85' },
    { id: 'senior-exam', name: 'Senior Pet Exam', duration: 45, price: '$85-105' },
  ],
  'Sick Visits': [
    { id: 'sick-visit', name: 'Sick Visit', duration: 30, price: '$75-95' },
    { id: 'urgent-care', name: 'Urgent Care', duration: 45, price: '$125-150' },
    { id: 'follow-up', name: 'Follow-up Visit', duration: 20, price: '$45-65' },
  ],
  'Dental Care': [
    { id: 'dental-exam', name: 'Dental Examination', duration: 30, price: '$65-85' },
    { id: 'dental-cleaning', name: 'Dental Cleaning', duration: 60, price: '$250-350' },
    { id: 'tooth-extraction', name: 'Tooth Extraction', duration: 90, price: '$300-500' },
  ],
  'Surgery': [
    { id: 'spay-neuter', name: 'Spay/Neuter', duration: 120, price: '$200-400' },
    { id: 'soft-tissue', name: 'Soft Tissue Surgery', duration: 90, price: '$500-1000' },
    { id: 'orthopedic', name: 'Orthopedic Surgery', duration: 180, price: '$1500-3000' },
  ],
  'Grooming': [
    { id: 'bath-brush', name: 'Bath & Brush', duration: 60, price: '$40-80' },
    { id: 'full-groom', name: 'Full Grooming', duration: 90, price: '$60-120' },
    { id: 'nail-trim', name: 'Nail Trim', duration: 15, price: '$15-25' },
  ],
};

const providers = mockUsers.filter(u => u.role === 'veterinarian');

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
];

export default function BookAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [pets, setPets] = useState<Pet[]>([]);
  
  // Form data
  const [selectedPet, setSelectedPet] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [emailReminder, setEmailReminder] = useState(true);
  const [smsReminder, setSmsReminder] = useState(true);
  const [reminderTiming, setReminderTiming] = useState('24h');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      // Simulate API call
      setTimeout(() => {
        const userPets = getMockPetsByOwner(user.id);
        setPets(userPets);
        
        // Check if pet ID was passed in URL
        const petId = searchParams.get('pet');
        if (petId && userPets.find(p => p.id === petId)) {
          setSelectedPet(petId);
        }
        
        setIsLoading(false);
      }, 1000);
    }
  }, [user, searchParams]);

  const handleNextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!agreedToPolicy) {
      toast({
        title: 'Policy agreement required',
        description: 'Please agree to the cancellation policy to continue.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Appointment booked!',
        description: 'You will receive a confirmation email shortly.',
      });
      
      router.push('/client/appointments/upcoming');
    } catch (error) {
      toast({
        title: 'Booking failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedService = () => {
    for (const category of Object.values(services)) {
      const service = category.find(s => s.id === selectedService);
      if (service) return service;
    }
    return null;
  };

  const getSelectedPetInfo = () => {
    return pets.find(p => p.id === selectedPet);
  };

  const getSelectedProviderInfo = () => {
    return providers.find(p => p.id === selectedProvider);
  };

  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    const maxDate = addDays(today, 60);
    return isBefore(date, today) || isAfter(date, maxDate) || date.getDay() === 0; // No Sundays
  };

  const getAvailableTimeSlots = () => {
    // In a real app, this would check provider availability
    if (!selectedDate) return [];
    
    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    const currentTime = new Date();
    
    return timeSlots.filter(slot => {
      if (!isToday) return true;
      const [hours, minutes] = slot.split(':').map(Number);
      const slotTime = setMinutes(setHours(new Date(), hours), minutes);
      return isAfter(slotTime, currentTime);
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium",
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {i}
              </div>
              {i < 4 && (
                <div className={cn(
                  "w-16 h-1 mx-2",
                  i < step ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Select Pet */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Pet</CardTitle>
            <CardDescription>Choose which pet needs an appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedPet} onValueChange={setSelectedPet}>
              <div className="space-y-3">
                {pets.map((pet) => (
                  <label
                    key={pet.id}
                    htmlFor={pet.id}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors",
                      selectedPet === pet.id ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
                    )}
                  >
                    <RadioGroupItem value={pet.id} id={pet.id} />
                    <div className="flex-1">
                      <p className="font-medium">{pet.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {pet.species} • {pet.breed} • {pet.sex === 'male' ? 'Male' : 'Female'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>
            {pets.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You need to add a pet first</p>
                <Link href="/client/pets/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Pet
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleNextStep}
              disabled={!selectedPet}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Select Service */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Service</CardTitle>
            <CardDescription>What type of appointment do you need?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {Object.entries(services).map(([category, categoryServices]) => (
                <div key={category}>
                  <h3 className="font-medium mb-2">{category}</h3>
                  <RadioGroup value={selectedService} onValueChange={(value) => {
                    setSelectedService(value);
                    setSelectedCategory(category);
                  }}>
                    <div className="space-y-2">
                      {categoryServices.map((service) => (
                        <label
                          key={service.id}
                          htmlFor={service.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                            selectedService === service.id ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value={service.id} id={service.id} />
                            <div>
                              <p className="font-medium">{service.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {service.duration} min • {service.price}
                              </p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handlePreviousStep}
              className="flex-1"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleNextStep}
              disabled={!selectedService}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Select Provider & Time */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Provider & Time</CardTitle>
            <CardDescription>Choose your preferred veterinarian and appointment time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Provider Selection */}
            <div className="space-y-3">
              <Label>Preferred Provider</Label>
              <RadioGroup value={selectedProvider} onValueChange={setSelectedProvider}>
                <label
                  htmlFor="any-provider"
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    selectedProvider === 'any' ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
                  )}
                >
                  <RadioGroupItem value="any" id="any-provider" />
                  <div>
                    <p className="font-medium">Any Available Provider</p>
                    <p className="text-sm text-muted-foreground">First available appointment</p>
                  </div>
                </label>
                {providers.map((provider) => (
                  <label
                    key={provider.id}
                    htmlFor={provider.id}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedProvider === provider.id ? "border-primary bg-primary/5" : "border-border hover:bg-accent"
                    )}
                  >
                    <RadioGroupItem value={provider.id} id={provider.id} />
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Stethoscope className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Dr. {provider.lastName}</p>
                        <p className="text-sm text-muted-foreground">General Practice</p>
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Date Selection */}
            <div className="space-y-3">
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={isDateDisabled}
                className="rounded-md border mx-auto"
              />
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-3">
                <Label>Available Time Slots</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {getAvailableTimeSlots().map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className="w-full"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
                {getAvailableTimeSlots().length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No available time slots for this date
                  </p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handlePreviousStep}
              className="flex-1"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleNextStep}
              disabled={!selectedDate || !selectedTime}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 4: Confirm & Notes */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Appointment</CardTitle>
            <CardDescription>Review your appointment details and add any notes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Appointment Summary */}
            <div className="rounded-lg border p-4 space-y-3">
              <h3 className="font-medium">Appointment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pet:</span>
                  <span className="font-medium">{getSelectedPetInfo()?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-medium">{getSelectedService()?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider:</span>
                  <span className="font-medium">
                    {selectedProvider === 'any' ? 'Any Available' : `Dr. ${getSelectedProviderInfo()?.lastName}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{getSelectedService()?.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Cost:</span>
                  <span className="font-medium">{getSelectedService()?.price}</span>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Textarea
                  id="reason"
                  placeholder="Please describe your pet's symptoms or reason for visit"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Special Instructions (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special needs or requests?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            {/* Reminder Preferences */}
            <div className="space-y-3">
              <Label>Reminder Preferences</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email-reminder"
                    checked={emailReminder}
                    onCheckedChange={(checked) => setEmailReminder(checked as boolean)}
                  />
                  <Label htmlFor="email-reminder" className="font-normal cursor-pointer">
                    Email reminder
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sms-reminder"
                    checked={smsReminder}
                    onCheckedChange={(checked) => setSmsReminder(checked as boolean)}
                  />
                  <Label htmlFor="sms-reminder" className="font-normal cursor-pointer">
                    SMS reminder
                  </Label>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="policy"
                  checked={agreedToPolicy}
                  onCheckedChange={(checked) => setAgreedToPolicy(checked as boolean)}
                />
                <Label htmlFor="policy" className="font-normal cursor-pointer text-sm">
                  I understand the cancellation policy. Appointments cancelled within 24 hours may incur a fee.
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handlePreviousStep}
              className="flex-1"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleSubmit}
              disabled={!reason || !agreedToPolicy || isSubmitting}
            >
              {isSubmitting ? 'Booking...' : 'Book Appointment'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}