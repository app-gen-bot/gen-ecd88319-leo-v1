'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MedicalRecordsLabsPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the lab results page
    router.replace('/staff/records/labs');
  }, [router]);
  
  return null;
}