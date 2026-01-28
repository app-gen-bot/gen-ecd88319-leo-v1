'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTodoStore } from '@/store/todo-store'
import { Button } from '@/components/ui/button'
import { TodoForm } from '@/components/todo/todo-form'
import { TodoList } from '@/components/todo/todo-list'
import { TodoFilters } from '@/components/todo/todo-filters'
import { TodoStats } from '@/components/todo/todo-stats'
import { useToast } from '@/components/ui/use-toast'
import { Todo } from '@/types/todo'

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>()
  const { toast } = useToast()

  const {
    todos,
    filter,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    setFilter,
    clearCompleted,
  } = useTodoStore()

  const handleAddTodo = (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    addTodo(todoData)
    toast({
      title: 'Todo created',
      description: 'Your new todo has been added successfully.',
    })
  }

  const handleUpdateTodo = (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTodo) {
      updateTodo(editingTodo.id, todoData)
      toast({
        title: 'Todo updated',
        description: 'Your todo has been updated successfully.',
      })
      setEditingTodo(undefined)
    }
  }

  const handleDeleteTodo = (id: string) => {
    deleteTodo(id)
    toast({
      title: 'Todo deleted',
      description: 'Your todo has been deleted successfully.',
      variant: 'destructive',
    })
  }

  const handleToggleTodo = (id: string) => {
    toggleTodo(id)
    const todo = todos.find((t) => t.id === id)
    if (todo) {
      toast({
        title: todo.completed ? 'Todo uncompleted' : 'Todo completed',
        description: todo.completed
          ? 'Your todo has been marked as active.'
          : 'Great job! Your todo has been completed.',
      })
    }
  }

  const handleClearCompleted = () => {
    const count = todos.filter((todo) => todo.completed).length
    clearCompleted()
    toast({
      title: 'Completed todos cleared',
      description: `${count} completed ${count === 1 ? 'todo' : 'todos'} have been removed.`,
    })
  }

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setIsFormOpen(true)
  }

  const completedCount = todos.filter((todo) => todo.completed).length

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Todo App</h1>
            <p className="text-muted-foreground">
              Organize your tasks and boost your productivity
            </p>
          </div>

          {/* Stats */}
          <TodoStats todos={todos} />

          {/* Add Todo Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => {
                setEditingTodo(undefined)
                setIsFormOpen(true)
              }}
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              Add New Todo
            </Button>
          </div>

          {/* Filters */}
          <TodoFilters
            filter={filter}
            onFilterChange={setFilter}
            onClearCompleted={handleClearCompleted}
            completedCount={completedCount}
          />

          {/* Todo List */}
          <TodoList
            todos={todos}
            filter={filter}
            onToggle={handleToggleTodo}
            onEdit={handleEdit}
            onDelete={handleDeleteTodo}
          />
        </div>
      </div>

      {/* Todo Form Dialog */}
      <TodoForm
        todo={editingTodo}
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditingTodo(undefined)
        }}
        onSubmit={editingTodo ? handleUpdateTodo : handleAddTodo}
      />
    </div>
  )
}