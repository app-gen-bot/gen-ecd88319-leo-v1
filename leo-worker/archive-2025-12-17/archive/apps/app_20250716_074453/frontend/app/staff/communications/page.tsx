'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CommunicationsPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the default communications tab
    router.replace('/staff/communications/chat');
  }, [router]);

  return null;
}