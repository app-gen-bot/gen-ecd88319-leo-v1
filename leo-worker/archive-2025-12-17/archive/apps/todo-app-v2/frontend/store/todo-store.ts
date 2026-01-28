import { create } from 'zustand'
import { Todo, TodoFilter } from '@/types/todo'

interface TodoStore {
  todos: Todo[]
  filter: TodoFilter
  isLoading: boolean
  error: string | null
  
  // Actions
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  deleteTodo: (id: string) => void
  toggleTodo: (id: string) => void
  setFilter: (filter: Partial<TodoFilter>) => void
  clearCompleted: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

// Mock data for demonstration
const mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Complete project documentation',
    description: 'Write comprehensive documentation for the new features',
    completed: false,
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000),
    tags: ['work', 'documentation'],
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: '2',
    title: 'Review pull requests',
    description: 'Check and approve pending PRs',
    completed: true,
    priority: 'medium',
    tags: ['work', 'code-review'],
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: '3',
    title: 'Buy groceries',
    completed: false,
    priority: 'low',
    dueDate: new Date(Date.now() + 172800000),
    tags: ['personal', 'shopping'],
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000),
  },
]

export const useTodoStore = create<TodoStore>((set) => ({
  todos: mockTodos,
  filter: { status: 'all' },
  isLoading: false,
  error: null,

  addTodo: (todoData) =>
    set((state) => ({
      todos: [
        ...state.todos,
        {
          ...todoData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })),

  updateTodo: (id, updates) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id
          ? { ...todo, ...updates, updatedAt: new Date() }
          : todo
      ),
    })),

  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),

  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
          : todo
      ),
    })),

  setFilter: (filter) =>
    set((state) => ({
      filter: { ...state.filter, ...filter },
    })),

  clearCompleted: () =>
    set((state) => ({
      todos: state.todos.filter((todo) => !todo.completed),
    })),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))