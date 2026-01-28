'use client'

import { useState } from 'react'
import { Task, useWorkspaceStore } from '@/stores/workspace-store'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, ChevronDown, ChevronRight, MessageSquare, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { TaskDetailsPanel } from './task-details-panel'

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const [expanded, setExpanded] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const { updateTask, users } = useWorkspaceStore()

  const assignee = users.find(u => u.id === task.assigneeId)
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'

  const handleComplete = () => {
    updateTask(task.id, {
      status: task.status === 'done' ? 'todo' : 'done',
      completedAt: task.status === 'done' ? null : new Date()
    })
  }

  const priorityColor = {
    high: 'destructive',
    medium: 'secondary',
    low: 'outline'
  } as const

  return (
    <>
      <div className={cn(
        "border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer",
        task.status === 'done' && "opacity-60"
      )}>
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.status === 'done'}
            onCheckedChange={handleComplete}
            className="mt-0.5"
          />

          <div className="flex-1 min-w-0" onClick={() => setDetailsOpen(true)}>
            <h4 className={cn(
              "font-medium",
              task.status === 'done' && "line-through"
            )}>
              {task.title}
            </h4>

            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            {task.subtasks.length > 0 && (
              <div className="mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 gap-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpanded(!expanded)
                  }}
                >
                  {expanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
                </Button>

                {expanded && (
                  <div className="mt-2 ml-6 space-y-1">
                    {task.subtasks.map(subtask => (
                      <div key={subtask.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={(checked) => {
                            const updatedSubtasks = task.subtasks.map(st =>
                              st.id === subtask.id ? { ...st, completed: !!checked } : st
                            )
                            updateTask(task.id, { subtasks: updatedSubtasks })
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className={cn(
                          "text-sm",
                          subtask.completed && "line-through text-muted-foreground"
                        )}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              {task.dueDate && (
                <div className={cn(
                  "flex items-center gap-1",
                  isOverdue && "text-destructive"
                )}>
                  <Calendar className="h-3 w-3" />
                  {format(new Date(task.dueDate), 'MMM d')}
                </div>
              )}

              {task.attachments.length > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  {task.attachments.length}
                </div>
              )}

              {task.tags.length > 0 && (
                <div className="flex gap-1">
                  {task.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={priorityColor[task.priority]} className="text-xs">
              {task.priority}
            </Badge>

            {assignee && (
              <Avatar className="h-6 w-6">
                <AvatarImage src={assignee.avatar} />
                <AvatarFallback className="text-xs">
                  {assignee.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </div>

      <TaskDetailsPanel
        task={task}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  )
}