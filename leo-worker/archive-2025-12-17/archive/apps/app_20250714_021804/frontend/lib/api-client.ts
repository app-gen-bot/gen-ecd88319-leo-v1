import { User, Family, Task, Message, Achievement, ApiError } from './types'

// Token storage keys
const AUTH_TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const CURRENT_USER_KEY = 'current_user'
const CURRENT_FAMILY_KEY = 'current_family'

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
    this.restoreToken()
  }

  private restoreToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(AUTH_TOKEN_KEY)
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token)
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY)
      }
    }
  }

  private getAuthHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {}
  }

  private async handleHttpError(response: Response) {
    const data = await response.json().catch(() => ({}))
    
    switch (response.status) {
      case 401:
        this.handleUnauthorized()
        break
      case 403:
        throw this.createApiError('You do not have permission to perform this action', 'FORBIDDEN')
      case 404:
        throw this.createApiError('The requested resource was not found', 'NOT_FOUND')
      case 429:
        const retryAfter = response.headers.get('Retry-After')
        throw this.createApiError(`Rate limited. Try again in ${retryAfter} seconds`, 'RATE_LIMITED')
      case 500:
      case 502:
      case 503:
      case 504:
        throw this.createApiError('Server error. Please try again later.', 'SERVER_ERROR')
      default:
        throw this.createApiError(data.detail || 'An error occurred', 'UNKNOWN_ERROR')
    }
  }

  private handleUnauthorized() {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(CURRENT_USER_KEY)
    localStorage.removeItem(CURRENT_FAMILY_KEY)
    this.token = null
    
    if (typeof window !== 'undefined') {
      window.location.href = '/signin'
    }
  }

  private createApiError(message: string, code: string): ApiError {
    const error = new Error(message) as ApiError
    error.code = code
    return error
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
          ...(options.headers as Record<string, string>),
        },
      })
      
      if (!response.ok) {
        await this.handleHttpError(response)
      }
      
      return await response.json()
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        throw error
      }
      throw this.createApiError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR'
      )
    }
  }

  // Auth endpoints
  async signUp(data: {
    email: string
    password: string
    name: string
    role: string
    personality_type: string
    message_styles: string[]
    family_name?: string
    family_code?: string
  }) {
    const response = await this.request<{
      access_token: string
      refresh_token: string
      user: User
      family: Family
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    this.setToken(response.access_token)
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response.user))
    localStorage.setItem(CURRENT_FAMILY_KEY, JSON.stringify(response.family))
    
    return response
  }

  async signIn(email: string, password: string) {
    // Mock authentication for frontend-only testing
    const mockUser: User = {
      id: '1',
      email: email,
      name: email.split('@')[0],
      role: 'parent',
      avatar: '', // Will be filled by avatar_url if available
      personality_type: 'friendly',
      message_styles: ['playful', 'encouraging'],
      family_id: 'family-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const mockFamily: Family = {
      id: 'family-1',
      name: 'Test Family',
      code: 'TEST123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      settings: {
        themes: ['default'],
        categories: ['chores', 'homework', 'fun'],
        priorities: ['low', 'medium', 'high']
      }
    }
    
    const mockToken = 'mock-token-' + Date.now()
    
    this.setToken(mockToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, 'mock-refresh-token')
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(mockUser))
    localStorage.setItem(CURRENT_FAMILY_KEY, JSON.stringify(mockFamily))
    
    return {
      access_token: mockToken,
      refresh_token: 'mock-refresh-token',
      user: mockUser,
      family: mockFamily
    }
  }

  async signOut() {
    try {
      await this.request('/auth/signout', { method: 'POST' })
    } catch (error) {
      // Continue with local logout even if API fails
    }
    
    this.handleUnauthorized()
  }

  async getSession() {
    // Mock session check for frontend-only testing
    const userStr = localStorage.getItem(CURRENT_USER_KEY)
    const familyStr = localStorage.getItem(CURRENT_FAMILY_KEY)
    
    if (userStr && familyStr && this.token) {
      return {
        valid: true,
        user: JSON.parse(userStr),
        family: JSON.parse(familyStr)
      }
    }
    
    return {
      valid: false
    }
  }

  async requestPasswordReset(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, password: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  }

  // Family endpoints
  async getFamilyInfo(code?: string) {
    const endpoint = code ? `/family/info?code=${code}` : '/family'
    return this.request<Family>(endpoint)
  }

  async getFamilyMembers() {
    return this.request<User[]>('/family/members')
  }

  async inviteMember(email: string, message?: string) {
    return this.request('/family/invite', {
      method: 'POST',
      body: JSON.stringify({ email, message }),
    })
  }

  async removeMember(userId: string) {
    return this.request(`/family/members/${userId}`, {
      method: 'DELETE',
    })
  }

  async updateFamilySettings(data: Partial<Family>) {
    return this.request<Family>('/family/settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // User endpoints
  async updateProfile(data: Partial<User>) {
    const response = await this.request<User>('/user/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(response))
    return response
  }

  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('avatar', file)
    
    return this.request<{ avatar_url: string }>('/user/avatar', {
      method: 'POST',
      headers: {},
      body: formData,
    })
  }

  // Task endpoints
  async getTasks(filter?: {
    status?: string
    assignee_id?: string
    category?: string
    priority?: string
  }) {
    // Mock tasks for frontend-only testing
    const userStr = localStorage.getItem(CURRENT_USER_KEY)
    if (!userStr) return []
    
    const user = JSON.parse(userStr)
    
    const allTasks: Task[] = [
      {
        id: '1',
        description: 'Clean your room',
        assignee_id: user.id,
        assignee_name: user.name,
        created_by_id: user.id,
        created_by_name: user.name,
        due_date: new Date(Date.now() + 86400000).toISOString(),
        priority: 'medium',
        category: 'chores',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        description: 'Finish math homework',
        assignee_id: user.id,
        assignee_name: user.name,
        created_by_id: user.id,
        created_by_name: user.name,
        due_date: new Date(Date.now() + 172800000).toISOString(),
        priority: 'high',
        category: 'homework',
        status: 'accepted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        description: 'Take out the trash',
        assignee_id: user.id,
        assignee_name: user.name,
        created_by_id: user.id,
        created_by_name: user.name,
        due_date: new Date(Date.now() + 3600000).toISOString(),
        priority: 'low',
        category: 'chores',
        status: 'completed',
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    
    // Apply filters
    let filteredTasks = allTasks
    if (filter?.status) {
      filteredTasks = filteredTasks.filter(t => t.status === filter.status)
    }
    if (filter?.category) {
      filteredTasks = filteredTasks.filter(t => t.category === filter.category)
    }
    if (filter?.priority) {
      filteredTasks = filteredTasks.filter(t => t.priority === filter.priority)
    }
    
    return filteredTasks
  }

  async getTask(id: string) {
    return this.request<Task>(`/tasks/${id}`)
  }

  async createTask(data: {
    description: string
    assignee_id: string
    due_date: string
    priority: string
    category: string
  }) {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async transformTaskMessage(taskId: string, style?: string) {
    return this.request<{
      transformed_message: string
      style: string
    }>(`/tasks/${taskId}/transform`, {
      method: 'POST',
      body: JSON.stringify({ style }),
    })
  }

  async respondToTask(taskId: string, action: 'accept' | 'negotiate' | 'question', message?: string) {
    return this.request<Task>(`/tasks/${taskId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action, message }),
    })
  }

  async completeTask(taskId: string, message?: string, photo?: File) {
    const formData = new FormData()
    if (message) formData.append('message', message)
    if (photo) formData.append('photo', photo)
    
    return this.request<Task>(`/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: {},
      body: formData,
    })
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    })
  }

  // Message endpoints
  async getMessages(filter?: {
    sender_id?: string
    recipient_id?: string
    message_type?: string
  }) {
    const params = new URLSearchParams(filter as any)
    return this.request<Message[]>(`/messages?${params}`)
  }

  async getMessage(id: string) {
    return this.request<Message>(`/messages/${id}`)
  }

  async reactToMessage(messageId: string, emoji: string) {
    return this.request<Message>(`/messages/${messageId}/react`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    })
  }

  // Achievement endpoints
  async getAchievements() {
    return this.request<Achievement[]>('/achievements')
  }

  // Dashboard endpoint
  async getDashboardData() {
    // Mock dashboard data for frontend-only testing
    const userStr = localStorage.getItem(CURRENT_USER_KEY)
    const familyStr = localStorage.getItem(CURRENT_FAMILY_KEY)
    
    if (!userStr || !familyStr) {
      throw this.createApiError('Not authenticated', 'UNAUTHORIZED')
    }
    
    const user = JSON.parse(userStr)
    const family = JSON.parse(familyStr)
    
    const mockTasks: Task[] = [
      {
        id: '1',
        description: 'Clean your room',
        assignee_id: user.id,
        assignee_name: user.name,
        created_by_id: user.id,
        created_by_name: user.name,
        due_date: new Date(Date.now() + 86400000).toISOString(),
        priority: 'medium',
        category: 'chores',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        description: 'Finish math homework',
        assignee_id: user.id,
        assignee_name: user.name,
        created_by_id: user.id,
        created_by_name: user.name,
        due_date: new Date(Date.now() + 172800000).toISOString(),
        priority: 'high',
        category: 'homework',
        status: 'accepted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
    
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Great job on finishing your chores!',
        sender_id: user.id,
        sender_name: user.name,
        recipient_id: 'all',
        message_type: 'encouragement',
        reactions: {},
        created_at: new Date().toISOString()
      }
    ]
    
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        user_id: user.id,
        achievement_type: 'task_streak',
        title: 'Task Master',
        description: '3 day task completion streak',
        earned_at: new Date().toISOString(),
        icon: '🏆'
      }
    ]
    
    return {
      family: family,
      active_tasks: mockTasks,
      recent_messages: mockMessages,
      achievements: mockAchievements,
      member_stats: [
        {
          member_id: user.id,
          name: user.name,
          avatar: user.avatar || user.avatar_url || '',
          active_tasks: 2,
          completed_today: 1
        }
      ]
    }
  }
}

export const apiClient = new ApiClient()