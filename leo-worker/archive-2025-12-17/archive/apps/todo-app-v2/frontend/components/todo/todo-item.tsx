'use client'

import { format } from 'date-fns'
import { Calendar, Clock, MoreHorizontal, Trash2 } from 'lucide-react'
import { Todo } from '@/types/todo'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const priorityColors = {
    low: 'bg-green-500/10 text-green-500',
    medium: 'bg-yellow-500/10 text-yellow-500',
    high: 'bg-red-500/10 text-red-500',
  }

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      todo.completed && "opacity-60"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => onToggle(todo.id)}
            className="mt-0.5"
          />
          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={cn(
                  "font-medium leading-none",
                  todo.completed && "line-through text-muted-foreground"
                )}>
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {todo.description}
                  </p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(todo)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(todo.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge
                variant="secondary"
                className={priorityColors[todo.priority]}
              >
                {todo.priority}
              </Badge>
              {todo.dueDate && (
                <div className={cn(
                  "flex items-center gap-1 text-muted-foreground",
                  isOverdue && "text-destructive"
                )}>
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(todo.dueDate), 'MMM d, yyyy')}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{format(new Date(todo.updatedAt), 'MMM d, h:mm a')}</span>
              </div>
            </div>
            {todo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {todo.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}