import { create } from 'zustand'

export interface Workspace {
  id: string
  name: string
  description: string
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  workspaceId: string
  name: string
  description: string
  status: 'active' | 'on-hold' | 'archived'
  color: string
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  id: string
  projectId: string
  title: string
  description: string
  assigneeId: string | null
  assigneeName?: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high'
  dueDate: Date | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
  subtasks: Subtask[]
  dependencies: string[]
  tags: string[]
  attachments: Attachment[]
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Attachment {
  id: string
  name: string
  url: string
  size: number
  type: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'member' | 'guest'
}

export interface Comment {
  id: string
  taskId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: Date
  mentions: string[]
}

interface WorkspaceState {
  currentWorkspace: Workspace | null
  workspaces: Workspace[]
  projects: Project[]
  tasks: Task[]
  users: User[]
  currentUser: User | null
  comments: Comment[]
  
  // Actions
  setCurrentWorkspace: (workspace: Workspace) => void
  addWorkspace: (workspace: Workspace) => void
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void
  
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  moveTask: (taskId: string, newStatus: Task['status']) => void
  
  addComment: (comment: Comment) => void
  
  setCurrentUser: (user: User) => void
  addUser: (user: User) => void
}

// Mock data for demonstration
const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin'
}

const mockWorkspace: Workspace = {
  id: '1',
  name: 'Acme Corp',
  description: 'Main workspace for Acme Corp',
  createdAt: new Date(),
  updatedAt: new Date()
}

const mockProjects: Project[] = [
  {
    id: '1',
    workspaceId: '1',
    name: 'Marketing Campaign',
    description: 'Q4 2024 Marketing Campaign',
    status: 'active',
    color: '#3B82F6',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    workspaceId: '1',
    name: 'Product Development',
    description: 'New product features',
    status: 'active',
    color: '#10B981',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    workspaceId: '1',
    name: 'Design System',
    description: 'UI/UX design system',
    status: 'active',
    color: '#F59E0B',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const mockTasks: Task[] = [
  {
    id: '1',
    projectId: '1',
    title: 'Create landing page mockup',
    description: 'Design a new landing page for the Q4 campaign',
    assigneeId: '1',
    assigneeName: 'John Doe',
    status: 'todo',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000 * 3),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    subtasks: [
      { id: '1', title: 'Research competitors', completed: true },
      { id: '2', title: 'Create wireframes', completed: false }
    ],
    dependencies: [],
    tags: ['design', 'urgent'],
    attachments: []
  },
  {
    id: '2',
    projectId: '1',
    title: 'Write blog post',
    description: 'Write a blog post about our new features',
    assigneeId: '1',
    assigneeName: 'John Doe',
    status: 'in-progress',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000 * 5),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    subtasks: [],
    dependencies: [],
    tags: ['content', 'marketing'],
    attachments: []
  },
  {
    id: '3',
    projectId: '2',
    title: 'Implement user authentication',
    description: 'Add user authentication to the application',
    assigneeId: '1',
    assigneeName: 'John Doe',
    status: 'review',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000 * 2),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    subtasks: [],
    dependencies: [],
    tags: ['backend', 'security'],
    attachments: []
  },
  {
    id: '4',
    projectId: '2',
    title: 'Setup CI/CD pipeline',
    description: 'Configure automated deployment',
    assigneeId: '1',
    assigneeName: 'John Doe',
    status: 'done',
    priority: 'medium',
    dueDate: new Date(Date.now() - 86400000),
    completedAt: new Date(Date.now() - 86400000),
    createdAt: new Date(),
    updatedAt: new Date(),
    subtasks: [],
    dependencies: [],
    tags: ['devops'],
    attachments: []
  }
]

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspace: mockWorkspace,
  workspaces: [mockWorkspace],
  projects: mockProjects,
  tasks: mockTasks,
  users: [mockUser],
  currentUser: mockUser,
  comments: [],
  
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  
  addWorkspace: (workspace) => set((state) => ({
    workspaces: [...state.workspaces, workspace]
  })),
  
  updateWorkspace: (id, updates) => set((state) => ({
    workspaces: state.workspaces.map((w) =>
      w.id === id ? { ...w, ...updates } : w
    ),
    currentWorkspace: state.currentWorkspace?.id === id
      ? { ...state.currentWorkspace, ...updates }
      : state.currentWorkspace
  })),
  
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project]
  })),
  
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
    )
  })),
  
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id),
    tasks: state.tasks.filter((t) => t.projectId !== id)
  })),
  
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task]
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
    )
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id)
  })),
  
  moveTask: (taskId, newStatus) => set((state) => ({
    tasks: state.tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date() } : t
    )
  })),
  
  addComment: (comment) => set((state) => ({
    comments: [...state.comments, comment]
  })),
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  addUser: (user) => set((state) => ({
    users: [...state.users, user]
  }))
}))