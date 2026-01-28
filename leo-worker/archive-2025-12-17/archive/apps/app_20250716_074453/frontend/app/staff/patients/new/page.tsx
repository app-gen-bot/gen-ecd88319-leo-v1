'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeftIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { FormField } from '@/components/ui/form-field';
import { useFormValidation, validationPatterns, type FieldValidation } from '@/hooks/use-form-validation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const speciesList = [
  'Canine',
  'Feline',
  'Avian',
  'Reptile',
  'Small Mammal',
  'Exotic',
  'Other',
];

const breedsBySpecies: Record<string, string[]> = {
  Canine: ['Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'Bulldog', 'Poodle', 'Beagle', 'Mixed Breed', 'Other'],
  Feline: ['Domestic Shorthair', 'Domestic Longhair', 'Siamese', 'Maine Coon', 'Persian', 'British Shorthair', 'Mixed Breed', 'Other'],
  Avian: ['Parrot', 'Cockatiel', 'Budgie', 'Cockatoo', 'Finch', 'Other'],
  Reptile: ['Bearded Dragon', 'Ball Python', 'Leopard Gecko', 'Red-eared Slider', 'Other'],
  'Small Mammal': ['Rabbit', 'Guinea Pig', 'Hamster', 'Ferret', 'Chinchilla', 'Other'],
  Exotic: ['Other'],
  Other: ['Other'],
};

// Validation rules for patient form
const patientValidation: FieldValidation = {
  name: { 
    required: 'Pet name is required',
    minLength: { value: 2, message: 'Pet name must be at least 2 characters' },
    maxLength: { value: 50, message: 'Pet name must be less than 50 characters' }
  },
  species: { required: 'Species is required' },
  breed: { required: 'Breed is required' },
  sex: { required: 'Sex is required' },
  dateOfBirth: { 
    required: 'Date of birth is required',
    validate: (value) => {
      const date = new Date(value);
      const today = new Date();
      if (date > today) {
        return 'Date of birth cannot be in the future';
      }
      const age = today.getFullYear() - date.getFullYear();
      if (age > 50) {
        return 'Please verify the date of birth';
      }
      return undefined;
    }
  },
  weight: {
    required: 'Weight is required',
    pattern: { value: /^\d+(\.\d{1,2})?$/, message: 'Please enter a valid weight' },
    validate: (value) => {
      const weight = parseFloat(value);
      if (weight <= 0) return 'Weight must be greater than 0';
      if (weight > 1000) return 'Please verify the weight';
      return undefined;
    }
  },
  microchipNumber: {
    pattern: { value: /^\d{15}$/, message: 'Microchip number must be 15 digits' }
  }
};

// Validation rules for owner form
const ownerValidation: FieldValidation = {
  firstName: { 
    required: 'First name is required',
    minLength: { value: 2, message: 'First name must be at least 2 characters' }
  },
  lastName: { 
    required: 'Last name is required',
    minLength: { value: 2, message: 'Last name must be at least 2 characters' }
  },
  email: {
    required: 'Email is required',
    pattern: validationPatterns.email
  },
  phone: {
    required: 'Phone number is required',
    pattern: validationPatterns.phone,
    minLength: { value: 10, message: 'Phone number must be at least 10 digits' }
  },
  address: { required: 'Address is required' },
  city: { required: 'City is required' },
  state: { 
    required: 'State is required',
    maxLength: { value: 2, message: 'Use 2-letter state code' }
  },
  zipCode: {
    required: 'ZIP code is required',
    pattern: validationPatterns.zipCode
  },
  emergencyContact: { required: 'Emergency contact name is required' },
  emergencyPhone: {
    required: 'Emergency phone is required',
    pattern: validationPatterns.phone
  }
};

export default function NewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('patient');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Patient form validation
  const patientForm = useFormValidation({
    name: '',
    species: '',
    breed: '',
    sex: '',
    neutered: false,
    dateOfBirth: '',
    color: '',
    microchipNumber: '',
    weight: '',
    weightUnit: 'lbs',
  }, patientValidation);

  // Owner form validation  
  const ownerForm = useFormValidation({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    preferredContact: 'email',
    emergencyContact: '',
    emergencyPhone: '',
  }, ownerValidation);

  // Medical Info (no validation required)
  const [medicalData, setMedicalData] = useState({
    allergies: '',
    currentMedications: '',
    medicalHistory: '',
    behaviorNotes: '',
    dietaryRestrictions: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate both forms
    const isPatientValid = patientForm.validateForm();
    const isOwnerValid = ownerForm.validateForm();
    
    if (!isPatientValid || !isOwnerValid) {
      // Switch to the first tab with errors
      if (!isPatientValid) {
        setActiveTab('patient');
      } else if (!isOwnerValid) {
        setActiveTab('owner');
      }
      
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Success!',
        description: `${patientForm.values.name} has been registered successfully.`,
      });
      
      router.push('/staff/patients');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to register patient. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available breeds based on selected species
  const availableBreeds = patientForm.values.species 
    ? breedsBySpecies[patientForm.values.species] || []
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href="/staff/patients" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Patients
          </Link>
          <h1 className="text-3xl font-bold">Register New Patient</h1>
          <p className="text-muted-foreground">Add a new pet to the system</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="patient">Patient Info</TabsTrigger>
                <TabsTrigger value="owner">Owner Info</TabsTrigger>
                <TabsTrigger value="medical">Medical Info</TabsTrigger>
              </TabsList>

              {/* Patient Information Tab */}
              <TabsContent value="patient" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Pet Name"
                    name="name"
                    placeholder="e.g., Buddy"
                    required
                    {...patientForm.getFieldProps('name')}
                    error={patientForm.getFieldError('name')}
                    touched={patientForm.touched.name}
                  />

                  <FormField
                    label="Species"
                    name="species"
                    type="select"
                    required
                    options={speciesList.map(s => ({ value: s, label: s }))}
                    {...patientForm.getFieldProps('species')}
                    error={patientForm.getFieldError('species')}
                    touched={patientForm.touched.species}
                  />

                  <FormField
                    label="Breed"
                    name="breed"
                    type="select"
                    required
                    options={availableBreeds.map(b => ({ value: b, label: b }))}
                    disabled={!patientForm.values.species}
                    {...patientForm.getFieldProps('breed')}
                    error={patientForm.getFieldError('breed')}
                    touched={patientForm.touched.breed}
                  />

                  <div className="space-y-2">
                    <Label className="after:content-['*'] after:ml-0.5 after:text-destructive">Sex</Label>
                    <RadioGroup
                      value={patientForm.values.sex}
                      onValueChange={(value) => {
                        const event = {
                          target: { name: 'sex', value, type: 'radio' }
                        } as React.ChangeEvent<HTMLInputElement>;
                        patientForm.handleChange('sex')(event);
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male" className="font-normal">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female" className="font-normal">Female</Label>
                        </div>
                      </div>
                    </RadioGroup>
                    {patientForm.hasFieldError('sex') && (
                      <p className="text-sm text-destructive">{patientForm.getFieldError('sex')}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox
                      id="neutered"
                      checked={patientForm.values.neutered}
                      onCheckedChange={(checked) => {
                        const event = {
                          target: { name: 'neutered', checked, type: 'checkbox' }
                        } as React.ChangeEvent<HTMLInputElement>;
                        patientForm.handleChange('neutered')(event);
                      }}
                    />
                    <Label 
                      htmlFor="neutered" 
                      className="text-sm font-normal cursor-pointer"
                    >
                      Spayed/Neutered
                    </Label>
                  </div>

                  <FormField
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    required
                    {...patientForm.getFieldProps('dateOfBirth')}
                    error={patientForm.getFieldError('dateOfBirth')}
                    touched={patientForm.touched.dateOfBirth}
                  />

                  <FormField
                    label="Color/Markings"
                    name="color"
                    placeholder="e.g., Brown with white spots"
                    {...patientForm.getFieldProps('color')}
                  />

                  <FormField
                    label="Microchip Number"
                    name="microchipNumber"
                    placeholder="15-digit number"
                    helpText="Optional: Enter if pet has a microchip"
                    {...patientForm.getFieldProps('microchipNumber')}
                    error={patientForm.getFieldError('microchipNumber')}
                    touched={patientForm.touched.microchipNumber}
                  />

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <FormField
                        label="Weight"
                        name="weight"
                        type="number"
                        placeholder="0.00"
                        required
                        {...patientForm.getFieldProps('weight')}
                        error={patientForm.getFieldError('weight')}
                        touched={patientForm.touched.weight}
                      />
                    </div>
                    <div className="w-24 pt-8">
                      <RadioGroup
                        value={patientForm.values.weightUnit}
                        onValueChange={(value) => {
                          const event = {
                            target: { name: 'weightUnit', value }
                          } as React.ChangeEvent<HTMLInputElement>;
                          patientForm.handleChange('weightUnit')(event);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="lbs" id="lbs" />
                          <Label htmlFor="lbs" className="font-normal">lbs</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="kg" id="kg" />
                          <Label htmlFor="kg" className="font-normal">kg</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Owner Information Tab */}
              <TabsContent value="owner" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="First Name"
                    name="firstName"
                    required
                    {...ownerForm.getFieldProps('firstName')}
                    error={ownerForm.getFieldError('firstName')}
                    touched={ownerForm.touched.firstName}
                  />

                  <FormField
                    label="Last Name"
                    name="lastName"
                    required
                    {...ownerForm.getFieldProps('lastName')}
                    error={ownerForm.getFieldError('lastName')}
                    touched={ownerForm.touched.lastName}
                  />

                  <FormField
                    label="Email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    {...ownerForm.getFieldProps('email')}
                    error={ownerForm.getFieldError('email')}
                    touched={ownerForm.touched.email}
                  />

                  <FormField
                    label="Phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="(555) 123-4567"
                    autoComplete="tel"
                    {...ownerForm.getFieldProps('phone')}
                    error={ownerForm.getFieldError('phone')}
                    touched={ownerForm.touched.phone}
                  />

                  <FormField
                    label="Alternate Phone"
                    name="alternatePhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    {...ownerForm.getFieldProps('alternatePhone')}
                  />

                  <div className="space-y-2">
                    <Label>Preferred Contact Method</Label>
                    <RadioGroup
                      value={ownerForm.values.preferredContact}
                      onValueChange={(value) => {
                        const event = {
                          target: { name: 'preferredContact', value }
                        } as React.ChangeEvent<HTMLInputElement>;
                        ownerForm.handleChange('preferredContact')(event);
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="email" id="contact-email" />
                          <Label htmlFor="contact-email" className="font-normal">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="phone" id="contact-phone" />
                          <Label htmlFor="contact-phone" className="font-normal">Phone</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="text" id="contact-text" />
                          <Label htmlFor="contact-text" className="font-normal">Text</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="md:col-span-2">
                    <FormField
                      label="Address"
                      name="address"
                      required
                      placeholder="123 Main Street"
                      {...ownerForm.getFieldProps('address')}
                      error={ownerForm.getFieldError('address')}
                      touched={ownerForm.touched.address}
                    />
                  </div>

                  <FormField
                    label="City"
                    name="city"
                    required
                    {...ownerForm.getFieldProps('city')}
                    error={ownerForm.getFieldError('city')}
                    touched={ownerForm.touched.city}
                  />

                  <FormField
                    label="State"
                    name="state"
                    required
                    placeholder="CA"
                    {...ownerForm.getFieldProps('state')}
                    error={ownerForm.getFieldError('state')}
                    touched={ownerForm.touched.state}
                  />

                  <FormField
                    label="ZIP Code"
                    name="zipCode"
                    required
                    placeholder="12345"
                    {...ownerForm.getFieldProps('zipCode')}
                    error={ownerForm.getFieldError('zipCode')}
                    touched={ownerForm.touched.zipCode}
                  />

                  <div className="md:col-span-2 border-t pt-4 mt-2">
                    <h3 className="font-medium mb-4">Emergency Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Emergency Contact Name"
                        name="emergencyContact"
                        required
                        placeholder="John Doe"
                        {...ownerForm.getFieldProps('emergencyContact')}
                        error={ownerForm.getFieldError('emergencyContact')}
                        touched={ownerForm.touched.emergencyContact}
                      />

                      <FormField
                        label="Emergency Phone"
                        name="emergencyPhone"
                        type="tel"
                        required
                        placeholder="(555) 123-4567"
                        {...ownerForm.getFieldProps('emergencyPhone')}
                        error={ownerForm.getFieldError('emergencyPhone')}
                        touched={ownerForm.touched.emergencyPhone}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Medical Information Tab */}
              <TabsContent value="medical" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <FormField
                    label="Known Allergies"
                    name="allergies"
                    type="textarea"
                    placeholder="List any known allergies..."
                    value={medicalData.allergies}
                    onChange={(e) => setMedicalData({ ...medicalData, allergies: e.target.value })}
                  />

                  <FormField
                    label="Current Medications"
                    name="currentMedications"
                    type="textarea"
                    placeholder="List current medications and dosages..."
                    value={medicalData.currentMedications}
                    onChange={(e) => setMedicalData({ ...medicalData, currentMedications: e.target.value })}
                  />

                  <FormField
                    label="Medical History"
                    name="medicalHistory"
                    type="textarea"
                    placeholder="Previous surgeries, conditions, etc..."
                    rows={4}
                    value={medicalData.medicalHistory}
                    onChange={(e) => setMedicalData({ ...medicalData, medicalHistory: e.target.value })}
                  />

                  <FormField
                    label="Behavior Notes"
                    name="behaviorNotes"
                    type="textarea"
                    placeholder="Any behavioral issues or special handling needs..."
                    value={medicalData.behaviorNotes}
                    onChange={(e) => setMedicalData({ ...medicalData, behaviorNotes: e.target.value })}
                  />

                  <FormField
                    label="Dietary Restrictions"
                    name="dietaryRestrictions"
                    type="textarea"
                    placeholder="Special diet requirements or restrictions..."
                    value={medicalData.dietaryRestrictions}
                    onChange={(e) => setMedicalData({ ...medicalData, dietaryRestrictions: e.target.value })}
                  />

                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-4">Insurance Information (Optional)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Insurance Provider"
                        name="insuranceProvider"
                        placeholder="e.g., PetPlan, Trupanion"
                        value={medicalData.insuranceProvider}
                        onChange={(e) => setMedicalData({ ...medicalData, insuranceProvider: e.target.value })}
                      />

                      <FormField
                        label="Policy Number"
                        name="insurancePolicyNumber"
                        placeholder="Policy #"
                        value={medicalData.insurancePolicyNumber}
                        onChange={(e) => setMedicalData({ ...medicalData, insurancePolicyNumber: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/staff/patients')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                    Registering...
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="h-4 w-4 mr-2" />
                    Register Patient
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}