'use client'

import { ChevronDown, ChevronRight, Home, Inbox, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  selectedProjectId: string | null
  onProjectSelect: (projectId: string | null) => void
  isMobile: boolean
}

export function Sidebar({ isOpen, onClose, selectedProjectId, onProjectSelect, isMobile }: SidebarProps) {
  const { projects, tasks, currentUser } = useWorkspaceStore()
  const [projectsExpanded, setProjectsExpanded] = useState(true)

  const myTasks = tasks.filter(task => task.assigneeId === currentUser?.id)
  const inboxTasks = tasks.filter(task => !task.projectId)

  const getProjectTaskCount = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId && task.status !== 'done').length
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:relative z-50 md:z-0 h-full bg-background border-r transition-all duration-300",
        isOpen ? "w-64" : "w-0 md:w-0",
        "overflow-hidden"
      )}>
        <div className="h-full flex flex-col p-4">
          {/* Mobile close button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 md:hidden"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          <nav className="space-y-2">
            <Button
              variant={selectedProjectId === null ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => onProjectSelect(null)}
            >
              <Home className="mr-2 h-4 w-4" />
              My Tasks
              {myTasks.length > 0 && (
                <span className="ml-auto text-xs text-muted-foreground">{myTasks.length}</span>
              )}
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <Inbox className="mr-2 h-4 w-4" />
              Inbox
              {inboxTasks.length > 0 && (
                <span className="ml-auto text-xs text-muted-foreground">{inboxTasks.length}</span>
              )}
            </Button>

            <div className="pt-4">
              <Button
                variant="ghost"
                className="w-full justify-between text-sm font-medium"
                onClick={() => setProjectsExpanded(!projectsExpanded)}
              >
                <span className="flex items-center">
                  {projectsExpanded ? (
                    <ChevronDown className="mr-2 h-4 w-4" />
                  ) : (
                    <ChevronRight className="mr-2 h-4 w-4" />
                  )}
                  Projects
                </span>
              </Button>

              {projectsExpanded && (
                <div className="mt-2 space-y-1">
                  {projects.map((project) => (
                    <Button
                      key={project.id}
                      variant={selectedProjectId === project.id ? "secondary" : "ghost"}
                      className="w-full justify-start pl-8"
                      onClick={() => {
                        onProjectSelect(project.id)
                        if (isMobile) onClose()
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                      {getProjectTaskCount(project.id) > 0 && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {getProjectTaskCount(project.id)}
                        </span>
                      )}
                    </Button>
                  ))}

                  <Button
                    variant="ghost"
                    className="w-full justify-start pl-8 text-muted-foreground"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </aside>
    </>
  )
}