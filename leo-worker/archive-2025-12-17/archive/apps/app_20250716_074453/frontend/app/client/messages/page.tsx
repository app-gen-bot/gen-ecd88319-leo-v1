'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MessagesPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to inbox by default
    router.replace('/client/messages/inbox');
  }, [router]);
  
  return null;
}