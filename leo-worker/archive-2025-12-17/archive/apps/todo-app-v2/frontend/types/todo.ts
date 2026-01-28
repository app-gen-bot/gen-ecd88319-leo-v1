export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface TodoFilter {
  status: 'all' | 'active' | 'completed'
  priority?: 'low' | 'medium' | 'high'
  tags?: string[]
  searchQuery?: string
}