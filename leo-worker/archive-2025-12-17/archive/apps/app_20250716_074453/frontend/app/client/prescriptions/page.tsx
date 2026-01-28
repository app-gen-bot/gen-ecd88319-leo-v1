'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PrescriptionsPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to active prescriptions by default
    router.replace('/client/prescriptions/active');
  }, [router]);
  
  return null;
}