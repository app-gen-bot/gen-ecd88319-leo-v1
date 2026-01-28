'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download, Printer, Share2, FileText } from 'lucide-react';
import { toast } from '@/lib/use-toast';
import { format } from 'date-fns';

interface RecordDetail {
  id: string;
  petName: string;
  date: string;
  type: string;
  provider: string;
  chiefComplaint: string;
  subjective: {
    history: string;
    symptoms: string[];
  };
  objective: {
    vitals: {
      temperature: string;
      heartRate: string;
      respiratoryRate: string;
      weight: string;
      bloodPressure: string;
    };
    physicalExam: { [key: string]: string };
  };
  assessment: {
    diagnosis: string[];
    notes: string;
  };
  plan: {
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
    followUp: string;
    instructions: string[];
  };
}

// Mock record details
const mockRecordDetail: RecordDetail = {
  id: '1',
  petName: 'Max',
  date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  type: 'Sick Visit',
  provider: 'Dr. Sarah Smith',
  chiefComplaint: 'Vomiting and lethargy',
  subjective: {
    history: 'Owner reports that Max has been vomiting for the past 2 days and seems lethargic. Decreased appetite noted. No known dietary indiscretion.',
    symptoms: ['Vomiting (2-3 times daily)', 'Lethargy', 'Decreased appetite', 'Normal bowel movements'],
  },
  objective: {
    vitals: {
      temperature: '101.5°F',
      heartRate: '120 bpm',
      respiratoryRate: '24 rpm',
      weight: '75 lbs',
      bloodPressure: '130/85 mmHg',
    },
    physicalExam: {
      'General': 'Quiet, alert, responsive',
      'EENT': 'Normal',
      'Cardiovascular': 'Normal heart sounds, no murmurs',
      'Respiratory': 'Clear lung sounds bilaterally',
      'Abdomen': 'Soft, mild cranial abdominal discomfort on palpation',
      'Musculoskeletal': 'Normal gait',
      'Neurological': 'Normal mentation',
      'Integumentary': 'Normal skin and coat',
    },
  },
  assessment: {
    diagnosis: ['Acute gastroenteritis', 'Mild dehydration'],
    notes: 'Patient presents with classic signs of gastroenteritis. No signs of obstruction or serious underlying condition at this time.',
  },
  plan: {
    medications: [
      {
        name: 'Cerenia (maropitant)',
        dosage: '60mg',
        frequency: 'Once daily',
        duration: '3 days',
      },
      {
        name: 'Metronidazole',
        dosage: '250mg',
        frequency: 'Twice daily',
        duration: '5 days',
      },
    ],
    followUp: 'Recheck in 3-5 days if symptoms persist',
    instructions: [
      'Bland diet (boiled chicken and rice) for 3-5 days',
      'Small frequent meals',
      'Ensure adequate water intake',
      'Monitor for worsening symptoms',
      'Return immediately if bloody vomit or diarrhea occurs',
    ],
  },
};

export default function RecordDetailPage({ params }: { params: { petId: string; recordId: string } }) {
  const router = useRouter();
  const [record, setRecord] = useState<RecordDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRecord(mockRecordDetail);
      setIsLoading(false);
    }, 1000);
  }, [params.petId, params.recordId]);

  const handleDownload = () => {
    toast({
      title: 'Downloading record',
      description: 'Your medical record PDF is being generated.',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    toast({
      title: 'Share options',
      description: 'Sharing functionality will be available soon.',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Record not found</p>
          <Link href="/client/records">
            <Button>Back to Records</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/client/records">
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Records
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Medical Record</h1>
          <p className="text-muted-foreground">
            {record.petName} • {format(new Date(record.date), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Record Content */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{record.type}</CardTitle>
              <CardDescription>
                Provider: {record.provider} • Date: {format(new Date(record.date), 'MMM d, yyyy h:mm a')}
              </CardDescription>
            </div>
            <Badge>Finalized</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chief Complaint */}
          <div>
            <h3 className="font-semibold mb-2">Chief Complaint</h3>
            <p className="text-sm">{record.chiefComplaint}</p>
          </div>

          <Separator />

          {/* Subjective */}
          <div>
            <h3 className="font-semibold mb-3">Subjective</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">History</h4>
                <p className="text-sm">{record.subjective.history}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Symptoms</h4>
                <ul className="text-sm space-y-1">
                  {record.subjective.symptoms.map((symptom, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          {/* Objective */}
          <div>
            <h3 className="font-semibold mb-3">Objective</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Vital Signs</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Temperature</p>
                    <p className="font-medium">{record.objective.vitals.temperature}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Heart Rate</p>
                    <p className="font-medium">{record.objective.vitals.heartRate}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Respiratory Rate</p>
                    <p className="font-medium">{record.objective.vitals.respiratoryRate}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="font-medium">{record.objective.vitals.weight}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Blood Pressure</p>
                    <p className="font-medium">{record.objective.vitals.bloodPressure}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Physical Examination</h4>
                <Table>
                  <TableBody>
                    {Object.entries(record.objective.physicalExam).map(([system, findings]) => (
                      <TableRow key={system}>
                        <TableCell className="font-medium">{system}</TableCell>
                        <TableCell>{findings}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <Separator />

          {/* Assessment */}
          <div>
            <h3 className="font-semibold mb-3">Assessment</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Diagnosis</h4>
                <ul className="text-sm space-y-1">
                  {record.assessment.diagnosis.map((diagnosis, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">{index + 1}.</span>
                      <span>{diagnosis}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
                <p className="text-sm">{record.assessment.notes}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Plan */}
          <div>
            <h3 className="font-semibold mb-3">Plan</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Medications</h4>
                <div className="space-y-2">
                  {record.plan.medications.map((med, index) => (
                    <div key={index} className="rounded-lg border p-3">
                      <p className="font-medium">{med.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {med.dosage} • {med.frequency} • {med.duration}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Follow-up</h4>
                <p className="text-sm">{record.plan.followUp}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Home Care Instructions</h4>
                <ul className="text-sm space-y-1">
                  {record.plan.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Related Documents</CardTitle>
          <CardDescription>Additional files and test results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Lab Results - CBC</p>
                  <p className="text-xs text-muted-foreground">PDF • 245 KB</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}