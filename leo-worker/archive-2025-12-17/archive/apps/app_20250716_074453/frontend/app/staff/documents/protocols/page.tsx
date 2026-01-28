'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtocolsPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/staff/documents#protocols');
  }, [router]);
  
  return null;
}