'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PatientsRecordsPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main patients page
    router.replace('/staff/patients');
  }, [router]);
  
  return null;
}