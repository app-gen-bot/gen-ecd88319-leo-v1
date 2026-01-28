"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Folder, Hash, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateTaskModal } from "@/components/modals/create-task-modal";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { CreateChannelModal } from "@/components/modals/create-channel-modal";
import { useToast } from "@/hooks/use-toast";

export function CreateMenu() {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileUpload = () => {
    toast({
      title: "Upload File",
      description: "File upload functionality will be implemented soon.",
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Plus className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => setTaskModalOpen(true)}>
            <FileText className="mr-2 h-4 w-4" />
            New Task
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setProjectModalOpen(true)}>
            <Folder className="mr-2 h-4 w-4" />
            New Project
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setChannelModalOpen(true)}>
            <Hash className="mr-2 h-4 w-4" />
            New Channel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleFileUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateTaskModal open={taskModalOpen} onOpenChange={setTaskModalOpen} />
      <CreateProjectModal open={projectModalOpen} onOpenChange={setProjectModalOpen} />
      <CreateChannelModal open={channelModalOpen} onOpenChange={setChannelModalOpen} />
    </>
  );
}