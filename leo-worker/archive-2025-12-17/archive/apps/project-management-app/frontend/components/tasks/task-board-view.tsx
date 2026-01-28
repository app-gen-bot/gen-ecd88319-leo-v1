'use client'

import { useEffect, useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { useWorkspaceStore, Task } from '@/stores/workspace-store'
import { TaskFilters } from './task-filters'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { TaskCard } from './task-card'

interface TaskBoardViewProps {
  selectedProjectId: string | null
}

const columns = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' }
] as const

export function TaskBoardView({ selectedProjectId }: TaskBoardViewProps) {
  const { tasks, projects, currentUser, moveTask } = useWorkspaceStore()
  const [filters, setFilters] = useState({
    assignee: 'all',
    status: 'all',
    priority: 'all'
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  let filteredTasks = selectedProjectId
    ? tasks.filter(task => task.projectId === selectedProjectId)
    : tasks.filter(task => task.assigneeId === currentUser?.id)

  // Apply filters
  if (filters.assignee !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.assigneeId === filters.assignee)
  }
  if (filters.priority !== 'all') {
    filteredTasks = filteredTasks.filter(task => task.priority === filters.priority)
  }

  const tasksByColumn = columns.reduce((acc, column) => {
    acc[column.id] = filteredTasks.filter(task => task.status === column.id)
    return acc
  }, {} as Record<string, Task[]>)

  const selectedProject = projects.find(p => p.id === selectedProjectId)

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const sourceColumn = result.source.droppableId
    const destColumn = result.destination.droppableId
    const taskId = result.draggableId

    if (sourceColumn !== destColumn) {
      moveTask(taskId, destColumn as Task['status'])
    }
  }

  if (!mounted) {
    return null
  }

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

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-[800px] h-full">
            {columns.map(column => (
              <div key={column.id} className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">
                    {column.title} ({tasksByColumn[column.id].length})
                  </h3>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-2 p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-muted/50' : 'bg-muted/20'
                      }`}
                    >
                      {tasksByColumn[column.id].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.5 : 1
                              }}
                            >
                              <TaskCard task={task} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {tasksByColumn[column.id].length === 0 && (
                        <div className="text-center py-12 text-muted-foreground text-sm">
                          No tasks
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 text-muted-foreground"
                      >
                        <Plus className="h-4 w-4" />
                        Add task
                      </Button>
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  )
}