"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useParams } from "next/navigation";
import { ThreadView } from "@/components/channel/thread-view";
import { TaskDetailPanel } from "@/components/projects/task-detail-panel";
import { ChannelMembersPanel } from "@/components/channel/channel-members-panel";
import { ChannelFilesPanel } from "@/components/channel/channel-files-panel";
import { apiClient } from "@/lib/api-client";
import { useState, useEffect } from "react";
import type { Task } from "@/types";

export function RightPanel() {
  const { rightPanelContent, selectedThread, selectedTaskId, closeRightPanel } = useWorkspaceStore();
  const params = useParams();
  const channelId = params.channelId as string;
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (selectedTaskId && rightPanelContent === "task") {
      // In a real app, fetch the task details
      // For now, we'll use mock data
      loadTask();
    }
  }, [selectedTaskId, rightPanelContent]);

  const loadTask = async () => {
    try {
      // Mock task loading
      const mockTask: Task = {
        id: selectedTaskId!,
        project_id: "proj-1",
        title: "Sample Task",
        description: "This is a sample task description",
        status: "in_progress",
        priority: "medium",
        assignee_id: "user-1",
        labels: ["frontend", "urgent"],
        position: 0,
        created_by: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        comments_count: 0,
        attachments_count: 0,
      };
      setSelectedTask(mockTask);
    } catch (error) {
      console.error("Failed to load task:", error);
    }
  };

  const renderContent = () => {
    switch (rightPanelContent) {
      case "thread":
        return selectedThread && channelId ? (
          <ThreadView 
            parentMessage={selectedThread} 
            channelId={channelId}
            onClose={closeRightPanel}
          />
        ) : null;
      case "task":
        return selectedTask ? (
          <TaskDetailPanel 
            task={selectedTask}
            onClose={closeRightPanel}
            onUpdate={(updates) => {
              // Handle task updates
              console.log("Task updated:", updates);
            }}
          />
        ) : null;
      case "members":
        return <ChannelMembersPanel />;
      case "files":
        return <ChannelFilesPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        <h3 className="font-semibold">
          {rightPanelContent === "thread" && "Thread"}
          {rightPanelContent === "task" && "Task Details"}
          {rightPanelContent === "members" && "Channel Members"}
          {rightPanelContent === "files" && "Shared Files"}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={closeRightPanel}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
}