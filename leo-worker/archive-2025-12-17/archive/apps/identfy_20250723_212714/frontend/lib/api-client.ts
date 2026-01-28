// NextAuth is used for authentication

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  }

  private async getAuthToken(): Promise<string | null> {
    // In a real implementation, this would get the JWT token from NextAuth
    // For now, we'll use a mock token for demo purposes
    if (typeof window !== "undefined") {
      // This would normally be retrieved from NextAuth session
      const token = localStorage.getItem("demo-token");
      return token || null;
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };

      // Get fresh token from Clerk for each request
      const token = await this.getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = response.ok ? await response.json() : null;

      if (!response.ok) {
        switch (response.status) {
          case 401:
            this.handleUnauthorized();
            throw new ApiError("Authentication required", "UNAUTHORIZED", 401);
          case 403:
            throw new ApiError("You do not have permission to perform this action", "FORBIDDEN", 403);
          case 404:
            throw new ApiError("The requested resource was not found", "NOT_FOUND", 404);
          case 429:
            const retryAfter = response.headers.get("Retry-After");
            throw new ApiError(`Rate limited. Try again in ${retryAfter} seconds`, "RATE_LIMITED", 429);
          case 500:
          case 502:
          case 503:
          case 504:
            throw new ApiError("Server error. Please try again later.", "SERVER_ERROR", response.status);
          default:
            throw new ApiError(data?.detail || "An error occurred", "UNKNOWN_ERROR", response.status);
        }
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Network error. Please check your connection.", "NETWORK_ERROR");
    }
  }

  private handleUnauthorized() {
    if (typeof window !== "undefined") {
      window.location.href = "/sign-in";
    }
  }

  // Auth endpoints
  async signIn(email: string, password: string) {
    // Demo authentication check
    if (email === "demo@example.com" && password === "DemoRocks2025!") {
      return {
        access_token: "demo-token",
        user: {
          id: "demo-user",
          email: "demo@example.com",
          name: "Demo User",
          role: "admin",
        },
      };
    }
    
    return this.request<any>("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  // Workflow endpoints
  async getWorkflows() {
    return this.request<any[]>("/workflows");
  }

  async getWorkflow(id: string) {
    return this.request<any>(`/workflows/${id}`);
  }

  async createWorkflow(data: any) {
    return this.request<any>("/workflows", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateWorkflow(id: string, data: any) {
    return this.request<any>(`/workflows/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteWorkflow(id: string) {
    return this.request<void>(`/workflows/${id}`, {
      method: "DELETE",
    });
  }

  // Case endpoints
  async getCases(filters?: any) {
    const params = new URLSearchParams(filters).toString();
    return this.request<any[]>(`/cases${params ? `?${params}` : ""}`);
  }

  async getCase(id: string) {
    return this.request<any>(`/cases/${id}`);
  }

  async updateCase(id: string, data: any) {
    return this.request<any>(`/cases/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async approveCase(id: string, data: any) {
    return this.request<any>(`/cases/${id}/approve`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async rejectCase(id: string, data: any) {
    return this.request<any>(`/cases/${id}/reject`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Analytics endpoints
  async getAnalytics(params?: any) {
    const queryParams = new URLSearchParams(params).toString();
    return this.request<any>(`/analytics${queryParams ? `?${queryParams}` : ""}`);
  }

  async getBenchmarks(industry?: string) {
    const params = industry ? `?industry=${industry}` : "";
    return this.request<any>(`/analytics/benchmarks${params}`);
  }

  // Settings endpoints
  async getTeamMembers() {
    return this.request<any[]>("/settings/team");
  }

  async inviteTeamMember(data: any) {
    return this.request<any>("/settings/team/invite", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTeamMember(id: string, data: any) {
    return this.request<any>(`/settings/team/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteTeamMember(id: string) {
    return this.request<void>(`/settings/team/${id}`, {
      method: "DELETE",
    });
  }

  // API Keys
  async getApiKeys() {
    return this.request<any[]>("/settings/api-keys");
  }

  async createApiKey(data: any) {
    return this.request<any>("/settings/api-keys", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async revokeApiKey(id: string) {
    return this.request<void>(`/settings/api-keys/${id}`, {
      method: "DELETE",
    });
  }

  // Webhooks
  async getWebhooks() {
    return this.request<any[]>("/settings/webhooks");
  }

  async createWebhook(data: any) {
    return this.request<any>("/settings/webhooks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateWebhook(id: string, data: any) {
    return this.request<any>(`/settings/webhooks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteWebhook(id: string) {
    return this.request<void>(`/settings/webhooks/${id}`, {
      method: "DELETE",
    });
  }

  async testWebhook(id: string) {
    return this.request<any>(`/settings/webhooks/${id}/test`, {
      method: "POST",
    });
  }
}

export const apiClient = new ApiClient();