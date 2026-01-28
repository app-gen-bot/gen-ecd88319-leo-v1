import { 
  AUTH_TOKEN_KEY, 
  REFRESH_TOKEN_KEY, 
  CURRENT_USER_KEY, 
  CURRENT_WORKSPACE_KEY,
  ERROR_CODES 
} from "./constants";
import type { 
  User, 
  Workspace, 
  Channel, 
  Message, 
  Project, 
  Task,
  LoginFormData,
  RegisterFormData,
  CreateProjectFormData,
  CreateTaskFormData,
  PaginatedResponse,
  Notification
} from "@/types";

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    this.restoreToken();
  }

  private restoreToken() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem(AUTH_TOKEN_KEY);
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
          ...(options.headers as Record<string, string>),
        },
      });

      if (!response.ok) {
        await this.handleHttpError(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        "Network error. Please check your connection.",
        ERROR_CODES.NETWORK_ERROR
      );
    }
  }

  private getAuthHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  private async handleHttpError(response: Response) {
    let data;
    try {
      data = await response.json();
    } catch {
      data = { detail: "An error occurred" };
    }

    switch (response.status) {
      case 401:
        this.handleUnauthorized();
        break;
      case 403:
        throw new ApiError(
          "You do not have permission to perform this action",
          ERROR_CODES.FORBIDDEN
        );
      case 404:
        throw new ApiError(
          "The requested resource was not found",
          ERROR_CODES.NOT_FOUND
        );
      case 429:
        const retryAfter = response.headers.get("Retry-After");
        throw new ApiError(
          `Rate limited. Try again in ${retryAfter} seconds`,
          ERROR_CODES.RATE_LIMITED
        );
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ApiError(
          "Server error. Please try again later.",
          ERROR_CODES.SERVER_ERROR
        );
      default:
        throw new ApiError(
          data.detail || "An error occurred",
          "UNKNOWN_ERROR",
          data
        );
    }
  }

  private handleUnauthorized() {
    // Clear all auth data
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(CURRENT_WORKSPACE_KEY);
    this.token = null;

    // Redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  // Mock implementations for demo
  private async mockDelay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Auth endpoints
  async login(email: string, password: string) {
    await this.mockDelay();
    
    // Mock validation
    if (email === "demo@teamsync.com" && password === "password123") {
      const mockUser: User = {
        id: "user-1",
        email: "demo@teamsync.com",
        full_name: "Demo User",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
        title: "Product Manager",
        bio: "Building great products with amazing teams",
        status: "online",
        last_seen_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        user: mockUser,
      };
    }

    throw new ApiError("Invalid email or password", ERROR_CODES.INVALID_CREDENTIALS);
  }

  async register(data: RegisterFormData) {
    await this.mockDelay();
    
    const mockUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      full_name: data.full_name,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
      status: "online",
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return {
      access_token: "mock-access-token",
      refresh_token: "mock-refresh-token",
      user: mockUser,
    };
  }

  async logout() {
    await this.mockDelay(200);
    return { success: true };
  }

  async getSession() {
    await this.mockDelay(200);
    
    if (this.token) {
      return {
        valid: true,
        user: {
          id: "user-1",
          email: "demo@teamsync.com",
          full_name: "Demo User",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
          title: "Product Manager",
          bio: "Building great products with amazing teams",
          status: "online" as const,
          last_seen_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    }
    
    throw new ApiError("Invalid session", ERROR_CODES.UNAUTHORIZED);
  }

  // Workspace endpoints
  async getWorkspaces(): Promise<Workspace[]> {
    await this.mockDelay();
    
    return [
      {
        id: "ws-1",
        name: "Acme Corp",
        url_slug: "acme-corp",
        logo_url: "https://api.dicebear.com/7.x/shapes/svg?seed=acme",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        member_count: 25,
        owner_id: "user-1",
      },
    ];
  }

  // Channel endpoints
  async getChannels(workspaceId: string): Promise<Channel[]> {
    await this.mockDelay();
    
    return [
      {
        id: "ch-1",
        workspace_id: workspaceId,
        name: "general",
        description: "General discussion for the whole team",
        is_private: false,
        is_archived: false,
        created_by: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        member_count: 25,
        last_activity_at: new Date().toISOString(),
      },
      {
        id: "ch-2",
        workspace_id: workspaceId,
        name: "engineering",
        description: "Engineering team discussions",
        is_private: false,
        is_archived: false,
        created_by: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        member_count: 12,
        last_activity_at: new Date().toISOString(),
      },
      {
        id: "ch-3",
        workspace_id: workspaceId,
        name: "design",
        description: "Design team discussions",
        is_private: false,
        is_archived: false,
        created_by: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        member_count: 8,
        last_activity_at: new Date().toISOString(),
      },
    ];
  }

  async getChannel(channelId: string): Promise<Channel> {
    await this.mockDelay();
    
    const channels = await this.getChannels("ws-1");
    const channel = channels.find(ch => ch.id === channelId);
    
    if (!channel) {
      throw new ApiError("Channel not found", ERROR_CODES.NOT_FOUND);
    }
    
    return channel;
  }

  // Message endpoints
  async getMessages(channelId: string, page: number = 1): Promise<PaginatedResponse<Message>> {
    await this.mockDelay();
    
    const mockMessages: Message[] = [
      {
        id: "msg-1",
        channel_id: channelId,
        user_id: "user-2",
        content: "Hey team! Just wanted to check in on the progress of the new feature. How's everyone doing?",
        is_edited: false,
        thread_count: 3,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        updated_at: new Date(Date.now() - 3600000).toISOString(),
        user: {
          id: "user-2",
          email: "alice@teamsync.com",
          full_name: "Alice Johnson",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
          title: "Senior Developer",
          status: "online",
          last_seen_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        reactions: [
          {
            id: "react-1",
            message_id: "msg-1",
            user_id: "user-1",
            emoji: "👍",
            created_at: new Date().toISOString(),
            user: {
              id: "user-1",
              email: "demo@teamsync.com",
              full_name: "Demo User",
              avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
              status: "online",
              last_seen_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
        ],
      },
      {
        id: "msg-2",
        channel_id: channelId,
        user_id: "user-3",
        content: "Making good progress! Just finished the API endpoints. Starting on the frontend components now.",
        is_edited: false,
        thread_count: 0,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        updated_at: new Date(Date.now() - 1800000).toISOString(),
        user: {
          id: "user-3",
          email: "bob@teamsync.com",
          full_name: "Bob Smith",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
          title: "Full Stack Developer",
          status: "away",
          last_seen_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
      {
        id: "msg-3",
        channel_id: channelId,
        user_id: "user-1",
        content: "Great work everyone! Let's sync up in our standup tomorrow to review the progress.",
        is_edited: false,
        thread_count: 0,
        created_at: new Date(Date.now() - 900000).toISOString(),
        updated_at: new Date(Date.now() - 900000).toISOString(),
        user: {
          id: "user-1",
          email: "demo@teamsync.com",
          full_name: "Demo User",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
          title: "Product Manager",
          status: "online",
          last_seen_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
    ];

    return {
      data: mockMessages,
      total: mockMessages.length,
      page: 1,
      per_page: 50,
      has_more: false,
    };
  }

  async sendMessage(data: { channel_id: string; content: string }): Promise<Message> {
    await this.mockDelay(300);
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      channel_id: data.channel_id,
      user_id: "user-1",
      content: data.content,
      is_edited: false,
      thread_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: {
        id: "user-1",
        email: "demo@teamsync.com",
        full_name: "Demo User",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
        title: "Product Manager",
        status: "online",
        last_seen_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    return newMessage;
  }

  // Project endpoints
  async getProjects(workspaceId: string): Promise<Project[]> {
    await this.mockDelay();
    
    return [
      {
        id: "proj-1",
        workspace_id: workspaceId,
        name: "Website Redesign",
        description: "Complete overhaul of the company website",
        status: "active",
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        channel_id: "ch-4",
        created_by: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        progress: 45,
        task_count: {
          total: 24,
          completed: 11,
        },
        team_members: [
          {
            id: "pm-1",
            project_id: "proj-1",
            user_id: "user-1",
            role: "owner",
            joined_at: new Date().toISOString(),
            user: {
              id: "user-1",
              email: "demo@teamsync.com",
              full_name: "Demo User",
              avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
              status: "online",
              last_seen_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          },
        ],
      },
      {
        id: "proj-2",
        workspace_id: workspaceId,
        name: "Mobile App Development",
        description: "Building the mobile version of our platform",
        status: "active",
        due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        channel_id: "ch-5",
        created_by: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        progress: 20,
        task_count: {
          total: 35,
          completed: 7,
        },
        team_members: [],
      },
    ];
  }

  async createProject(data: CreateProjectFormData): Promise<Project> {
    await this.mockDelay();
    
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      workspace_id: "ws-1",
      name: data.name,
      description: data.description,
      status: "active",
      due_date: data.due_date,
      channel_id: data.create_linked_channel ? `ch-${Date.now()}` : undefined,
      created_by: "user-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      progress: 0,
      task_count: {
        total: 0,
        completed: 0,
      },
      team_members: [],
    };

    return newProject;
  }

  // Task endpoints
  async getTasks(projectId: string): Promise<Task[]> {
    await this.mockDelay();
    
    return [
      {
        id: "task-1",
        project_id: projectId,
        title: "Design homepage mockup",
        description: "Create initial mockup for the new homepage design",
        status: "in_progress",
        priority: "high",
        assignee_id: "user-2",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        labels: ["design", "frontend"],
        position: 0,
        created_by: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        assignee: {
          id: "user-2",
          email: "alice@teamsync.com",
          full_name: "Alice Johnson",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
          status: "online",
          last_seen_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        comments_count: 3,
        attachments_count: 2,
      },
      {
        id: "task-2",
        project_id: projectId,
        title: "Implement user authentication",
        description: "Set up JWT-based authentication system",
        status: "todo",
        priority: "urgent",
        assignee_id: "user-3",
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        labels: ["backend", "security"],
        position: 1,
        created_by: "user-1",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        assignee: {
          id: "user-3",
          email: "bob@teamsync.com",
          full_name: "Bob Smith",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
          status: "away",
          last_seen_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        comments_count: 1,
        attachments_count: 0,
      },
    ];
  }

  async createTask(data: CreateTaskFormData): Promise<Task> {
    await this.mockDelay();
    
    const newTask: Task = {
      id: `task-${Date.now()}`,
      project_id: data.project_id,
      title: data.title,
      description: data.description,
      status: "todo",
      priority: data.priority || "medium",
      assignee_id: data.assignee_id,
      due_date: data.due_date,
      labels: [],
      position: 0,
      created_by: "user-1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      comments_count: 0,
      attachments_count: 0,
    };

    return newTask;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    await this.mockDelay();
    
    // Mock implementation - return updated task
    const task = (await this.getTasks("proj-1"))[0];
    return {
      ...task,
      ...updates,
      updated_at: new Date().toISOString(),
    };
  }

  // Notification endpoints
  async getNotifications(): Promise<Notification[]> {
    await this.mockDelay();
    
    return [
      {
        id: "notif-1",
        user_id: "user-1",
        type: "mention",
        title: "Alice mentioned you",
        description: "in #general: @demo what do you think about...",
        is_read: false,
        action_url: "/app/channel/ch-1",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "notif-2",
        user_id: "user-1",
        type: "assignment",
        title: "New task assigned",
        description: "Bob assigned 'Review API documentation' to you",
        is_read: false,
        action_url: "/app/project/proj-1/task/task-3",
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ];
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await this.mockDelay(200);
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.mockDelay(200);
  }

  // User endpoints
  async searchUsers(query: string): Promise<User[]> {
    await this.mockDelay();
    
    const allUsers: User[] = [
      {
        id: "user-1",
        email: "demo@teamsync.com",
        full_name: "Demo User",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
        title: "Product Manager",
        status: "online",
        last_seen_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "user-2",
        email: "alice@teamsync.com",
        full_name: "Alice Johnson",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
        title: "Senior Developer",
        status: "online",
        last_seen_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "user-3",
        email: "bob@teamsync.com",
        full_name: "Bob Smith",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
        title: "Full Stack Developer",
        status: "away",
        last_seen_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return allUsers.filter(
      user =>
        user.full_name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export const apiClient = new ApiClient();