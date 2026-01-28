'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { 
  FileText, 
  Clock, 
  Save, 
  AlertCircle, 
  ThermometerSun,
  Heart,
  Wind,
  Weight,
  Stethoscope,
  Pill,
  Syringe,
  FileX2,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMockPetById, getMockOwnerById } from '@/lib/mock-data';
import { Pet, User } from '@/types';

const soapSchema = z.object({
  // Subjective
  chiefComplaint: z.string().min(5, 'Chief complaint must be at least 5 characters'),
  history: z.string().optional(),
  ownerObservations: z.string().optional(),
  duration: z.string().optional(),
  
  // Objective - Vitals
  temperature: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 94 && num <= 106;
  }, 'Temperature must be between 94-106°F'),
  heartRate: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 40 && num <= 220;
  }, 'Heart rate must be between 40-220 bpm'),
  respiratoryRate: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 10 && num <= 60;
  }, 'Respiratory rate must be between 10-60 rpm'),
  weight: z.string().min(1, 'Weight is required'),
  bodyCondition: z.string().min(1, 'Body condition score is required'),
  
  // Physical Exam
  physicalExam: z.record(z.string()),
  
  // Assessment
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  prognosis: z.enum(['excellent', 'good', 'fair', 'guarded', 'poor']),
  differentials: z.string().optional(),
  
  // Plan
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string(),
  })).optional(),
  procedures: z.string().optional(),
  followUp: z.string().optional(),
  clientEducation: z.string().optional(),
  homeInstructions: z.string().optional(),
});

type SOAPFormValues = z.infer<typeof soapSchema>;

const examSystems = [
  { id: 'general', label: 'General Appearance', icon: FileText },
  { id: 'integument', label: 'Integument', icon: FileText },
  { id: 'musculoskeletal', label: 'Musculoskeletal', icon: FileText },
  { id: 'circulatory', label: 'Circulatory', icon: Heart },
  { id: 'respiratory', label: 'Respiratory', icon: Wind },
  { id: 'digestive', label: 'Digestive', icon: FileText },
  { id: 'genitourinary', label: 'Genitourinary', icon: FileText },
  { id: 'eyes', label: 'Eyes', icon: FileText },
  { id: 'ears', label: 'Ears', icon: FileText },
  { id: 'nervous', label: 'Nervous', icon: FileText },
  { id: 'lymph', label: 'Lymph Nodes', icon: FileText },
];

const templateComplaints = [
  'Vomiting',
  'Diarrhea',
  'Not eating',
  'Lethargy',
  'Coughing',
  'Sneezing',
  'Limping',
  'Skin irritation',
  'Ear infection',
  'Annual wellness exam',
];

export default function NewSOAPNotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activeTab, setActiveTab] = useState('subjective');
  const [pet, setPet] = useState<Pet | null>(null);
  const [owner, setOwner] = useState<User | null>(null);

  const patientId = searchParams.get('patient');

  const form = useForm<SOAPFormValues>({
    resolver: zodResolver(soapSchema),
    defaultValues: {
      bodyCondition: '5',
      physicalExam: {},
      prognosis: 'good',
      medications: [],
    },
  });

  // Load patient data
  useEffect(() => {
    if (patientId) {
      const petData = getMockPetById(patientId);
      if (petData) {
        setPet(petData);
        const ownerData = getMockOwnerById(petData.ownerId);
        setOwner(ownerData || null);
        
        // Pre-fill weight if available
        if (petData.weight) {
          form.setValue('weight', petData.weight.toString());
        }
      }
    }
  }, [patientId, form]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data: SOAPFormValues) => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'SOAP note saved',
        description: 'The medical record has been created successfully.',
      });
      router.push(`/staff/patients/${patientId}`);
    }, 1000);
  };

  const handleSaveDraft = () => {
    // Save draft logic
    toast({
      title: 'Draft saved',
      description: 'Your progress has been saved.',
    });
  };

  const setNormalExam = (system: string) => {
    const currentExam = form.getValues('physicalExam');
    form.setValue('physicalExam', {
      ...currentExam,
      [system]: 'Normal',
    });
  };

  if (!pet) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No patient selected. Please select a patient from the patient list.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">New SOAP Note</h1>
            <p className="text-muted-foreground">Create medical record for {pet.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(elapsedTime)}</span>
            </div>
            <Badge variant="outline">Auto-saving</Badge>
          </div>
        </div>
      </div>

      {/* Patient Info Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Patient</p>
              <p className="font-medium">{pet.name} ({pet.species})</p>
            </div>
            <div>
              <p className="text-muted-foreground">Breed</p>
              <p className="font-medium">{pet.breed}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Age</p>
              <p className="font-medium">{pet.dateOfBirth ? `${new Date().getFullYear() - new Date(pet.dateOfBirth).getFullYear()} years` : 'Unknown'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Owner</p>
              <p className="font-medium">{owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown'}</p>
            </div>
          </div>
          {pet.allergies && pet.allergies.length > 0 && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Allergies:</span> {pet.allergies.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="subjective">Subjective</TabsTrigger>
              <TabsTrigger value="objective">Objective</TabsTrigger>
              <TabsTrigger value="assessment">Assessment</TabsTrigger>
              <TabsTrigger value="plan">Plan</TabsTrigger>
            </TabsList>

            {/* Subjective Tab */}
            <TabsContent value="subjective" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Subjective</CardTitle>
                  <CardDescription>Chief complaint and history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="chiefComplaint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chief Complaint *</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            <Input
                              placeholder="Enter the main reason for visit..."
                              {...field}
                            />
                            <div className="flex flex-wrap gap-2">
                              {templateComplaints.map((complaint) => (
                                <Button
                                  key={complaint}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => field.onChange(complaint)}
                                >
                                  {complaint}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="history"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>History</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the history of the present illness..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ownerObservations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Observations</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What has the owner noticed?"
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration/Onset</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 3 days, 1 week, sudden onset"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Objective Tab */}
            <TabsContent value="objective" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vitals</CardTitle>
                  <CardDescription>Record vital signs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <ThermometerSun className="h-4 w-4" />
                            Temperature (°F) *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="98.6"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Normal: 100-102.5°F</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="heartRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Heart className="h-4 w-4" />
                            Heart Rate (bpm) *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="120"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Normal: 70-120 bpm</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="respiratoryRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Wind className="h-4 w-4" />
                            Respiratory Rate (rpm) *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="20"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>Normal: 10-30 rpm</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Weight className="h-4 w-4" />
                            Weight (lbs) *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="25.5"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bodyCondition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Body Condition Score (1-9) *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select score" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((score) => (
                                <SelectItem key={score} value={score.toString()}>
                                  {score} - {score <= 3 ? 'Underweight' : score <= 6 ? 'Ideal' : 'Overweight'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Physical Examination</CardTitle>
                  <CardDescription>System by system examination</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {examSystems.map((system) => (
                      <div key={system.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center gap-2">
                            <system.icon className="h-4 w-4" />
                            {system.label}
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setNormalExam(system.id)}
                          >
                            Normal
                          </Button>
                        </div>
                        <FormField
                          control={form.control}
                          name={`physicalExam.${system.id}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Examination findings..."
                                  className="min-h-[60px]"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assessment Tab */}
            <TabsContent value="assessment" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment</CardTitle>
                  <CardDescription>Diagnosis and prognosis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Diagnosis *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter primary diagnosis..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          You can search from the diagnosis database or enter custom text
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prognosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prognosis *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select prognosis" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="guarded">Guarded</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="differentials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Differential Diagnoses</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List other possible diagnoses..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Plan Tab */}
            <TabsContent value="plan" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Treatment Plan</CardTitle>
                  <CardDescription>Medications and procedures</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Pill className="h-4 w-4" />
                      Medications
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Would open prescription modal
                        toast({
                          title: 'Prescription feature',
                          description: 'This would open the prescription interface.',
                        });
                      }}
                    >
                      Add Prescription
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name="procedures"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Syringe className="h-4 w-4" />
                          Procedures
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List any procedures performed or recommended..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="followUp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Follow-up
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Recheck in 2 weeks"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clientEducation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Education</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Educational handouts provided, topics discussed..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="homeInstructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Home Care Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Instructions for the owner to follow at home..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Finalizing...' : 'Sign & Finalize'}
              </Button>
              <Button 
                type="button" 
                disabled={isSubmitting}
                onClick={() => {
                  form.handleSubmit(onSubmit)();
                  // Would also create invoice
                }}
              >
                Sign & Create Invoice
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}