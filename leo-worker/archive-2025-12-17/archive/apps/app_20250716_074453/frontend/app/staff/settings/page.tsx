'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile page by default
    router.replace('/staff/settings/profile');
  }, [router]);

  return null;
}