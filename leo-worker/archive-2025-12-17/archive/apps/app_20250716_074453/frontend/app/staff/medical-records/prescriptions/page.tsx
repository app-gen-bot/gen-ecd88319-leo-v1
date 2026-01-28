'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MedicalRecordsPrescriptionsPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the prescriptions page
    router.replace('/staff/records/prescriptions');
  }, [router]);
  
  return null;
}