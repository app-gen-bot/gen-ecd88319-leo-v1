'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ScheduleDayPage() {
  const router = useRouter();
  const params = useParams();
  
  useEffect(() => {
    // Redirect to calendar view with day selected
    const date = params.date === 'today' ? new Date().toISOString().split('T')[0] : params.date;
    router.replace(`/staff/schedule/calendar?view=day&date=${date}`);
  }, [params.date, router]);

  return null;
}