// API client for ComplykOrt backend
// Handles authentication, user management, and dashboard data

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  active?: boolean;
  organizations?: Array<{ orgId: string; role: string }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface DashboardData {
  user: User;
  stats: {
    totalControls: number;
    completedControls: number;
    pendingEvidences: number;
    upcomingAudits: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
  controlsOverview: Array<{
    id: string;
    name: string;
    category: string;
    status: 'compliant' | 'non-compliant' | 'pending';
    lastUpdated: string;
  }>;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  // Token management
  public getToken(): string | null {
    return this.token;
  }
  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('auth_token', token);
      else localStorage.removeItem('auth_token');
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    return headers;
  }

  // --- Auth ---
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, message: data.message || 'Login failed' };
      this.setToken(data.data.token);
      return { success: true, data: { user: data.data.user, token: data.data.token } };
    } catch (e) {
      return { success: false, message: 'Network error during login' };
    }
  }

  async logout(): Promise<void> { this.setToken(null); }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    if (!this.token) return { success: false, message: 'No authentication token' };
    try {
      const res = await fetch(`${this.baseURL}/api/auth/me`, { headers: this.getHeaders() });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Failed to get user info' };
      return { success: true, data: data.data as User };
    } catch (e) {
      return { success: false, message: 'Network error getting user info' };
    }
  }

  // --- Dashboard ---
  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    try {
      const res = await fetch(`${this.baseURL}/api/dashboard/overview`, { headers: this.getHeaders() });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Failed to load dashboard data' };
      return { success: true, data: data.data };
    } catch (e) {
      return { success: false, message: 'Network error loading dashboard' };
    }
  }

  // --- Users ---
  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const res = await fetch(`${this.baseURL}/api/users`, { headers: this.getHeaders() });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Failed to fetch users' };
      return { success: true, data: data.data as User[] };
    } catch (e) {
      return { success: false, message: 'Network error fetching users' };
    }
  }

  async createUser(payload: { email: string; name: string; role: string }): Promise<ApiResponse<User>> {
    try {
      const res = await fetch(`${this.baseURL}/api/users`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Failed to create user' };
      return { success: true, data: data.data as User };
    } catch (e) {
      return { success: false, message: 'Network error creating user' };
    }
  }

  async updateUser(id: string, payload: Partial<Pick<User, 'name' | 'role' | 'active'>>): Promise<ApiResponse<User>> {
    try {
      const res = await fetch(`${this.baseURL}/api/users/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Failed to update user' };
      return { success: true, data: data.data as User };
    } catch (e) {
      return { success: false, message: 'Network error updating user' };
    }
  }

  async deactivateUser(id: string): Promise<ApiResponse<User>> {
    try {
      const res = await fetch(`${this.baseURL}/api/users/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Failed to deactivate user' };
      return { success: true, data: data.data as User };
    } catch (e) {
      return { success: false, message: 'Network error deactivating user' };
    }
  }


  // --- Roles ---
  async getMyRoles(): Promise<ApiResponse<{ rolesByOrg: Array<{ orgId: string; role: string }> }>> {
    if (!this.token) return { success: false, message: 'No authentication token' };
    try {
      const res = await fetch(`${this.baseURL}/api/me/roles`, { headers: this.getHeaders() });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Failed to get roles' };
      return { success: true, data: { rolesByOrg: data.rolesByOrg || [] } };
    } catch (e) {
      return { success: false, message: 'Network error getting roles' };
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try { const res = await fetch(`${this.baseURL}/health`); return res.ok; } catch { return false; }
  }

  async deleteUserHard(id: string): Promise<ApiResponse<{ removed: boolean }>> {
    try {
      const res = await fetch(`${this.baseURL}/api/users/${id}?hard=true`, { method: 'DELETE', headers: this.getHeaders() });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.message || 'Failed to delete user' };
      return { success: true, data: { removed: !!data.removed } } as any;
    } catch (e) {
      return { success: false, message: 'Network error deleting user' };
    }
  }

}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://95.217.190.154:3001';
export const api = new ApiClient(API_BASE_URL);
