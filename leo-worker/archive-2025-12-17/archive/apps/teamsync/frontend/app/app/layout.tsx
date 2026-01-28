"use client";

import { AuthCheck } from "@/components/auth-check";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { WebSocketProvider } from "@/contexts/websocket-context";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { cn } from "@/lib/utils";
import { HEADER_HEIGHT, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH, RIGHT_PANEL_WIDTH } from "@/lib/constants";
import { RightPanel } from "@/components/layout/right-panel";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed, rightPanelOpen } = useWorkspaceStore();

  return (
    <AuthCheck>
      <WebSocketProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          {/* Sidebar */}
          <div
            className={cn(
              "hidden md:block transition-all duration-300",
              sidebarCollapsed ? `w-[${SIDEBAR_COLLAPSED_WIDTH}px]` : `w-[${SIDEBAR_WIDTH}px]`
            )}
            style={{
              width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
            }}
          >
            <AppSidebar />
          </div>

          {/* Main Content */}
          <div className="flex flex-1 flex-col">
            {/* Header */}
            <div 
              className="border-b"
              style={{ height: HEADER_HEIGHT }}
            >
              <AppHeader />
            </div>

            {/* Page Content */}
            <main className="flex-1 overflow-hidden">
              <div className="flex h-full">
                <div className="flex-1">
                  {children}
                </div>
                
                {/* Right Panel */}
                {rightPanelOpen && (
                  <div
                    className="hidden lg:block border-l bg-background"
                    style={{ width: RIGHT_PANEL_WIDTH }}
                  >
                    <RightPanel />
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </WebSocketProvider>
    </AuthCheck>
  );
}