'use client'

import { useMemo } from 'react'
import { Todo, TodoFilter } from '@/types/todo'
import { TodoItem } from './todo-item'
import { Card, CardContent } from '@/components/ui/card'
import { FileX } from 'lucide-react'

interface TodoListProps {
  todos: Todo[]
  filter: TodoFilter
  onToggle: (id: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
}

export function TodoList({ todos, filter, onToggle, onEdit, onDelete }: TodoListProps) {
  const filteredTodos = useMemo(() => {
    let filtered = todos

    // Filter by status
    if (filter.status === 'active') {
      filtered = filtered.filter((todo) => !todo.completed)
    } else if (filter.status === 'completed') {
      filtered = filtered.filter((todo) => todo.completed)
    }

    // Filter by priority
    if (filter.priority) {
      filtered = filtered.filter((todo) => todo.priority === filter.priority)
    }

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter((todo) =>
        filter.tags!.some((tag) => todo.tags.includes(tag))
      )
    }

    // Filter by search query
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(query) ||
          todo.description?.toLowerCase().includes(query) ||
          todo.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // Sort by priority and date
    return filtered.sort((a, b) => {
      // Completed tasks go to the bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }

      // Sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff

      // Sort by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      if (a.dueDate) return -1
      if (b.dueDate) return 1

      // Sort by creation date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [todos, filter])

  if (filteredTodos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileX className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No todos found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {filter.status === 'completed'
              ? 'You haven\'t completed any tasks yet'
              : filter.status === 'active'
              ? 'All tasks are completed!'
              : 'Create your first todo to get started'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {filteredTodos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}