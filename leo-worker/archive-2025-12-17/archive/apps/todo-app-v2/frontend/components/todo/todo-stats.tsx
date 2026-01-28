'use client'

import { CheckCircle2, Circle, Clock, TrendingUp } from 'lucide-react'
import { Todo } from '@/types/todo'
import { Card, CardContent } from '@/components/ui/card'

interface TodoStatsProps {
  todos: Todo[]
}

export function TodoStats({ todos }: TodoStatsProps) {
  const totalTodos = todos.length
  const completedTodos = todos.filter((todo) => todo.completed).length
  const activeTodos = totalTodos - completedTodos
  const highPriorityTodos = todos.filter((todo) => todo.priority === 'high' && !todo.completed).length
  const overdueTodos = todos.filter(
    (todo) => todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed
  ).length

  const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0

  const stats = [
    {
      label: 'Total Tasks',
      value: totalTodos,
      icon: Circle,
      color: 'text-blue-500',
    },
    {
      label: 'Active',
      value: activeTodos,
      icon: Clock,
      color: 'text-yellow-500',
    },
    {
      label: 'Completed',
      value: completedTodos,
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      label: 'Completion Rate',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'text-purple-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
      {(highPriorityTodos > 0 || overdueTodos > 0) && (
        <Card className="col-span-2 lg:col-span-4 border-destructive/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              {highPriorityTodos > 0 && (
                <p className="text-destructive">
                  {highPriorityTodos} high priority {highPriorityTodos === 1 ? 'task' : 'tasks'} pending
                </p>
              )}
              {overdueTodos > 0 && (
                <p className="text-destructive">
                  {overdueTodos} {overdueTodos === 1 ? 'task is' : 'tasks are'} overdue
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}