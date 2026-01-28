'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { TaskListView } from '@/components/tasks/task-list-view'
import { TaskBoardView } from '@/components/tasks/task-board-view'
import { TaskCalendarView } from '@/components/tasks/task-calendar-view'
import { TaskTimelineView } from '@/components/tasks/task-timeline-view'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { List, LayoutGrid, Calendar, Gantt } from 'lucide-react'

export default function Home() {
  const [activeView, setActiveView] = useState('list')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        selectedProjectId={selectedProjectId}
        onProjectSelect={setSelectedProjectId}
        isMobile={isMobile}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={toggleSidebar} />
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full p-4 md:p-6">
            <Tabs value={activeView} onValueChange={setActiveView} className="h-full flex flex-col">
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">List</span>
                </TabsTrigger>
                <TabsTrigger value="board" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Board</span>
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Calendar</span>
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex items-center gap-2">
                  <Gantt className="h-4 w-4" />
                  <span className="hidden sm:inline">Timeline</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-hidden mt-4">
                <TabsContent value="list" className="h-full m-0">
                  <TaskListView selectedProjectId={selectedProjectId} />
                </TabsContent>
                <TabsContent value="board" className="h-full m-0">
                  <TaskBoardView selectedProjectId={selectedProjectId} />
                </TabsContent>
                <TabsContent value="calendar" className="h-full m-0">
                  <TaskCalendarView selectedProjectId={selectedProjectId} />
                </TabsContent>
                <TabsContent value="timeline" className="h-full m-0">
                  <TaskTimelineView selectedProjectId={selectedProjectId} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}