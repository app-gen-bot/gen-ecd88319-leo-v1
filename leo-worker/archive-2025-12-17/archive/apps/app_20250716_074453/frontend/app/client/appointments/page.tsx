'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppointmentsPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to upcoming appointments by default
    router.replace('/client/appointments/upcoming');
  }, [router]);
  
  return null;
}