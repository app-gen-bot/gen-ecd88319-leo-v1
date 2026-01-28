'use client'

import { useState } from 'react'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { TaskItem } from './task-item'
import { TaskFilters } from './task-filters'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskListViewProps {
  selectedProjectId: string | null
}

export function TaskListView({ selectedProjectId }: TaskListViewProps) {
  const { tasks, projects, currentUser } = useWorkspaceStore()
  const [filters, setFilters] = useState({
    assignee: 'all',
    status: 'all',
    priority: 'all'
  })

  let filteredTasks = selectedProjectId
    ? tasks.filter(task => task.projectId === selectedProjectId)
    : tasks.filter(task => task.assigneeId === currentUser?.id)

  // Apply filters
  if (filters.assignee !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.assigneeId === filters.assignee)
  }
  if (filters.status !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.status === filters.status)
  }
  if (filters.priority !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.priority === filters.priority)
  }

  // Group tasks by status
  const todoTasks = filteredTasks.filter(task => task.status === 'todo')
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress')
  const reviewTasks = filteredTasks.filter(task => task.status === 'review')
  const doneTasks = filteredTasks.filter(task => task.status === 'done')

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">
            {selectedProject ? selectedProject.name : 'My Tasks'}
          </h2>
          {selectedProject && (
            <p className="text-muted-foreground">{selectedProject.description}</p>
          )}
        </div>
      </div>

      <TaskFilters filters={filters} onFiltersChange={setFilters} />

      <div className="flex-1 overflow-auto">
        <div className="space-y-6">
          {/* Todo Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-muted-foreground">
                TO DO ({todoTasks.length})
              </h3>
              <Button variant="ghost" size="sm" className="h-7 gap-1">
                <Plus className="h-3 w-3" />
                Add task
              </Button>
            </div>
            <div className="space-y-2">
              {todoTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
              {todoTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks to do
                </div>
              )}
            </div>
          </div>

          {/* In Progress Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-muted-foreground">
                IN PROGRESS ({inProgressTasks.length})
              </h3>
            </div>
            <div className="space-y-2">
              {inProgressTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
              {inProgressTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks in progress
                </div>
              )}
            </div>
          </div>

          {/* Review Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-muted-foreground">
                REVIEW ({reviewTasks.length})
              </h3>
            </div>
            <div className="space-y-2">
              {reviewTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
              {reviewTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks in review
                </div>
              )}
            </div>
          </div>

          {/* Done Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm text-muted-foreground">
                DONE ({doneTasks.length})
              </h3>
            </div>
            <div className="space-y-2">
              {doneTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
              {doneTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No completed tasks
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}