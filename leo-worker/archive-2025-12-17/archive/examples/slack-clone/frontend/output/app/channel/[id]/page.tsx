"use client";

import { WorkspaceLayout } from "@/components/workspace-layout";
import { MessageArea } from "@/components/message-area";
import { MessageInput } from "@/components/message-input";

interface ChannelPageProps {
  params: {
    id: string;
  };
}

export default function ChannelPage({ params }: ChannelPageProps) {
  return (
    <WorkspaceLayout>
      <div className="flex flex-col h-full bg-[#1a1d21]">
        <MessageArea channelId={params.id} />
        <MessageInput channelId={params.id} />
      </div>
    </WorkspaceLayout>
  );
}