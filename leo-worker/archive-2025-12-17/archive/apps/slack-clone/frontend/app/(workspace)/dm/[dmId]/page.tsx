'use client';

import { useParams } from 'next/navigation';
import { DirectMessageView } from '@/components/dm/direct-message-view';

export default function DirectMessagePage() {
  const params = useParams();
  const dmId = params.dmId as string;

  return <DirectMessageView dmId={dmId} />;
}