import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Message, Workspace } from "@/types";

interface WorkspaceState {
  sidebarCollapsed: boolean;
  rightPanelOpen: boolean;
  rightPanelContent: "task" | "thread" | "members" | "files" | null;
  selectedTaskId: string | null;
  selectedThread: Message | null;
  currentWorkspace: Workspace | null;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setRightPanel: (content: "task" | "thread" | "members" | "files" | null) => void;
  closeRightPanel: () => void;
  setSelectedTask: (taskId: string | null) => void;
  setSelectedThread: (message: Message | null) => void;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      rightPanelOpen: false,
      rightPanelContent: null,
      selectedTaskId: null,
      selectedThread: null,
      currentWorkspace: null,

      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      })),

      setRightPanel: (content) => set({ 
        rightPanelOpen: content !== null,
        rightPanelContent: content 
      }),

      closeRightPanel: () => set({ 
        rightPanelOpen: false,
        rightPanelContent: null,
        selectedTaskId: null,
        selectedThread: null
      }),

      setSelectedTask: (taskId) => set({ 
        selectedTaskId: taskId,
        rightPanelOpen: taskId !== null,
        rightPanelContent: taskId ? "task" : null
      }),

      setSelectedThread: (message) => set({
        selectedThread: message,
        rightPanelOpen: message !== null,
        rightPanelContent: message ? "thread" : null
      }),

      setCurrentWorkspace: (workspace) => set({
        currentWorkspace: workspace
      }),
    }),
    {
      name: "workspace-store",
      partialize: (state) => ({ 
        sidebarCollapsed: state.sidebarCollapsed 
      }),
    }
  )
);