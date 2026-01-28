'use client'

import { Search } from 'lucide-react'
import { TodoFilter } from '@/types/todo'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface TodoFiltersProps {
  filter: TodoFilter
  onFilterChange: (filter: Partial<TodoFilter>) => void
  onClearCompleted: () => void
  completedCount: number
}

export function TodoFilters({
  filter,
  onFilterChange,
  onClearCompleted,
  completedCount,
}: TodoFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search todos..."
            value={filter.searchQuery || ''}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="pl-10"
          />
        </div>
        <Select
          value={filter.priority || 'all'}
          onValueChange={(value) =>
            onFilterChange({ priority: value === 'all' ? undefined : (value as 'low' | 'medium' | 'high') })
          }
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="high">High priority</SelectItem>
            <SelectItem value="medium">Medium priority</SelectItem>
            <SelectItem value="low">Low priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Tabs
          value={filter.status}
          onValueChange={(value) => onFilterChange({ status: value as 'all' | 'active' | 'completed' })}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        {completedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearCompleted}
            className="text-destructive hover:text-destructive"
          >
            Clear completed ({completedCount})
          </Button>
        )}
      </div>
    </div>
  )
}