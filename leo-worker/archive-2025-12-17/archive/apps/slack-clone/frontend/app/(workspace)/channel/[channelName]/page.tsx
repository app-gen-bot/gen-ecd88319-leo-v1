'use client';

import { useParams } from 'next/navigation';
import { ChannelView } from '@/components/channel/channel-view';

export default function ChannelPage() {
  const params = useParams();
  const channelName = params.channelName as string;

  return <ChannelView channelName={channelName} />;
}