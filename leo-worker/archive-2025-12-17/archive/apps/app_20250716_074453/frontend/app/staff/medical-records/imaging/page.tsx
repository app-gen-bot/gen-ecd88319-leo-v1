'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MedicalRecordsImagingPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main medical records page
    router.replace('/staff/records');
  }, [router]);
  
  return null;
}