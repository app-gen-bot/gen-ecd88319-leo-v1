"use client";

import { WorkspaceLayout } from "@/components/workspace-layout";
import { DMMessageArea } from "@/components/dm-message-area";
import { MessageInput } from "@/components/message-input";

interface DMPageProps {
  params: {
    userId: string;
  };
}

export default function DMPage({ params }: DMPageProps) {
  return (
    <WorkspaceLayout>
      <div className="flex flex-col h-full bg-[#1a1d21]">
        <DMMessageArea userId={params.userId} />
        <MessageInput channelId={`dm-${params.userId}`} />
      </div>
    </WorkspaceLayout>
  );
}