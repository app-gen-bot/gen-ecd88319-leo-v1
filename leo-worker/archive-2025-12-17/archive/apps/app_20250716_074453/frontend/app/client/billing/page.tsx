'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BillingPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to invoices by default
    router.replace('/client/billing/invoices');
  }, [router]);
  
  return null;
}