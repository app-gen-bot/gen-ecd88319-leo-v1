'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function EditSOAPNotePage() {
  const router = useRouter();
  const params = useParams();
  
  // In a real app, this would check if the SOAP note is finalized
  // For now, we'll just show a message
  
  return (
    <div className="p-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          SOAP note editing is only available for non-finalized notes. 
          This SOAP note (ID: {params.id}) has already been finalized and cannot be edited.
        </AlertDescription>
      </Alert>
    </div>
  );
}