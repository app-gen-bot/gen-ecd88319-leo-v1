'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppointmentsCalendarPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main calendar view
    router.replace('/staff/schedule/calendar');
  }, [router]);
  
  return null;
}